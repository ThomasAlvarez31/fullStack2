// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Almacenará el HASH de bcrypt
    run: { type: String, required: false }, // Agregamos el RUN como opcional
    role: { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);