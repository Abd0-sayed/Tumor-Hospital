import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./styles/Password.scss";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── Client-side validation ──────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!form.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Invalid email format";

    if (!form.password) newErrors.password = "Password is required";

    return newErrors;
  };

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(
        "https://tumorhospital.runasp.net/api/Auth/Login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            rememberMe: form.rememberMe ? "true" : "false",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors(
          data.errors || data.Errors || { general: ["Something went wrong"] },
        );
        return;
      }

      // ── Persist tokens ────────────────────────────────────────────────
      const storage = form.rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.Token ?? data.token);
      localStorage.setItem(
        "refreshToken",
        data.RefreshToken ?? data.refreshToken,
      );
      storage.setItem("userId", data.UserId ?? data.userId);

      const activeacc = data.isActiveAccount ?? data.isActiveAccount;
      const token = data.Token ?? data.token;
      const decoded = jwtDecode(token);
      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      storage.setItem("role", role);

      if (role === "Admin") {
        window.location.href = "/admin";
      } else if (role === "Doctor") {
        if (activeacc === true) {
          window.location.href = "/DoctorProfile";
        } else {
          window.location.href = "/changepassword";
        }
      } else if (role === "InActiveDoctorRole") {
        window.location.href = "/ChangeInactivePassword";
      } else if (role === "Patient") {
        window.location.href = "/PatientProfile";
      } else if (role === "InActiveReceptionistRole") {
        window.location.href = "/ChangeInactivePassword";
      } else {
        window.location.href = "/ReceptionistProfile";
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: ["Server error, please try again later"] });
    } finally {
      setLoading(false);
    }
  };

  // ── Helper: flatten backend error arrays ─────────────────────────────
  const fieldError = (key) => {
    const val = errors[key] ?? errors[key?.toLowerCase()];
    return Array.isArray(val) ? val[0] : val;
  };

  return (
    <div className="pw-page">
      <div className="pw-card">
        <div className="pw-brand">
          <span className="pw-brand-name">Tumor Care</span>
        </div>

        <h1 className="pw-title">Welcome back</h1>
        <p className="pw-subtitle">Sign in to your patient portal</p>

        {(fieldError("general") ||
          fieldError("Identity") ||
          fieldError("identity")) && (
          <div className="pw-error-alert">
            {fieldError("general") ||
              fieldError("Identity") ||
              fieldError("identity")}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="pw-form">
          {/* Email */}
          <div
            className={`pw-field ${fieldError("email") || fieldError("Email") ? "has-error" : ""}`}
          >
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {(fieldError("email") || fieldError("Email")) && (
              <span className="pw-error">
                {fieldError("email") || fieldError("Email")}
              </span>
            )}
          </div>

          {/* Password */}
          <div
            className={`pw-field ${fieldError("password") || fieldError("Password") ? "has-error" : ""}`}
          >
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
            {(fieldError("password") || fieldError("Password")) && (
              <span className="pw-error">
                {fieldError("password") || fieldError("Password")}
              </span>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.85rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                color: "#1f2c6c",
                fontWeight: "600",
              }}
            >
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                style={{ width: "16px", height: "16px" }}
              />
              Remember me
            </label>
            <Link
              to="/ForgotPassword"
              className="pw-link"
              style={{ fontSize: "0.85rem" }}
            >
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="pw-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="pw-footer">
          Don't have an account?{" "}
          <Link to="/Register" className="pw-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
