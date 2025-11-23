// models/Order.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    // ID de la orden o Buy Order de Transbank
    orderId: { type: String, required: true, unique: true }, 
    fecha: { type: Date, default: Date.now },
    
    // Almacena la info del cliente que viene del token JWT
    cliente: { type: Object, required: true }, 
    
    // Lista de productos comprados
    productos: { type: Array, required: true },
    
    // Monto total de la orden
    total: { type: Number, required: true },
    
    // Estado de la transacción
    status: { 
        type: String, 
        enum: ['Pendiente', 'Pagada', 'Fallida'], 
        default: 'Pendiente' 
    },
    
    // Token temporal que entrega Transbank (CRÍTICO para la confirmación)
    transbankToken: { type: String } 
});

module.exports = mongoose.model('Order', orderSchema);