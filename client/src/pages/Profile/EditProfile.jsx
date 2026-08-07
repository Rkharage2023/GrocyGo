import { useState, useEffect, useContext } from "react";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

function EditProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateProfileState, user } = useContext(AuthContext);
  const isNewOrIncomplete = !user || user.name === "User";

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/profile");
        setFormData({
          name: res.data.user.name || "",
          mobile: res.data.user.mobile || "",
          address: res.data.user.address || "",
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert(t("fullNameRequired", { defaultValue: "Full Name is required." }));
      return;
    }

    if (formData.name.trim().toLowerCase() === "user") {
      alert(t("updateNameAlert", { defaultValue: "Please update your name to something other than 'User'." }));
      return;
    }

    try {
      const res = await API.put("/auth/profile", formData);
      updateProfileState(res.data.user);
      alert(t("profileUpdatedToast", { defaultValue: "Profile Updated Successfully" }));
      navigate("/");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || t("failedUpdateProfile", { defaultValue: "Failed to update profile" }));
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg">
        {/* Header */}

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-3xl py-8">
          <h1 className="text-3xl font-bold text-center text-white">
            {t("editProfile", { defaultValue: "Edit Profile" })}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          {/* Profile Image */}

          <div className="flex flex-col items-center">
            <div className="relative">
              <FaUserCircle size={120} className="text-green-600" />

              <label className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-full cursor-pointer">
                <FaCamera />
                <input type="file" className="hidden" />
              </label>
            </div>

            <p className="text-gray-500 mt-3">{t("changeProfilePicture", { defaultValue: "Change Profile Picture" })}</p>
          </div>

          {/* Name */}

          <div className="mt-10">
            <label className="font-medium">{t("profile", { defaultValue: "Full Name" })}</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Mobile */}

          <div className="mt-6">
            <label className="font-medium">{t("mobileNumber")}</label>

            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Address */}

          <div className="mt-6">
            <label className="font-medium">{t("addresses", { defaultValue: "Address" })}</label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder={t("enterAddressPlaceholder", { defaultValue: "Enter your address" })}
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Buttons */}

          <div className="flex gap-4 mt-10">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700"
            >
              {t("saveChanges", { defaultValue: "Save Changes" })}
            </button>

            {!isNewOrIncomplete && (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 border border-gray-300 py-4 rounded-xl font-semibold hover:bg-gray-100"
              >
                {t("cancel")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
