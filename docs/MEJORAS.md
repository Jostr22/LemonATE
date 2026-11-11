# Plan de producción y mejoras

Este documento resume lo que ya quedó listo en la tienda y las mejoras recomendadas
para operar LemonATE como un negocio real, no como una demo.

## Lo que ya se corrigió

- **Asistente LemonATE AI**: responde horarios, estado de apertura, domicilios y
  tarifas, medios de pago, seguimiento, cancelaciones, cambios de pedido, ubicación,
  recogida, eventos, alergias, dieta, tamaños, extras, presupuesto, recomendaciones,
  combos, disponibilidad y preguntas de producto. No inventa precios ni existencias.
- **Existencias privadas**: el catálogo público ya no expone la cantidad exacta.
  Solo muestra `Disponible`, `Últimas unidades` o `Agotado`. El administrador sigue
  viendo el stock real.
- **Extras coherentes**: se reemplazaron opciones sin relación con el producto por
  frutas frescas, limón extra, hierbabuena y crema batida, agrupadas por categoría.
- **Carrito legible**: las personalizaciones se muestran como texto comprensible
  (`16 oz · Hielo normal · Sin azúcar · Fresa`) en lugar de IDs internos.
- **Textos de producción**: se retiraron avisos de demo, credenciales visibles,
  direcciones provisionales y datos de pago ficticios de la interfaz pública.
- **Pagos manuales transparentes**: los datos de pago se comparten por WhatsApp al
  confirmar el pedido; “tarjeta” se presenta como pago contra entrega.

## Prioridad 0 — antes de abrir al público

1. **Desplegar el backend y conectar MongoDB Atlas**
   - Crear el servicio en Render con `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`,
     `ADMIN_PASSWORD` y `CORS_ORIGIN`.
   - Ejecutar `npm run seed` una sola vez y cambiar la contraseña del administrador.
   - Configurar `VITE_API_URL` en el frontend y volver a desplegar.

2. **Habilitar GitHub Pages**
   - El workflow ya existe, pero Pages debe activarse en
     `Settings → Pages → Source: GitHub Actions`.
   - Verificar el dominio publicado y añadir `CORS_ORIGIN` con esa URL exacta.

3. **Pasarela de pagos real**
   - Integrar Wompi (Nequi, tarjetas, PSE) o Mercado Pago.
   - Usar webhooks firmados para confirmar el pago; nunca confiar en el navegador.
   - Mantener el pago contra entrega como alternativa operativa.
   - Definir conciliación diaria y política de reembolsos.

4. **Notificaciones transaccionales**
   - WhatsApp Business API o Twilio para confirmar pedido, cambio de estado y entrega.
   - Correo transaccional con Resend o SendGrid para el recibo.
   - Enlaces de seguimiento con código y PIN, sin exponer datos personales.

5. **Páginas legales y confianza**
   - Política de privacidad y tratamiento de datos (Ley 1581 de Colombia).
   - Términos y condiciones, política de cambios, cancelaciones y reembolsos.
   - Datos del responsable, dirección y canales de atención.
   - Aviso de alergias y manejo de ingredientes.

6. **Seguridad y operación del backend**
   - Revisar rate limiting en login, registro, pedidos y AI.
   - Validar y sanitizar todos los campos con Zod; no confiar en precios del cliente.
   - Rotar `JWT_SECRET`, usar contraseñas robustas y limitar intentos de login.
   - Configurar backups automáticos de Atlas y probar una restauración.
   - Añadir monitoreo de errores (Sentry) y alertas de caída (Better Stack o similar).

## Prioridad 1 — primeras semanas de operación

7. **Panel administrativo más seguro**
   - Roles separados: administrador, operador de pedidos y atención.
   - Registro de auditoría para cambios de precio, stock y estado de pedidos.
   - Confirmación explícita antes de desactivar productos o cambiar precios.
   - Exportación de pedidos y ventas a CSV.

8. **Inventario y disponibilidad**
   - Definir umbral de “últimas unidades” configurable por producto.
   - Evitar sobreventa con reservas temporales al crear el pedido.
   - Alertas cuando un producto quede por debajo de un mínimo.

9. **Entrega y cobertura**
   - Zonas de domicilio configurables por barrio, no solo por kilómetros.
   - Horarios especiales, festivos y cierres temporales desde el panel.
   - Seguimiento del repartidor o integración con una plataforma de entregas.
   - Opción de recogida con franja horaria.

10. **Experiencia de compra**
    - Guardar direcciones y métodos de pago para clientes recurrentes.
    - Cupones y combos configurables desde el panel.
    - Recuperación de carrito abandonado por WhatsApp o correo.
    - Estado vacío y mensajes de error más claros en checkout.

11. **SEO y presencia**
    - Metadatos por producto y por categoría.
    - `sitemap.xml`, `robots.txt`, datos estructurados de negocio local y producto.
    - Imágenes Open Graph para compartir en WhatsApp e Instagram.
    - Página de preguntas frecuentes pública, alineada con las respuestas del asistente.

12. **Calidad y rendimiento**
    - CI que ejecute build, pruebas del backend y e2e en cada push.
    - Lighthouse en móvil: imágenes, fuentes y JavaScript por debajo de lo necesario.
    - Cache de catálogo y compresión en el backend.
    - Pruebas de accesibilidad con teclado y lector de pantalla.

## Prioridad 2 — crecimiento

13. **Fidelización**
    - Cuenta con historial, favoritos y pedidos repetidos.
    - Programa de puntos o cupones por recurrencia.
    - Reseñas verificadas por pedido.

14. **Datos y decisiones**
    - Analítica de eventos: producto visto, agregado al carrito, checkout iniciado y compra.
    - Reporte de productos más vendidos, ticket promedio y horas de mayor demanda.
    - Predicción simple de inventario según ventas históricas.

15. **Operación comercial**
    - Proveedores y costos por producto para calcular margen real.
    - Control de empaques y consumo de insumos.
    - Protocolo de atención para pedidos retrasados, cancelaciones y quejas.
    - Manual breve de respuestas para WhatsApp, alineado con LemonATE AI.

## Recomendaciones técnicas concretas

### Frontend

- Mantener una sola fuente de verdad para precios, extras y reglas de negocio en
  `shared/`.
- Añadir pruebas de componentes para carrito, checkout y asistente.
- Separar el catálogo público del panel administrativo en dos consultas explícitas.
- Usar `loading="lazy"` y `srcset` en todas las imágenes de producto.
- Evitar contenido crítico dependiente de `localStorage`.

### Backend

- Añadir un endpoint de disponibilidad pública que devuelva solo estados, nunca
  cantidades.
- Implementar idempotencia en la creación de pedidos para evitar duplicados.
- Firmar webhooks de pago y registrar el identificador de la transacción.
- Añadir índices para búsquedas por categoría, estado y fecha.
- Documentar la API con OpenAPI y mantener ejemplos actualizados.

### Operación

- Definir un número de WhatsApp Business exclusivo para pedidos.
- Tener una plantilla de mensajes para pedido recibido, pago confirmado, en camino
  y entregado.
- Acordar tiempos de respuesta y un responsable por turno.
- Revisar semanalmente stock, ventas y quejas.

## Riesgos actuales

- Sin pasarela real, la confirmación de pago sigue siendo manual.
- Sin notificaciones automáticas, la operación depende de WhatsApp manual.
- Sin páginas legales, no conviene abrir al público con datos reales.
- Sin monitoreo ni backups verificados, un fallo puede afectar pedidos y ventas.
- El modo local del frontend sigue existiendo para desarrollo; en producción debe
  configurarse siempre `VITE_API_URL`.
