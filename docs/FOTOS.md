# Fotos reales del menú

Para reemplazar las ilustraciones por fotos reales de los productos, envía las imágenes
con estos nombres. Lo ideal es **una foto por producto**, cuadrada o 4:3, de al menos
**1200 px de ancho**, con buena luz, fondo limpio y sin textos ni marcas de agua.

Guarda los archivos en:

```
frontend/public/products/fotos/
```

| Archivo sugerido | Producto |
|---|---|
| `limonada-natural.jpg` | Limonada natural |
| `limonada-hierbabuena.jpg` | Limonada de hierbabuena |
| `limonada-coco.jpg` | Limonada de coco |
| `limonada-panela.jpg` | Limonada de panela |
| `limonada-fresa.jpg` | Limonada de fresa |
| `limonada-frutos-rojos.jpg` | Limonada de frutos rojos |
| `limonada-maracuya.jpg` | Limonada de maracuyá |
| `limonada-mango.jpg` | Limonada de mango |
| `frappe-limon.jpg` | Frappé de limón |
| `frappe-caramelo.jpg` | Frappé de caramelo y limón |
| `granizado-mora.jpg` | Granizado de mora |
| `granizado-limon.jpg` | Granizado de limón |
| `pie-limon.jpg` | Pie de limón |
| `cheesecake-limon.jpg` | Cheesecake de limón |
| `tartaleta-limon.jpg` | Tartaleta de limón |
| `galletas-limon.jpg` | Galletas de limón |
| `brownie-citrico.jpg` | Brownie cítrico |
| `cupcake-limon.jpg` | Cupcake de limón |
| `mousse-limon.jpg` | Mousse de limón |
| `combo-duo.jpg` | Combo Dúo |
| `combo-fiesta.jpg` | Combo Fiesta |
| `combo-oficina.jpg` | Combo Oficina |

## Cómo asignarlas

1. Copia las fotos en la carpeta indicada.
2. Entra al panel de administración, abre cada producto y cambia el campo
   **Ruta o URL de imagen** por, por ejemplo:
   `products/fotos/limonada-natural.jpg`.
3. Guarda los cambios.

También se pueden reemplazar todas de una vez en
[`shared/catalog.js`](../../shared/catalog.js), cambiando la función `img` para que
devuelva `products/fotos/${slug}.jpg`.

> Si solo tienes fotos de algunos productos, envíalas igual: las demás siguen con la
> ilustración actual y se pueden cambiar después sin tocar el código.
