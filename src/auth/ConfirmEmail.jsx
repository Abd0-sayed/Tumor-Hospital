import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import "./styles/ConfirmEmail.scss";

const RESEND_SECONDS = 60;
// circumference of the SVG ring (r=18): 2π×18 ≈ 113
const RING_CIRC = 113;

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateAuth } = useAuth();

  const email = location.state?.email;

  const [otp, setOtp]       = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  const [timer, setTimer]                 = useState(RESEND_SECONDS);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendStatus, setResendStatus]   = useState(""); // "" | "sent" | "error"

  // ── Redirect if no email ───────────────────────────────────────────────────
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (timer === 0) { setIsResendDisabled(false); return; }
    const id = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!otp.trim()) {
      setStatus("error");
      setMessage("Please enter the OTP code.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res  = await fetch("https://tumorhospital.runasp.net/api/Auth/Confirm-Email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Invalid OTP. Please try again.");

      // Store tokens
      localStorage.setItem("token",        data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      sessionStorage.setItem("token",        data.token);
      sessionStorage.setItem("refreshToken", data.refreshToken);

      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      const decoded = jwtDecode(data.token);
      const upRole  = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      storage.setItem("role", upRole);

      updateAuth({ token: data.token, role: upRole });

      setStatus("success");
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResendStatus("");
    try {
      const res  = await fetch("https://tumorhospital.runasp.net/api/Auth/Resend-Confirm-Email-Token", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to resend OTP.");

      setTimer(RESEND_SECONDS);
      setIsResendDisabled(true);
      setResendStatus("sent");
      // Clear resend success msg after 4s
      setTimeout(() => setResendStatus(""), 4000);
    } catch (err) {
      setResendStatus("error");
      setMessage(err.message);
    }
  };

  // ── SVG ring progress ─────────────────────────────────────────────────────
  const ringOffset = RING_CIRC - (timer / RESEND_SECONDS) * RING_CIRC;

  // ── Allow Enter key to submit ──────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && status !== "loading") handleVerify();
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="ce-page">
        <div className="ce-card">
          <div className="ce-brand">
            <div className="ce-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="ce-brand-name">MED<span>DICAL</span></span>
          </div>

          <div className="ce-success-state">
            <div className="ce-success-tick">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="ce-success-title">Email Confirmed!</h2>
            <p className="ce-success-msg">Your account has been verified successfully.</p>
            <p className="ce-success-redirect">Redirecting you to the dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main state ────────────────────────────────────────────────────────────
  return (
    <div className="ce-page">
      <div className="ce-card">

        {/* Brand */}
        <div className="ce-brand">
          <div className="ce-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="ce-brand-name">MED<span>DICAL</span></span>
        </div>

        {/* Envelope icon */}
        <div className="ce-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="ce-title">Check your email</h1>
        <p className="ce-subtitle">
          We sent a 6-digit code to{" "}
          <strong>{email}</strong>.{" "}
          Enter it below to verify your account.
        </p>

        {/* OTP field */}
        <div className="ce-field">
          <label htmlFor="ce-otp">Verification code</label>
          <input
            id="ce-otp"
            className={`ce-otp-input${status === "error" ? " has-error" : ""}`}
            type="text"
            inputMode="numeric"
            maxLength={8}
            placeholder="· · · · · ·"
            value={otp}
            onChange={e => { setOtp(e.target.value); if (status === "error") setStatus("idle"); }}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="one-time-code"
          />
        </div>

        {/* Verify button */}
        <button
          className="ce-verify-btn"
          onClick={handleVerify}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <><span className="ce-spinner" /> Verifying…</>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verify Email
            </>
          )}
        </button>

        {/* Error / resend-success messages */}
        {status === "error" && message && (
          <div key={message} className="ce-message ce-message--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {message}
          </div>
        )}

        {resendStatus === "sent" && (
          <div className="ce-message ce-message--success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            A new code has been sent to your email.
          </div>
        )}

        {resendStatus === "error" && message && (
          <div key={`resend-${message}`} className="ce-message ce-message--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {message}
          </div>
        )}

        {/* Divider */}
        <div className="ce-divider" style={{ marginTop: "1.4rem" }}>
          Didn't receive the code?
        </div>

        {/* Resend row */}
        <div className="ce-resend-row">
          {/* Countdown ring */}
          <div className="ce-timer">
            <svg
              className="ce-timer-ring"
              width="36"
              height="36"
              viewBox="0 0 40 40"
            >
              <circle
                className="ce-timer-ring-bg"
                cx="20" cy="20" r="18"
                strokeWidth="3"
              />
              <circle
                className={`ce-timer-ring-fill${timer === 0 ? " ce-timer-ring-fill--done" : ""}`}
                cx="20" cy="20" r="18"
                strokeWidth="3"
                strokeDasharray={RING_CIRC}
                strokeDashoffset={ringOffset}
                style={{ transformOrigin: "20px 20px" }}
              />
            </svg>
            <span className={`ce-timer-text${timer === 0 ? " ce-timer-text--done" : ""}`}>
              {timer > 0 ? `${timer}s` : "Ready"}
            </span>
          </div>

          {/* Resend button */}
          <button
            className="ce-resend-btn"
            onClick={handleResend}
            disabled={isResendDisabled}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Resend Code
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmEmail;
