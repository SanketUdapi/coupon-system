const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  type: { type: String, enum: ['cart-wise', 'product-wise', 'bxgy'], required: true },
  details: { type: Object, required: true }, 
  expirationDate: { type: Date },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Coupon', CouponSchema);