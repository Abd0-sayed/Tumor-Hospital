import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../auth/styles/Password.css";

// ── ResendCode button with countdown ─────────────────────────────────────
const ResendButton = ({ email }) => {
  const COOLDOWN = 60;
  const [seconds, setSeconds] = useState(0);
  const [resendStatus, setResendStatus] = useState("idle");
  const [resendMsg, setResendMsg] = useState("");
  const timerRef = useRef(null);

  const startCooldown = () => {
    setSeconds(COOLDOWN);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleResend = async () => {
    if (seconds > 0 || resendStatus === "loading") return;
    setResendStatus("loading");
    setResendMsg("");

    try {
      const response = await fetch(
        "https://tumorhospital.runasp.net/api/Auth/Resend-Reset-Password-Token",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        const errors = data.errors || data.Errors || {};
        const msg =
          errors.Identity?.[0] ||
          errors.identity?.[0] ||
          errors.Email?.[0] ||
          "Failed to resend. Please try again.";
        setResendMsg(msg);
        setResendStatus("error");
        return;
      }

      setResendStatus("success");
      setResendMsg("A new code was sent to your email.");
      startCooldown();
    } catch {
      setResendStatus("error");
      setResendMsg("Server error. Try again later.");
    }
  };

  return (
    <div className="resend-wrap">
      <p className="resend-label">Didn't receive the code?</p>
      <button
        type="button"
        className={`resend-btn ${seconds > 0 ? "resend-btn--wait" : ""}`}
        onClick={handleResend}
        disabled={seconds > 0 || resendStatus === "loading"}
      >
        {resendStatus === "loading" ? (
          <span className="pw-spinner pw-spinner--teal" />
        ) : seconds > 0 ? (
          `Resend in ${seconds}s`
        ) : (
          "Resend code"
        )}
      </button>
      {resendMsg && (
        <p className={`resend-msg ${resendStatus === "success" ? "resend-msg--ok" : "resend-msg--err"}`}>
          {resendMsg}
        </p>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const ResetPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const emailFromState = state?.email || "";

  const [form, setForm] = useState({
    email: emailFromState,
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email format";

    if (!form.token.trim()) e.token = "Reset code is required";

    if (!form.newPassword) e.newPassword = "New password is required";
    else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}/.test(form.newPassword)
    )
      e.newPassword = "8+ chars with uppercase, lowercase, number & special character";

    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
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
        "https://tumorhospital.runasp.net/api/Auth/Reset-Password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            token: form.token,         // sent as plain string
            newPassword: form.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errs = data.errors || data.Errors || {};
        const msg =
          errs.Identity?.[0] ||
          errs.identity?.[0] ||
          errs.Token?.[0] ||
          errs.token?.[0] ||
          errs.general?.[0] ||
          "Something went wrong. Please try again.";
        setServerError(msg);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
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

  // ── Success state ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="pw-page">
        <div className="pw-card">
          <div className="pw-brand">
            <span className="pw-brand-icon">✦</span>
            <span className="pw-brand-name">TumorCare</span>
          </div>
          <div className="pw-icon-wrap pw-icon-wrap--success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="pw-title">Password reset!</h1>
          <p className="pw-subtitle">
            Your password has been updated successfully. Redirecting you to sign in…
          </p>
          <div className="pw-progress-bar"><div className="pw-progress-fill" /></div>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <div className="pw-page">
      <div className="pw-card pw-card--wide">
        {/* Brand */}
        <div className="pw-brand">
          <span className="pw-brand-icon">✦</span>
          <span className="pw-brand-name">TumorCare</span>
        </div>

        <div className="pw-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h1 className="pw-title">Reset password</h1>
        <p className="pw-subtitle">
          Enter the reset code we sent to your email and choose a new password.
        </p>

        {serverError && <div className="pw-alert">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate className="pw-form">
          {/* Email — only shown if user arrived directly without state */}
          {!emailFromState && (
            <div className={`pw-field ${errors.email ? "has-error" : ""}`}>
              <label htmlFor="rp-email">Email address</label>
              <input
                id="rp-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className="pw-error">{errors.email}</span>}
            </div>
          )}

          {/* Reset code — plain single input, value sent as string */}
          <div className={`pw-field ${errors.token ? "has-error" : ""}`}>
            <label htmlFor="rp-token">Reset code</label>
            <input
              id="rp-token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter the code from your email"
              value={form.token}
              onChange={handleChange}
            />
            {errors.token && <span className="pw-error">{errors.token}</span>}
          </div>

          {/* New password */}
          <div className={`pw-field ${errors.newPassword ? "has-error" : ""}`}>
            <label htmlFor="rp-newPassword">New password</label>
            <input
              id="rp-newPassword"
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
            <label htmlFor="rp-confirmPassword">Confirm new password</label>
            <input
              id="rp-confirmPassword"
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
            {loading ? <span className="pw-spinner" /> : "Reset password"}
          </button>
        </form>

        {/* Resend section */}
        <ResendButton email={form.email} />

        <p className="pw-footer">
          <Link to="/login" className="pw-back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
