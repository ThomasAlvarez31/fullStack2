
Pauperrimos - React (Entrega Parcial 2)
--------------------------------------

Contenido:
- Proyecto React scaffold (sin node_modules). Estructura de componentes, páginas, y data.js (localStorage).
- Admin pages: /admin, /admin/productos, /admin/usuarios (CRUD guardado en localStorage).
- Bootstrap para diseño responsive.
- Karma + Jasmine configuration + sample test under src/tests.

Para ejecutar localmente:
1. Asegúrate de tener Node.js y npm instalados.
2. En la carpeta del proyecto ejecutar:
   npm install
   npm start

Para correr pruebas (Karma + Jasmine):
   npm install
   npm test

Notas:
- El proyecto usa localStorage para persistencia (productos, usuarios, carrito).
- Para entrar como admin: ir a /login y usar un correo que empiece con 'admin@' (ej: admin@duoc.cl).
