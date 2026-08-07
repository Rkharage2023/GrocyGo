const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
    User,
    RefreshToken,
    Otp
} = require("../models");
const {
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken,
} = require("../utils/token");

const { generateOTP } = require("../utils/otp");
const {sendOtp: sendSms} = require("./smsService");
const AppError = require("../utils/AppError");


// Refresh Token
const refreshToken = async (refreshToken) => {

    if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
    }

    let decoded;

    try {

        decoded = verifyRefreshToken(refreshToken);

    } catch (error) {

        throw new AppError("Invalid or expired refresh token", 401);

    }

    const storedToken = await RefreshToken.findOne({
        where: {
            token: refreshToken,
        },
    });

    if (!storedToken) {
        throw new AppError("Refresh token not found", 401);
    }

    if (storedToken.isRevoked) {
        throw new AppError("Refresh token has been revoked", 401);
    }

    if (storedToken.expiresAt < new Date()) {
        throw new AppError("Refresh token has expired", 401);
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const newAccessToken = generateAccessToken(user);

    const newRefreshToken = generateRefreshToken(user);

    await RefreshToken.update(
        { isRevoked: true },
        {
            where: {
                id: storedToken.id,
            },
        }
    );

    await RefreshToken.create({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};


// Profile
const profile = async (userId) => {

    const user = await User.findByPk(userId, {
        attributes: {
            exclude: ["password"],
        },
    });

    if (!user) {
        throw {
            statusCode: 404,
            message: "User not found",
        };
    }

    return user;
};

// Update Profile
const updateProfile = async (userId, { name, mobile, address }) => {

    if (!name || !mobile) {
        throw {
            statusCode: 400,
            message: "Name and Mobile number are required",
        };
    }

    if (mobile.length !== 10) {
        throw {
            statusCode: 400,
            message: "Mobile number must be exactly 10 digits",
        };
    }

    const existingUser = await User.findOne({
        where: { mobile },
    });

    if (existingUser && existingUser.id !== userId) {
        throw {
            statusCode: 400,
            message: "Mobile number already in use by another user",
        };
    }

    const user = await User.findByPk(userId);

    if (!user) {
        throw {
            statusCode: 404,
            message: "User not found",
        };
    }

    user.name = name;
    user.mobile = mobile;
    user.address = address;

    await user.save();

    return {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        address: user.address,
        role: user.role,
    };
};

// Revoke Refresh Token
const revokeRefreshToken = async (token) => {
    if (!token) return;
    await RefreshToken.update(
        { isRevoked: true },
        {
            where: { token },
        }
    );
};

// Revoke All Refresh Tokens for a User
const revokeAllUserRefreshTokens = async (userId) => {
    if (!userId) return;
    await RefreshToken.update(
        { isRevoked: true },
        {
            where: { userId },
        }
    );
};

// OTP Functions
const sendOtp = async (mobile) => {
  // Validate Mobile
  if (!mobile) {
    throw new AppError("Mobile number is required", 400);
  }

  // Indian Mobile Validation
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new AppError("Invalid mobile number", 400);
  }

  // Check if OTP already exists
  const existingOtp = await Otp.findOne({
    where: {
      mobile,
    },
  });

  const OTP_EXPIRY_MINS = parseInt(process.env.OTP_EXPIRY_MINS, 10) || 5;
  const OTP_RESEND_COOLDOWN_SECS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECS, 10) || 60;

  if (existingOtp) {
    const seconds =
      (Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000;

    if (seconds < OTP_RESEND_COOLDOWN_SECS) {
      throw new AppError(
        `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECS - seconds)} seconds before requesting another OTP.`,
        429
      );
    }
  }

  // Generate OTP
  const otp = generateOTP();

  // Hash OTP
  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Insert / Update OTP
  await Otp.upsert({
    mobile,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINS * 60 * 1000),
    attempts: 0,
    lastSentAt: new Date(),
  });

  // Send OTP
  await sendSms(mobile, otp);

  return {
    message: "OTP sent successfully",
    otp,
  };
};


// Verify OTP
const verifyOtp = async ({ mobile, otp, name, password }) => {
  // Validate Input
  if (!mobile || !otp) {
    throw new AppError("Mobile and OTP are required", 400);
  }

  // Find OTP
  const otpRecord = await Otp.findOne({
    where: {
      mobile,
    },
  });

  if (!otpRecord) {
    throw new AppError("OTP not found. Please request a new OTP.", 404);
  }

  // Expiry Check
  if (new Date() > otpRecord.expiresAt) {
    await otpRecord.destroy();

    throw new AppError("OTP has expired", 400);
  }

  // Attempts Check
  if (otpRecord.attempts >= 3) {
    await otpRecord.destroy();

    throw new AppError(
      "Maximum OTP attempts exceeded. Please request a new OTP.",
      400
    );
  }

  // Hash User OTP
  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Compare OTP
  if (hashedOtp !== otpRecord.otp) {
    otpRecord.attempts += 1;

    if (otpRecord.attempts >= 3) {
      await otpRecord.destroy();
      throw new AppError(
        "Maximum OTP attempts exceeded. Please request a new OTP.",
        400
      );
    }

    await otpRecord.save();

    throw new AppError("Invalid OTP", 400);
  }

  // Find User
  let user = await User.findOne({
    where: {
      mobile,
    },
  });

  let isNewUser = false;

  // Register New User
  if (!user) {
    user = await User.create({
      name: name || "User",
      mobile,
      role: "CUSTOMER",
    });
    isNewUser = true;
  } else {
    // If Admin, verify password is correct
    if (user.role === "ADMIN") {
      if (!password) {
        return {
          requiresPassword: true,
          message: "Password is required for Admin login",
        };
      }
      let isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      if (!isMatch && user.password === password) {
        isMatch = true;
        // Auto-upgrade plain text password in DB to bcrypt hash
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
      if (!isMatch) {
        throw new AppError("Invalid password", 401);
      }
    }
  }

  // Generate Tokens
  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);

  // Save Refresh Token
  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
  });

  // Delete OTP
  await otpRecord.destroy();

  return {
    user,
    accessToken,
    refreshToken,
    isNewUser,
  };
};

module.exports = {
    profile,
    updateProfile,
    refreshToken,
    revokeRefreshToken,
    revokeAllUserRefreshTokens,
    sendOtp,
    verifyOtp
};