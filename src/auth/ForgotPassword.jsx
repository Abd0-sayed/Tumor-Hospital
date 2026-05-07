import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Password.scss";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = () => {
    if (!email) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";
    return "";
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      setEmailError(err);
      return;
    }

    setEmailError("");
    setServerError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://tumorhospital.runasp.net/api/Auth/Forgot-Password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const errors = data.errors || data.Errors || {};
        const msg =
          errors.Identity?.[0] ||
          errors.identity?.[0] ||
          errors.Email?.[0] ||
          errors.email?.[0] ||
          errors.general?.[0] ||
          "Something went wrong. Please try again.";
        setServerError(msg);
        return;
      }

      // Success — show confirmation then redirect
      setSent(true);
      setTimeout(() => {
        navigate("/ResetPassword", { state: { email } });
      }, 1800);
    } catch {
      setServerError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="pw-page">
      <div className="pw-card">
        {/* Brand */}
        <div className="pw-brand">
          <span className="pw-brand-icon">✦</span>
          <span className="pw-brand-name">TumorCare</span>
        </div>

        {/* Icon */}
        <div className={`pw-icon-wrap ${sent ? "pw-icon-wrap--success" : ""}`}>
          {sent ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>

        {sent ? (
          <>
            <h1 className="pw-title">Check your email</h1>
            <p className="pw-subtitle">
              We've sent a 6-digit reset code to{" "}
              <strong className="pw-email-highlight">{email}</strong>.
              Redirecting you now…
            </p>
            <div className="pw-progress-bar">
              <div className="pw-progress-fill" />
            </div>
          </>
        ) : (
          <>
            <h1 className="pw-title">Forgot password?</h1>
            <p className="pw-subtitle">
              Enter your account email and we'll send you a 6-digit reset code.
            </p>

            {serverError && <div className="pw-alert">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate className="pw-form">
              <div className={`pw-field ${emailError ? "has-error" : ""}`}>
                <label htmlFor="fp-email">Email address</label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                />
                {emailError && <span className="pw-error">{emailError}</span>}
              </div>

              <button type="submit" className="pw-btn" disabled={loading}>
                {loading ? <span className="pw-spinner" /> : "Send reset code"}
              </button>
            </form>
          </>
        )}

        <p className="pw-footer">
          <Link to="/login" className="pw-back-link">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="14"
              height="14"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
