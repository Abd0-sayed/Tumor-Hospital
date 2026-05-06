import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./style/Profile.css";

const getToken  = () => sessionStorage.getItem("token");
const getUserId = () => sessionStorage.getItem("userId");

// ── Split full name helper ───────────────────────────────────────────────
// const splitName = (fullName = "") => {
//   const parts = fullName.trim().split(" ");
//   return {
//     firstName: parts[0] || "",
//     lastName:  parts.slice(1).join(" ") || "",
//   };
// };

// ── Format date to yyyy-mm-dd for <input type="date"> ───────────────────
const toDateInputValue = (dateStr) => {
  if (!dateStr) return "";
  try { return new Date(dateStr).toISOString().split("T")[0]; }
  catch { return ""; }
};

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const existingProfile = state?.profile || {};

  const userId = getUserId();
  const token  = getToken();

  // const { firstName: initFirst, lastName: initLast } = splitName(existingProfile?.fullName);

  const [form, setForm] = useState({
    firstName:   existingProfile?.firstName,
    lastName:    existingProfile?.lastName,
    phoneNumber: existingProfile?.phoneNumber  || "",
    gender:      existingProfile?.gender       || "",
    address:     existingProfile?.address      || "",
    dateOfBirth: toDateInputValue(existingProfile?.dateOfBirth),
  });

  const [errors,      setErrors]      = useState({});
  const [serverError, setServerError] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.firstName.trim()) e.firstName = "First name is required";
    else if (form.firstName.length > 50) e.firstName = "Maximum 50 characters";

    if (!form.lastName.trim()) e.lastName = "Last name is required";
    else if (form.lastName.length > 50) e.lastName = "Maximum 50 characters";

    if (!form.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    else if (!/^\+?\d{10,15}$/.test(form.phoneNumber.replace(/\s/g, "")))
      e.phoneNumber = "Enter a valid phone number (10–15 digits, optional +)";

    if (!form.gender) e.gender = "Gender is required";
    else if (!["Male", "Female"].includes(form.gender))
      e.gender = "Must be Male or Female";

    if (!form.address.trim()) e.address = "Address is required";

    if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    else if (new Date(form.dateOfBirth) >= new Date())
      e.dateOfBirth = "Date of birth must be in the past";

    return e;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://tumorhospital.runasp.net/api/Profile/Patient`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName:   form.firstName,
            lastName:    form.lastName,
            phoneNumber: form.phoneNumber,
            gender:      form.gender,
            address:     form.address,
            dateOfBirth: form.dateOfBirth,
          }),
        }
      )

      if (response.status === 401) { navigate("/login"); return; }

      if (response.status === 429) {
        setServerError("Too many requests. Please wait a moment before trying again.");
        return;
      }

      if (!response.ok) {
        // Try to parse field-level errors
        try {
          const data = await response.json();
          const errs = data.errors || data.Errors || {};
          if (Object.keys(errs).length > 0) {
            // Map server field names to form field names (case-insensitive)
            const mapped = {};
            Object.entries(errs).forEach(([key, val]) => {
              mapped[key.charAt(0).toLowerCase() + key.slice(1)] =
                Array.isArray(val) ? val[0] : val;
            });
            setErrors(mapped);
            return;
          }
          setServerError(data.message || "Update failed. Please try again.");
        } catch {
          setServerError("Update failed. Please try again.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/PatientProfile"), 1800);
    } catch {
      setServerError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ── Success toast ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="profile-page">
        <div className="profile-card profile-card--center">
          <div className="profile-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="profile-success-title">Profile updated!</h2>
          <p className="profile-success-msg">
            Your changes have been saved. Redirecting to your profile…
          </p>
          <div className="pw-progress-bar"><div className="pw-progress-fill" /></div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Back link */}
        <button className="profile-back-btn" onClick={() => navigate("/PatientProfile")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to profile
        </button>

        <div className="profile-form-header">
          <div className="profile-form-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h1 className="profile-form-title">Update profile</h1>
            <p className="profile-form-subtitle">Edit your personal information below</p>
          </div>
        </div>

        {serverError && <div className="profile-alert">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate className="profile-form">
          {/* Name row */}
          <div className="profile-row">
            <div className={`profile-field-wrap ${errors.firstName ? "has-error" : ""}`}>
              <label htmlFor="up-firstName">First name</label>
              <input
                id="up-firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="profile-error">{errors.firstName}</span>}
            </div>

            <div className={`profile-field-wrap ${errors.lastName ? "has-error" : ""}`}>
              <label htmlFor="up-lastName">Last name</label>
              <input
                id="up-lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="profile-error">{errors.lastName}</span>}
            </div>
          </div>

          {/* Phone */}
            <div className={`profile-field-wrap ${errors.phoneNumber ? "has-error" : ""}`}>
              <label htmlFor="up-phone">Phone number</label>
              <input
                id="up-phone"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="+201234567890"
                value={form.phoneNumber}
                onChange={handleChange}
              />
              {errors.phoneNumber && <span className="profile-error">{errors.phoneNumber}</span>}
            </div>

          {/* Gender + DOB row */}
          <div className="profile-row">
            <div className={`profile-field-wrap ${errors.gender ? "has-error" : ""}`}>
              <label htmlFor="up-gender">Gender</label>
              <select
                id="up-gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <span className="profile-error">{errors.gender}</span>}
            </div>

            <div className={`profile-field-wrap ${errors.dateOfBirth ? "has-error" : ""}`}>
              <label htmlFor="up-dob">Date of birth</label>
              <input
                id="up-dob"
                name="dateOfBirth"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={form.dateOfBirth}
                onChange={handleChange}
              />
              {errors.dateOfBirth && <span className="profile-error">{errors.dateOfBirth}</span>}
            </div>
          </div>

          {/* Address */}
          <div className={`profile-field-wrap ${errors.address ? "has-error" : ""}`}>
            <label htmlFor="up-address">Address</label>
            <input
              id="up-address"
              name="address"
              type="text"
              autoComplete="street-address"
              placeholder="123 Some Street, City, Country"
              value={form.address}
              onChange={handleChange}
            />
            {errors.address && <span className="profile-error">{errors.address}</span>}
          </div>

          <div className="profile-form-actions">
            <button
              type="button"
              className="profile-btn profile-btn--ghost"
              onClick={() => navigate("/PatientProfile")}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="profile-btn profile-btn--primary" disabled={loading}>
              {loading ? <span className="profile-spinner" /> : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
