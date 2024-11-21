const Coupon = require('../src/models/Coupon');
const couponController = require('../src/controllers/couponController'); 
const mockingoose = require('mockingoose'); 

describe('Coupon Controller', () => {

  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should create a coupon successfully', async () => {
    const mockCouponData = {
      type: 'cart-wise',
      details: { threshold: 100, discount: 10 },
      expirationDate: '2024-12-31',
      isActive: true,
    };

    mockingoose(Coupon).toReturn(mockCouponData, 'save');

    const req = {
      body: mockCouponData,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await couponController.createCoupon(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should get all coupons with pagination', async () => {
    const mockCoupons = [
      { type: 'cart-wise', details: { threshold: 100, discount: 10 }, isActive: true },
      { type: 'product-wise', details: { product_id: '123', discount: 15 }, isActive: true },
    ];

    mockingoose(Coupon).toReturn(mockCoupons, 'find');

    const req = {
      query: {
        page_no: 1,
        page_size: 2,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await couponController.getAllCoupons(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return a coupon by ID', async () => {
    const mockCoupon = {
      type: 'cart-wise',
      details: { threshold: 100, discount: 10 },
      expirationDate: '2024-12-31',
      isActive: true,
    };

    mockingoose(Coupon).toReturn(mockCoupon, 'findOne');

    const req = {
      params: { id: '12345' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await couponController.getCouponById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should update a coupon successfully', async () => {
    const mockUpdatedCoupon = {
      type: 'product-wise',
      details: { product_id: '123', discount: 15 },
      expirationDate: '2024-12-31',
      isActive: true,
    };

    mockingoose(Coupon).toReturn(mockUpdatedCoupon, 'findOneAndUpdate');

    const req = {
      params: { id: '12345' },
      body: mockUpdatedCoupon,
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    await couponController.updateCouponById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should delete a coupon successfully', async () => {
    const mockDeletedCoupon = { type: 'cart-wise', details: { threshold: 100, discount: 10 } };

    mockingoose(Coupon).toReturn(mockDeletedCoupon, 'findOneAndDelete');

    const req = {
      params: { id: '12345' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    await couponController.deleteCouponById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

});
