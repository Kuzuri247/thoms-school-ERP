const Razorpay = require("razorpay");
require("dotenv").config();

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "[Razorpay] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in environment. Using development placeholder credentials."
  );
}

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

module.exports = razorpay;
