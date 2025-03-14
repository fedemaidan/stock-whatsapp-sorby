# stock-whatsapp-sorby
@ Para ejecutar una migracion debemos encontrarnos sobre la carpeta src
cd src

1) migracion:
Comandos de migracion para la base de datos (utiliza la carpeta raiz CSV para inicializar las base de datos con valores por defecto)
npx sequelize-cli db:migrate                                            # (iniciar migracion de la base de datos)
npx sequelize-cli db:migrate:undo                                       # (Eliminar la ultima migracion realizada)

@ Volvemos a la carpeta base
cd..

2) ejecutar archivo del sistema
1. nodemon index.js (ejecutar bajo la libreria nodemon *SOLO PARA AMBIENTES CONTROLADO, NO PRODUCCION*)
2. npm start (inicializacion normal)

