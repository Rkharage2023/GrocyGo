import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBasket, Eye, EyeOff, AlertCircle, ArrowLeft, Lock } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useContext(AuthContext);

  const [formData, setFormData] = useState({ mobile: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.mobile) {
      setError("Mobile number is required.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number starting with 6-9.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(formData.mobile);
      if (res.success) {
        setIsOtpSent(true);
        if (res.otp) {
          setOtp(res.otp);
        }
      } else {
        setError(res.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await sendOtp(formData.mobile);
      if (res.success) {
        setError(""); // Clear error on successful resend
        if (res.otp) {
          setOtp(res.otp);
        }
      } else {
        setError(res.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      // First verify without password (as customer or to check if it's admin)
      const res = await verifyOtp(formData.mobile, otp);
      if (res.success) {
        const userRole = res.data?.user?.role;
        const isNewUser = res.data?.isNewUser;
        if (isNewUser) {
          navigate("/profile/edit");
        } else if (userRole === "CUSTOMER") {
          navigate("/");
        } else if (userRole === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else if (res.requiresPassword) {
        // Show Admin password modal popup
        setShowAdminPasswordModal(true);
      } else {
        setError(res.message || "OTP verification failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!adminPassword) {
      setModalError("Password is required.");
      return;
    }

    setModalLoading(true);
    try {
      const res = await verifyOtp(formData.mobile, otp, null, adminPassword);
      if (res.success) {
        setShowAdminPasswordModal(false);
        navigate("/admin");
      } else {
        setModalError(res.message || "Incorrect password.");
      }
    } catch (err) {
      setModalError(err.response?.data?.message || "Verification failed. Please check your password.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-green-500 to-green-700 p-12 text-white">
          <ShoppingBasket size={90} />
          <h1 className="text-4xl font-bold mt-6">GrocyGo</h1>
          <p className="text-center mt-5 text-green-100 leading-7">
            Shop groceries online, book your pickup slot, and collect your order
            without waiting in long queues.
          </p>
          <div className="flex gap-3 mt-8">
            <div className="w-3 h-3 rounded-full bg-white" />
            <div className="w-3 h-3 rounded-full bg-green-300" />
            <div className="w-3 h-3 rounded-full bg-green-300" />
          </div>
        </div>

        {/* Right Panel */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {!isOtpSent ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800">{t("welcomeBack")}</h2>
              <p className="text-gray-500 mt-2">{t("signInContinue")}</p>

              {/* Error Banner */}
              {error && (
                <div className="mt-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                {/* Mobile */}
                <div>
                  <label className="text-gray-600 font-medium text-sm">{t("mobileNumber")}</label>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder={t("enterMobile")}
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("sendingOtp")}
                    </>
                  ) : (
                    t("sendOtp")
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-2">
                  {t("newUsersRegister")}
                </p>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsOtpSent(false)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition mb-6 w-fit text-sm font-medium"
              >
                <ArrowLeft size={16} /> {t("backToSignIn")}
              </button>
              <h2 className="text-3xl font-bold text-gray-800">{t("enterOtp")}</h2>
              <p className="text-gray-500 mt-2">
                {t("weSentVerification")} <span className="font-semibold text-gray-700">+91 {formData.mobile}</span>
              </p>

              {/* Error Banner */}
              {error && (
                <div className="mt-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Demo OTP Auto-fill Banner */}
              {isOtpSent && (
                <div className="mt-4 p-3.5 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
                  <span>📱 Demo OTP: <strong className="font-mono text-base font-bold text-emerald-900 ml-1">{otp || "Generating..."}</strong></span>
                  <span className="text-xs bg-emerald-200 text-emerald-900 font-semibold px-2.5 py-1 rounded-full">Auto-filled</span>
                </div>
              )}

              <form className="mt-6 space-y-5" onSubmit={handleVerifyOtp}>
                {/* OTP Input */}
                <div>
                  <label className="text-gray-600 font-medium text-sm">{t("otpLabel")}</label>
                  <input
                    type="text"
                    placeholder={t("otpPlaceholder")}
                    value={otp}
                    onChange={(e) => {
                      setError("");
                      setOtp(e.target.value);
                    }}
                    maxLength={6}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition text-center text-xl font-bold tracking-widest"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("verifying")}
                    </>
                  ) : (
                    t("verifySubmit")
                  )}
                </button>

                <div className="text-center text-sm">
                  <span className="text-gray-500">Didn&apos;t receive code? </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-green-600 font-semibold hover:text-green-700 transition disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Admin Password Verification Modal */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 transition-all duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
                <Lock size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Admin Verification</h3>
              <p className="text-gray-500 text-sm mt-2 px-2">
                A password is required for Admin login. Please verify your password to access the dashboard.
              </p>
            </div>

            {/* Modal Error Banner */}
            {modalError && (
              <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle size={18} className="shrink-0" />
                {modalError}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleAdminPasswordSubmit}>
              <div>
                <label className="text-gray-600 font-medium text-sm">Admin Password</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="adminPassword"
                    placeholder="Enter your admin password"
                    value={adminPassword}
                    onChange={(e) => {
                      setModalError("");
                      setAdminPassword(e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPasswordModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  {modalLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Confirm & Login"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
