import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../auth/styles/Auth.css";

const Login = () => {
  const navigate = useNavigate();

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
    // Clear the field error as the user types
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // The backend returns { Errors: { Identity: [...], Email: [...], ... } }
        setErrors(data.errors || data.Errors || { general: ["Something went wrong"] });
        return;
      }

      // ── Persist tokens ────────────────────────────────────────────────
      const storage = form.rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.Token ?? data.token);
      storage.setItem("refreshToken", data.RefreshToken ?? data.refreshToken);
      storage.setItem("userId", data.UserId ?? data.userId);
      
      const activeacc=data.isActiveAccount??data.isActiveAccount;
      const token = data.Token ?? data.token;
      const decoded = jwtDecode(token);
      const role= decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]; 
      storage.setItem("role", role);
      console.log(role);
      
      if(role ==="Admin"){
        navigate("/admin");            // ← change to your dashboard route
      }
      else if(role ==="Doctor"){
          console.log(activeacc);
          if(activeacc == true){
             navigate("/doctor");
             }
          else{
              navigate("/changepassword")
            }
      }
      else if(role ==="Patient"){
        navigate("/Patient")
      }

    } catch (error){
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

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ── Brand mark ── */}
        <div className="auth-brand">
          <span className="auth-brand-icon">✦</span>
          <span className="auth-brand-name">TumorCare</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your patient portal</p>

        {/* ── Global / Identity error ── */}
        {(fieldError("general") || fieldError("Identity") || fieldError("identity")) && (
          <div className="auth-alert">
            {fieldError("general") || fieldError("Identity") || fieldError("identity")}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Email */}
          <div className={`auth-field ${fieldError("email") || fieldError("Email") ? "has-error" : ""}`}>
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
              <span className="auth-error">{fieldError("email") || fieldError("Email")}</span>
            )}
          </div>

          {/* Password */}
          <div className={`auth-field ${fieldError("password") || fieldError("Password") ? "has-error" : ""}`}>
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
              <span className="auth-error">{fieldError("password") || fieldError("Password")}</span>
            )}
          </div>

          {/* Remember Me */}
          <div className="auth-remember">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me for 30 days</span>
            </label>
            <Link to="/ForgotPassword" className="auth-link-small">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/Register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
