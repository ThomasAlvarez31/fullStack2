// models/Product.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    desc: { type: String },
    img: { type: String },
    stock: { type: Number, default: 0 }
});

module.exports = mongoose.model('Product', productSchema);