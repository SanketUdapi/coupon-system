# **Coupon Management System**

This project implements a coupon management system, allowing support for multiple coupon types like cart-wise, product-wise, and "Buy X, Get Y" (BxGy) deals.

---

## **Use Cases**

### **Implemented Cases**
1. **Cart-wise Coupons**
   - **Description:** Discounts apply to the entire cart if the total exceeds a certain threshold.
   - **Examples:**
     - 10% off on carts above ₹100.
     - ₹50 off on carts exceeding ₹500.

2. **Product-wise Coupons**
   - **Description:** Discounts are applied to specific products in the cart.
   - **Examples:**
     - 20% off on Product A.
     - Buy Product B for ₹100 if its original price is ₹150.

3. **BxGy Coupons (Buy X, Get Y)**
   - **Description:** Buy a specified quantity of products and get certain products for free.
   - **Examples:**
     - Buy 2 items from [X, Y, Z] and get 1 item from [A, B, C] free.
     - Buy 3 of Product P, get 2 of Product Q free (up to a maximum of 3 repetitions).

4. **Repetition Limit for BxGy**
   - **Description:** Ensures the coupon is applied only up to a maximum limit, even if additional eligible items exist.
   - **Example:** A "Buy 2, Get 1 Free" coupon with a repetition limit of 3 will only apply three times, regardless of additional qualifying items.

5. **Coupon Expiration Dates**
   - **Description:** Coupons are valid only upto a certain date.
   - **Example:** A coupon valid from date of creation to to November 30, 2024.

---

### **Unimplemented or Partially Implemented Cases**
1. **Multiple Coupons**
   - **Description:** Allow multiple coupons to be applied simultaneously.
   - **Challenges:** Complex rules required for prioritization and conflicts to be solved.

2. **Product priortization for discount**
   - **Decrption:** let say in BxGy catagory we have prioritize one item from array right now it is in the order coupon was saved

---

### **Assumptions**
1. Products have unique identifiers (`product_id`).
2. Cart items must include `product_id`, `quantity`, and `price` fields.
3. Only one coupon can be applied to a cart at a time in the current implementation.

---

### **Limitations**
1. Coupons cannot be stacked in the current version.
2. Cannot decide to maximize or minimise discount on basis of product by coupon creators choice

---

### **Suggestions for Improvement**
1. Implement a **stackable coupons** feature with conflict resolution rules.
2. Introduce **customer-specific coupons** to improve personalization.
3. Develop a **time-sensitive coupon system** for flash sales.
4. Create a **centralized rule engine** to handle complex coupon logic and constraints efficiently.

---