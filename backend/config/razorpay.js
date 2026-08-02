const Razorpay = require("razorpay");
require("dotenv").config();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  throw new Error(
    "[Razorpay] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required."
  );
}

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

module.exports = razorpay;
