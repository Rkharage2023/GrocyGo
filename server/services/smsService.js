const logger = require("../utils/logger");

const sendOtp = async (mobile, otp) => {
  console.log(`\n==============================`);
  console.log(`📱 Mobile : ${mobile}`);
  console.log(`🔐 OTP    : ${otp}`);
  console.log(`==============================\n`);

  logger.info(`📱 Mobile: ${mobile} | 🔐 OTP: ${otp}`);
};

module.exports = {
  sendOtp,
};