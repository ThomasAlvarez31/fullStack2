const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      qty: {
        type: Number,
        default: 1
      }
    }
  ]
});

module.exports = mongoose.model('Cart', CartSchema);