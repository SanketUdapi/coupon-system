const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.post('/coupons', couponController.createCoupon);

router.get('/coupons', couponController.getAllCoupons);

router.get('/coupons/:id', couponController.getCouponById);

router.put('/coupons/:id', couponController.updateCouponById);

router.delete('/coupons/:id', couponController.deleteCouponById);

router.post('/applicable-coupons', couponController.getApplicableCoupons);

router.post('/apply-coupon/:id', couponController.applyCoupon);

module.exports = router;
