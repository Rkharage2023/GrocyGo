const authService = require("../services/authService");

const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Refresh Token
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const result = await authService.refreshToken(token);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await authService.revokeRefreshToken(token);
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Logout All Devices
const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await authService.revokeAllUserRefreshTokens(userId);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Profile
const profile = async (req, res, next) => {
    try {
        const user = await authService.profile(req.user.id);

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        next(error);
    }
};

// Update Profile
const updateProfile = async (req, res, next) => {
    try {
        const user = await authService.updateProfile(req.user.id, req.body);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });

    } catch (error) {
        next(error);
    }
};

// Send OTP
const sendOtp = async (req, res, next) => {
  try {
    const result = await authService.sendOtp(req.body.mobile);

    res.status(200).json({
      success: true,
      message: result.message,
      otp: result.otp,
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
const verifyOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyOtp(req.body);

    if (result.requiresPassword) {
      return res.status(200).json({
        success: false,
        requiresPassword: true,
        message: result.message,
      });
    }

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        isNewUser: result.isNewUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    profile,
    updateProfile,
    refreshToken,
    logout,
    logoutAll,
    sendOtp,
    verifyOtp
};