const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    desc: { type: String },
    img: { type: String },
    stock: { type: Number, default: 0 }
});

// --- EL TRUCO DE MAGIA ---
// Esto convierte _id a id automáticamente para que React no falle
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id; // Crea la propiedad id
    delete ret._id;   // Borra la _id original
  }
});

module.exports = mongoose.model('Product', productSchema);