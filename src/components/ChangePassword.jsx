import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Profile.css";

const getToken  = () =>  sessionStorage.getItem("token");
const getUserId = () =>  sessionStorage.getItem("userId");

const ChangePassword = () => {
  const navigate = useNavigate();

  const userId = getUserId();
  const token  = getToken();

  const [form, setForm] = useState({
    oldPassword:     "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [errors,      setErrors]      = useState({});
  const [serverError, setServerError] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.oldPassword) e.oldPassword = "Current password is required";

    if (!form.newPassword) e.newPassword = "New password is required";
    else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}/.test(form.newPassword)
    )
      e.newPassword = "8+ chars with uppercase, lowercase, number & special character";
    else if (form.newPassword === form.oldPassword)
      e.newPassword = "New password must be different from your current password";

    if (!form.confirmPassword) e.confirmPassword = "Please confirm your new password";
    else if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

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
        "https://tumorhospital.runasp.net/api/Auth/Change-Password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: form.oldPassword,
            newPassword: form.newPassword,
          }),
        }
      );

      if (response.status === 401) { navigate("/login"); return; }

      if (response.status === 403) {
        setServerError("You are not authorized to change this password.");
        return;
      }

      if (response.status === 429) {
        setServerError("Too many attempts. Please wait a moment before trying again.");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        const errs = data.errors || data.Errors || {};
        const msg =
          errs.Identity?.[0]  ||
          errs.identity?.[0]  ||
          errs.OldPassword?.[0] ||
          errs.general?.[0]   ||
          data.message        ||
          "Something went wrong. Please try again.";
        setServerError(msg);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/PatientProfile"), 2000);
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

  // ── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="profile-page">
        <div className="profile-card profile-card--center">
          <div className="profile-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="profile-success-title">Password changed!</h2>
          <p className="profile-success-msg">
            Your password has been updated. Redirecting to your profile…
          </p>
          <div className="pw-progress-bar"><div className="pw-progress-fill" /></div>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h1 className="profile-form-title">Change password</h1>
            <p className="profile-form-subtitle">Keep your account secure with a strong password</p>
          </div>
        </div>

        {serverError && <div className="profile-alert">{serverError}</div>}

        {/* Password requirements hint */}
        <div className="profile-hint">
          <p className="profile-hint-title">Password requirements</p>
          <ul className="profile-hint-list">
            <li>At least 8 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
            <li>One special character</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} noValidate className="profile-form">
          {/* Current password */}
          <div className={`profile-field-wrap ${errors.oldPassword ? "has-error" : ""}`}>
            <label htmlFor="cp-old">Current password</label>
            <input
              id="cp-old"
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Your current password"
              value={form.oldPassword}
              onChange={handleChange}
            />
            {errors.oldPassword && (
              <span className="profile-error">{errors.oldPassword}</span>
            )}
          </div>

          {/* New password */}
          <div className={`profile-field-wrap ${errors.newPassword ? "has-error" : ""}`}>
            <label htmlFor="cp-new">New password</label>
            <input
              id="cp-new"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your new password"
              value={form.newPassword}
              onChange={handleChange}
            />
            {errors.newPassword && (
              <span className="profile-error">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm password */}
          <div className={`profile-field-wrap ${errors.confirmPassword ? "has-error" : ""}`}>
            <label htmlFor="cp-confirm">Confirm new password</label>
            <input
              id="cp-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="profile-error">{errors.confirmPassword}</span>
            )}
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
              {loading ? <span className="profile-spinner" /> : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
