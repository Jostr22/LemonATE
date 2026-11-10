# LemonATE — «Exprime el momento»

Tienda virtual de limonadas, bebidas especiales, postres y combos derivados del limón.
Proyecto final del programa de desarrollo web: aplicación full stack con React, Express,
MongoDB Atlas y un asistente basado en reglas llamado **LemonATE AI**.

> Los precios, direcciones, teléfonos y datos de pago incluidos son **provisionales y de
> demostración**. El administrador puede cambiarlos desde el panel.

## Estructura

```
LemonATE/
├── frontend/        React + Vite (se publica en GitHub Pages)
├── backend/         Node.js + Express + MongoDB Atlas (se publica en Render)
├── docs/            Documentación académica, arquitectura y guía de exposición
└── index.html       Redirección a la landing publicada
```

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Una base de datos MongoDB Atlas (o MongoDB local)

## Ejecución local

### Prueba rápida (Fase 0, sin backend)

La tienda funciona sin MongoDB ni backend gracias al modo demostración. Desde la
carpeta raíz del proyecto:

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador. Si `frontend/.env` no existe o no
define `VITE_API_URL`, la app arranca automáticamente en modo demostración y
guarda los datos en el `localStorage` del navegador.

> Importante: los comandos deben ejecutarse en la carpeta indicada. Si ves
> `npm error Missing script: "dev"`, estás en una carpeta que no tiene ese script:
> usa la raíz del proyecto (como arriba) o entra primero en `frontend/`.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # en Windows: copy .env.example .env
# Edita .env con tu MONGODB_URI y tus secretos
npm run seed              # carga catálogo, configuración y administrador
npm run dev               # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

En `.env` del frontend:

- `VITE_API_URL=http://localhost:4000/api` para usar el backend real.
- `VITE_DEMO_MODE=true` para que la tienda funcione sin backend usando
  almacenamiento local del navegador (modo demostración para GitHub Pages).

## Despliegue

| Parte | Plataforma | Notas |
|---|---|---|
| Frontend | GitHub Pages | `npm run build` en `frontend/`, base `./`. El workflow `.github/workflows/deploy.yml` lo automatiza. |
| Backend | Render | Web Service con `rootDir: backend`, build `npm install`, start `npm start`. Variables de entorno en el panel de Render. |
| Base de datos | MongoDB Atlas | Cadena `MONGODB_URI`. Crear usuario de base de datos con permisos de lectura/escritura. |

Antes del primer despliegue, en GitHub entra a **Settings → Pages → Build and deployment**
y elige **Source: GitHub Actions**. Si Pages no está habilitado, el workflow falla en el
paso `Configurar Pages`.

Nunca se suben al repositorio el archivo `.env`, la cadena de MongoDB ni el `JWT_SECRET`.

## Documentación

- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — decisiones técnicas y diagramas.
- [`docs/DOCUMENTACION.md`](docs/DOCUMENTACION.md) — documento académico completo.
- [`docs/GUIA_EXPOSICION.md`](docs/GUIA_EXPOSICION.md) — guion de defensa y preguntas del profesor.
- [`docs/FOTOS.md`](docs/FOTOS.md) — catálogo de fotos reales, medidas y cómo reemplazarlas.

## Estado del proyecto

Ver la sección «Estado y limitaciones» en `docs/DOCUMENTACION.md`. El proyecto se
desarrolla por etapas y cada etapa se registra en un commit.
