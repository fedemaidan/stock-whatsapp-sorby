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



Inicializacion de datos:
docker build -t stockremito .
En una consola separada correr el contenedor creando los 2 volumenes Datos y codigo.
	docker build -t stockremito .
	docker run --name=Cstockremito -v ${PWD}/src:/app/src -v ${PWD}/CSV:/app/CSV -v ${PWD}/auth_info:/app/auth_info -p 3000  stockremito
En otra consola ejecutamos los siguientes comandos
docker exec -it Cstockremito bash      (Acceder a la consola del contenedor)
export GOOGLE_CREDENTIALS=  (Pasar como parametro la credencial de google)
export GOOGLE_SHEET_ID="1N20iIt-mygURiFPt2GpqARhtt9hWU9aHPaFJQcN4Vgo"  (Pasar como parametro el id de la google sheet a utilizar)
node ./src/Comandos/InicializarTodo.js     (Ejecutar el comando que crea y sube al sheet Obras, Materiales y Movimientos)


node ./src/Comandos/FuncionExtraerMat.js




---- MIGRAR A OTRA BD
node FuncionExtraerMat.js
node FuncionExtraerObra.js
node FuncionExtraerPed.js
node FuncionExtraerMov.js

node injectmat.js



REVISAR REPETIDOS:
SELECT nombre, COUNT(*) AS cantidad
FROM materiales
GROUP BY nombre
HAVING COUNT(*) > 1;



---- MIGRAR A OTRA BD en PROD
NODE_ENV=production node FuncionExtraerMat.js
NODE_ENV=production node FuncionExtraerObra.js
NODE_ENV=production node FuncionExtraerPed.js
NODE_ENV=production node FuncionExtraerMov.js

NODE_ENV=production node injectmat.js
