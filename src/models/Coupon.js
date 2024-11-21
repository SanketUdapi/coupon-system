const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  type: { type: String, enum: ['cart-wise', 'product-wise', 'bxgy'], required: true },
  details: {
    discount: { type: Number },
    // for cart-wise
    threshold: { type: Number }, 
    // for product-wise
    product_id: { type: String }, 
    // for bxgy
    buy_products: { type: [{
      product_id: { type: String, required: true },
      quantity: { type: Number, required: true },
    }], default:[] }, 
    get_products: { type: [{
      product_id: { type: String, required: true },
      quantity: { type: Number, required: true },
    }
    ], default: [] },
    repition_limit: { type: Number }, 
  }, 
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