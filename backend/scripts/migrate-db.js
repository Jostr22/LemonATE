/**
 * Copia las colecciones de una base de datos a otra conservando índices,
 * sin borrar el origen (queda como respaldo).
 *
 * Uso (desde la carpeta backend):
 *   node scripts/migrate-db.js --from test --to lemonate           → solo informe
 *   node scripts/migrate-db.js --from test --to lemonate --apply   → copia
 *
 * La copia es idempotente: los documentos se comparan por `_id` y solo se
 * reemplazan si el origen es más reciente (`updatedAt`). Nunca borra documentos
 * del destino.
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const args = process.argv.slice(2);

function flag(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const from = flag('from', 'test');
const to = flag('to', 'lemonate');
const apply = args.includes('--apply');
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Falta MONGODB_URI en el entorno (revisa backend/.env).');
  process.exit(1);
}
if (from === to) {
  console.error('El origen y el destino deben ser bases distintas.');
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

const isNewer = (source, target) => {
  if (!target) return true;
  if (!source.updatedAt) return false;
  if (!target.updatedAt) return true;
  return new Date(source.updatedAt) > new Date(target.updatedAt);
};

async function copyCollection(name) {
  const src = client.db(from).collection(name);
  const dst = client.db(to).collection(name);

  const total = await src.countDocuments();
  const docs = await src.find({}).toArray();

  let copied = 0;
  let skipped = 0;

  for (let start = 0; start < docs.length; start += 200) {
    const batch = docs.slice(start, start + 200);
    const ids = batch.map((doc) => doc._id);
    const existing = await dst
      .find({ _id: { $in: ids } }, { projection: { updatedAt: 1 } })
      .toArray();
    const existingById = new Map(existing.map((doc) => [String(doc._id), doc]));

    const operations = [];
    for (const doc of batch) {
      const target = existingById.get(String(doc._id));
      if (isNewer(doc, target)) {
        operations.push({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } });
      } else {
        skipped += 1;
      }
    }

    if (apply && operations.length > 0) {
      await dst.bulkWrite(operations, { ordered: false });
    }
    copied += operations.length;
  }

  // `createCollection` garantiza que la colección exista aunque esté vacía.
  if (apply) await client.db(to).createCollection(name).catch(() => {});

  const indexes = (await src.indexes()).filter((index) => index.name !== '_id_');
  if (apply && indexes.length > 0) {
    await dst.createIndexes(indexes);
  }

  return { name, total, copied, skipped, indexes: indexes.length };
}

try {
  await client.connect();
  const collections = (await client.db(from).listCollections().toArray())
    .map((info) => info.name)
    .filter((name) => !name.startsWith('system.'))
    .sort();

  console.log(`Origen : ${from}`);
  console.log(`Destino: ${to}`);
  console.log(`Modo   : ${apply ? 'COPIA REAL' : 'simulación (añade --apply para copiar)'}`);
  console.log('');

  for (const name of collections) {
    const result = await copyCollection(name);
    console.log(
      `${apply ? '[copiado]' : '[simulado]'} ${result.name}: ` +
        `${result.total} documentos en origen, ${result.copied} por escribir, ` +
        `${result.indexes} índices`
    );
  }

  console.log('');
  console.log(apply ? 'Copia terminada. El origen se conserva intacto.' : 'No se escribió nada.');
} catch (error) {
  console.error('Error:', error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
