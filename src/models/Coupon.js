const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  type: { type: String, enum: ['cart-wise', 'product-wise', 'bxgy'], required: true },
  details: { type: Object, required: true }, 
  expirationDate: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
});

// ttl index to automaticlly delete document after expiration date
CouponSchema.index(
  { expirationDate: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { expirationDate: { $exists: true, $ne: null } } }
);

// added index to optimize quering
CouponSchema.index({ type: 1 });
CouponSchema.index({ isActive: 1 });

module.exports = mongoose.model('Coupon', CouponSchema);