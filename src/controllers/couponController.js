const Coupon = require('../models/Coupon');

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const { type, details, expirationDate, isActive } = req.body;
    if (!type || !details) {
      return res.status(400).json({ message: "Type and details are required." });
    }

    let expiration = undefined;
    if (expirationDate) {
      const parsedExpirationDate = new Date(expirationDate);
      if (isNaN(parsedExpirationDate)) {
        return res.status(400).json({ message: "Invalid expiration date format." });
      }
      expiration = parsedExpirationDate;
    }

    const coupon = new Coupon({ type, details, expirationDate, isActive });

    await coupon.save();

    res.status(201).json({ message: "Coupon created successfully.", coupon });
  } catch (err) {
    res.status(500).json({ message: "Failed to create coupon.", error: err.message });
  }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    let { page_no, page_size } = req.query;
    // added page size and page number for scalability.
    page_size = parseInt(page_size) || 10;
    page_no = parseInt(page_no) || 1;

    if (page_size < 1 || page_no < 1) {
      return res.status(400).json({ message: "Page size and page number must be greater than or equal to 1" });
    }
    if (page_size < 1 || page_no < 1){
      return res.status(400).json({ message: "Page Size and page number cannot be lesst than 1" });
    }
    const coupons = await Coupon.find().limit(page_size).skip((page_no -  1) * page_size);
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch coupons.", error: err.message });
  }
};

// Get a specific coupon by ID
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }
    res.status(200).json(coupon);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch coupon.", error: err.message });
  }
};

// Update a coupon by ID
exports.updateCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.expirationDate) {
      const parsedExpirationDate = new Date(updates.expirationDate);
      if (isNaN(parsedExpirationDate)) {
        return res.status(400).json({ message: "Invalid expiration date format." });
      }
      updates.expirationDate = parsedExpirationDate;
    }
    
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }
    res.status(200).json({ message: "Coupon updated successfully.", coupon: updatedCoupon });
  } catch (err) {
    res.status(500).json({ message: "Failed to update coupon.", error: err.message });
  }
};

// Delete a coupon by ID
exports.deleteCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    if (!deletedCoupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }
    res.status(200).json({ message: "Coupon deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete coupon.", error: err.message });
  }
};

// Fetch all applicable coupons for a given cart
exports.getApplicableCoupons = async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart.items)) {
      return res.status(400).json({ message: "Invalid cart format." });
    }

    // Extract product IDs and quantities from the cart for querying
    const cartItems = cart.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      total_price: item.quantity * item.price,
      item_price: item.price
    }));

    const cartTotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);

    // Build query to get all the relavent coupons
    const query = {
      isActive: true,
      $or: [
        { type: 'cart-wise', 'details.threshold': { $lte: cartTotal } },
        { 
          type: 'product-wise', 
          'details.product_id': { $in: cartItems.map(item => item.product_id) } 
        },
        {
          type: 'bxgy',
          'details.buy_products.product_id': { $in: cartItems.map(item => item.product_id) }
        }
      ]
    };

    // get coupons from the DB
    const coupons = await Coupon.find(query).lean();

    // Main logic to filter coupons 
    const applicableCoupons = coupons.map(coupon => {
      let discount = 0;

      if (coupon.type === 'cart-wise') {
        discount = (coupon.details.discount / 100) * cartTotal;
      } else if (coupon.type === 'product-wise') {
        // get item for which discount is applicable
        const targetItem = cartItems.find(item => item.product_id === coupon.details.product_id);
        if (targetItem) {
          discount = (coupon.details.discount / 100) * targetItem.total_price;
        }
      } else if (coupon.type === 'bxgy') {
        let buyCount = 0;
        let freeCount = 0;

        // getting cumulitive count of items from buy array
        coupon.details.buy_products.forEach(buyProduct => {
          const cartItem = cartItems.find(item => item.product_id === buyProduct.product_id);
          if (cartItem) {
            buyCount += Math.floor(cartItem.quantity / buyProduct.quantity);
          }
        });

        // handling of repitition limit and case where repitition limit is not given.
        buyCount = Math.min(buyCount, coupon.details.repition_limit || Infinity);

        if (buyCount > 0) {
          coupon.details.get_products.forEach(getProduct => {
            freeCount += buyCount * getProduct.quantity;
            const cartItem = cartItems.find(item => item.product_id === getProduct.product_id);
            if (cartItem) {
              discount += Math.min(freeCount, cartItem.quantity) * cartItem.item_price;
            }
          });
        }
      }

      return discount > 0
        ? { coupon_id: coupon._id, type: coupon.type, discount : Math.round(discount) }
        : null;
    }).filter(coupon => coupon !== null);

    res.status(200).json({ applicable_coupons: applicableCoupons });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applicable coupons.", error: err.message });
  }
};


// Apply a specific coupon to a cart
exports.applyCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart.items)) {
      return res.status(400).json({ message: "Invalid cart format." });
    }

    const coupon = await Coupon.findById(id);

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: "Coupon not found or inactive." });
    }

    let discount = 0;
    let updatedCart = JSON.parse(JSON.stringify(cart));

    if (coupon.type === 'cart-wise') {
      const cartTotal = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
      if (cartTotal > coupon.details.threshold) {
        discount = (coupon.details.discount / 100) * cartTotal;
      }
    } else if (coupon.type === 'product-wise') {
      updatedCart.items = cart.items.map(item => {
        if (item.product_id === coupon.details.product_id) {
          const itemDiscount = (coupon.details.discount / 100) * item.quantity * item.price;
          discount += itemDiscount;
          return { ...item, total_discount: itemDiscount };
        }
        return { ...item, total_discount: 0 };
      });
    } else if (coupon.type === 'bxgy') {
      let buyCount = 0;

      coupon.details.buy_products.forEach(buyProduct => {
        const cartItem = cart.items.find(item => item.product_id === buyProduct.product_id);
        if (cartItem) {
          buyCount += Math.floor(cartItem.quantity / buyProduct.quantity);
        }
      });

      buyCount = Math.min(buyCount, coupon.details.repition_limit || Infinity);

      if (buyCount > 0) {
        coupon.details.get_products.forEach(getProduct => {
          const freeCount = Math.min(
            buyCount * getProduct.quantity,
            updatedCart.items.find(item => item.product_id === getProduct.product_id)?.quantity || 0
          );
          const item = updatedCart.items.find(item => item.product_id === getProduct.product_id);
          if (item) {
            item.total_discount = freeCount * item.price;
            discount += item.total_discount;
          }
        });
      }
    }

    const totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const finalPrice = totalPrice - discount;

    res.status(200).json({
      updated_cart: updatedCart,
      total_price: totalPrice,
      total_discount: discount,
      final_price: finalPrice,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to apply coupon.", error: err.message });
  }
};
