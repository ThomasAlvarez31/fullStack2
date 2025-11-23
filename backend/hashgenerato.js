const bcrypt = require('bcryptjs');

// La contraseña que queremos hashear
const password = '1234'; 

// Generamos el hash
bcrypt.hash(password, 10)
    .then(hash => {
        console.log("-----------------------------------------");
        console.log("¡NUEVO HASH GENERADO! (Úsalo en MongoDB):");
        console.log(hash);
        console.log("-----------------------------------------");
    })
    .catch(err => {
        console.error("Error al hashear:", err);
    });