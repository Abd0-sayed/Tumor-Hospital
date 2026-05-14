import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import "./Password.css";
import "./style/Password.css";
import { jwtDecode } from "jwt-decode";

import { useAuth } from "../context/AuthContext";


// Helper: get token from either storage
const getToken = () =>
   sessionStorage.getItem("token");

const ChangeInactivePassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { updateAuth } = useAuth();


  // userId and token are passed via navigate state from Login
  const userId = state?.userId || localStorage.getItem("userId") || sessionStorage.getItem("userId");
  const token  = state?.token  || getToken();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  
  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.oldPassword) e.oldPassword = "Current password is required";

    if (!form.newPassword) e.newPassword = "New password is required";
    else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}/.test(form.newPassword)
    )
      e.newPassword = "8+ chars with uppercase, lowercase, number & special character";
    else if (form.newPassword === form.oldPassword)
      e.newPassword = "New password must be different from the current password";

    if (!form.confirmPassword) e.confirmPassword = "Please confirm your new password";
    else if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    return e;
  };

  // ── Submit ──────────────────────────────────────────────────────────────
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
        console.log(form);
        console.log(token);
        
    try {
      const response = await fetch(
        "https://tumorhospital.runasp.net/api/Auth/Change-InActiveRole-Password",
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
      )

      const data = await response.json();
      // storage.setItem("token", data.Token ?? data.token);
      // storage.setItem("refreshToken", data.RefreshToken ?? data.refreshToken);
      // storage.setItem("userId", data.UserId ?? data.userId);
      // const decoded = jwtDecode(data.token);
      //       const role =decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      //       storage.setItem("role", role);
      //       window.dispatchEvent(new Event("storageUpdate"));

      if (response.status === 401) { navigate("/login"); return; }

      if (!response.ok) {
        const errs = data.errors || data.Errors || {};
        const msg =
          errs.Identity?.[0] ||
          errs.identity?.[0] ||
          errs.OldPassword?.[0] ||
          errs.general?.[0] ||
          data.message ||
          "Something went wrong. Please try again.";
        setServerError(msg);
        return;
      }

      // Save new tokens returned after activation
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      storage.setItem("token",        data.token        ?? data.Token);
      storage.setItem("refreshToken", data.refreshToken ?? data.RefreshToken);
      // storage.setItem("userId",       data.userId       ?? data.UserId);
      storage.setItem("userId",       data.userId       ?? data.UserId);
      const decoded = jwtDecode(data.token);
            const uprole =decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            storage.setItem("role", uprole);
            window.dispatchEvent(new Event("storageUpdate"));
            //
        updateAuth({
              token: data.token,
              role: uprole,
            });
            //

      setSuccess(true);
      setTimeout(() => navigate("/"), 2200);
    } catch(err) {
        console.log(err);
      setServerError(err.message ||"Server error. Please try again later.");
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
      <div className="pw-page">
        <div className="pw-card">
          <div className="pw-brand">
            <span className="pw-brand-icon">✦</span>
            <span className="pw-brand-name">MED<span>DICAL</span></span>
          </div>
          <div className="pw-icon-wrap pw-icon-wrap--success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="pw-title">Account activated!</h1>
          <p className="pw-subtitle">
            Your password has been updated and your account is now active.
            Redirecting you to your dashboard…
          </p>
          <div className="pw-progress-bar"><div className="pw-progress-fill" /></div>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="pw-page">
      <div className="pw-card pw-card--wide">
        {/* Brand */}
        <div className="pw-brand">
          <span className="pw-brand-icon">✦</span>
          <span className="pw-brand-name">MED<span>DICAL</span></span>
        </div>

        {/* Notice banner */}
        <div className="pw-notice">
          <div className="pw-notice-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="pw-notice-text">
            Your account is inactive. Please set a new password to activate
            your account and gain full access.
          </p>
        </div>

        <div className="pw-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="pw-title">Activate account</h1>
        <p className="pw-subtitle">
          Enter your temporary password and choose a new secure password to
          activate your account.
        </p>

        {serverError && <div className="pw-alert">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate className="pw-form">
          {/* Current / temporary password */}
          <div className={`pw-field ${errors.oldPassword ? "has-error" : ""}`}>
            <label htmlFor="cip-old">Current / temporary password</label>
            <input
              id="cip-old"
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Your temporary password"
              value={form.oldPassword}
              onChange={handleChange}
            />
            {errors.oldPassword && (
              <span className="pw-error">{errors.oldPassword}</span>
            )}
          </div>

          {/* New password */}
          <div className={`pw-field ${errors.newPassword ? "has-error" : ""}`}>
            <label htmlFor="cip-new">New password</label>
            <input
              id="cip-new"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Min 8 chars, upper, lower, number & symbol"
              value={form.newPassword}
              onChange={handleChange}
            />
            {errors.newPassword && (
              <span className="pw-error">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm password */}
          <div className={`pw-field ${errors.confirmPassword ? "has-error" : ""}`}>
            <label htmlFor="cip-confirm">Confirm new password</label>
            <input
              id="cip-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="pw-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="pw-btn" disabled={loading}>
            {loading ? <span className="pw-spinner" /> : "Activate account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeInactivePassword;
