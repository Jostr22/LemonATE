# Fotos reales del menú

Las fotos del catálogo ya están integradas. Todas provienen de las imágenes
originales del negocio y fueron recortadas y optimizadas para la web:

- Formato: **WebP** (con respaldo visual en cualquier navegador moderno).
- Tamaño: **600 × 750 px** (proporción 4:5), salvo los combos, que son
  collages de 900 × 1125 px.
- Peso total del catálogo: **≈ 870 KB** para 22 productos.
- Ubicación: `frontend/public/products/fotos/`.

| Archivo | Producto |
|---|---|
| `limonada-maracumango.webp` | Limonada maracumango (maracuyá + mango) |
| `limonada-brasilena.webp` | Limonada brasileña |
| `limonada-natural.webp` | Limonada natural |
| `limonada-hierbabuena.webp` | Limonada de hierbabuena |
| `limonada-fresa.webp` | Limonada de fresa |
| `limonada-frutos-rojos.webp` | Limonada de frutos rojos |
| `limonada-brasilena-mora.webp` | Limonada brasileña de mora |
| `limonada-cerezada.webp` | Limonada cerezada |
| `limonada-sandia.webp` | Limonada de sandía |
| `limonada-coco.webp` | Limonada de coco |
| `limonada-panela.webp` | Limonada de panela |
| `frappe-limon.webp` | Frappé de limón |
| `frappe-caramelo.webp` | Frappé de caramelo y limón |
| `pie-limon.webp` | Pie de limón |
| `cheesecake-limon.webp` | Cheesecake de limón |
| `brownie-citrico.webp` | Brownie cítrico |
| `cupcake-limon.webp` | Cupcake de limón |
| `galletas-limon.webp` | Galletas de limón |
| `mousse-limon.webp` | Mousse de limón |
| `combo-duo.webp` | Combo Dúo (collage) |
| `combo-fiesta.webp` | Combo Fiesta (collage) |
| `combo-oficina.webp` | Combo Oficina (collage) |

## Fotos de apoyo y marca

En `frontend/public/brand/`:

| Archivo | Uso |
|---|---|
| `logo-wordmark.webp` | Wordmark del header y del footer |
| `logo-lemonate.webp` | Logo completo con transparencia (hero y página de marca) |
| `hero-limonada.webp` | Foto principal del hero |
| `ambiente-1.webp` | Ambiente de marca (home) |
| `ambiente-2.webp` | Ambiente de marca (home) |

Las fotos de categoría en la home reutilizan fotos reales del catálogo, con un
degradado de color de la marca encima. Así se evita mostrar capturas de otra
web o textos en inglés incrustados en la imagen.

## Cómo cambiar una foto

1. Prepara la imagen en proporción **4:5** (por ejemplo 1200 × 1500 px) y
   expórtala en WebP o JPG.
2. Guárdala en `frontend/public/products/fotos/` con un nombre sin espacios.
3. Entra al panel de administración, abre el producto y cambia el campo
   **Ruta o URL de imagen** por, por ejemplo:
   `products/fotos/limonada-natural.webp`.
4. Guarda los cambios.

También se pueden actualizar todas de una vez en
[`shared/catalog.js`](../../shared/catalog.js), que centraliza el catálogo y la
función `img(slug)`.

> Los combos son composiciones hechas con las mismas fotos de producto. Si
> cambias una foto y quieres que el combo la refleje, reemplaza también el
> archivo `combo-*.webp` por una composición nueva.

## Recomendaciones para fotos futuras

- Luz natural o difusa, sin sombras duras.
- Fondo limpio (madera, mármol claro, pared neutra).
- Producto protagonista y centrado; deja aire arriba y abajo para el recorte 4:5.
- Evita textos, marcas de agua y filtros muy saturados.
- Una foto por producto; si tienes varias, usa la más nítida.
