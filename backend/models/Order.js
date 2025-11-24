const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    orderId: { type: String, required: true, unique: true }, 
    fecha: { type: Date, default: Date.now },
    cliente: { type: Object, required: true }, 
    productos: { type: Array, required: true },
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pendiente', 'Pagada', 'Fallida'], 
        default: 'Pendiente' 
    },
    transbankToken: { type: String } 
});

module.exports = mongoose.model('Order', orderSchema);