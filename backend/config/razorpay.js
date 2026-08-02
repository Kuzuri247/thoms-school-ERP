const Razorpay = require("razorpay");
require("dotenv").config();

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "testing"
  );
}

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

module.exports = razorpay;
