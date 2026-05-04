import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../auth/styles/Auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── Client-side validation ──────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!form.firstName) newErrors.firstName = "First Name is required";
    else if (form.firstName.length < 2 || form.firstName.length > 20)
      newErrors.firstName = "Must be between 2 and 20 characters";

    if (!form.lastName) newErrors.lastName = "Last Name is required";
    else if (form.lastName.length < 2 || form.lastName.length > 20)
      newErrors.lastName = "Must be between 2 and 20 characters";

    if (!form.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Invalid email format";

    if (!form.password) newErrors.password = "Password is required";
    else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}/.test(
        form.password
      )
    )
      newErrors.password =
        "8+ chars with uppercase, lowercase, number & special character";

    if (!form.gender) newErrors.gender = "Gender is required";
    else if (!["Male", "Female"].includes(form.gender))
      newErrors.gender = "Gender must be Male or Female";

    return newErrors;
  };

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    // ── Capture email BEFORE resetting form ──────────────────────────────
    // (form state is async – capture it now so the navigate call has it)
    const submittedEmail = form.email;

    try {
      const response = await fetch(
        "https://tumorhospital.runasp.net/api/Auth/Register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            gender: form.gender,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || data.Errors || { general: ["Something went wrong"] });
        return;
      }

      // Success → reset form, then navigate with the captured email
      setForm({ firstName: "", lastName: "", email: "", password: "", gender: "" });
      navigate("/ConfirmEmail", { state: { email: submittedEmail } });
    } catch {
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
      <div className="auth-card auth-card--wide">
        {/* ── Brand mark ── */}
        <div className="auth-brand">
          <span className="auth-brand-icon">✦</span>
          <span className="auth-brand-name">TumorCare</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join the patient portal today</p>

        {/* ── Global / Identity error ── */}
        {(fieldError("general") || fieldError("Identity") || fieldError("identity")) && (
          <div className="auth-alert">
            {fieldError("general") || fieldError("Identity") || fieldError("identity")}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Name row */}
          <div className="auth-row">
            <div className={`auth-field ${fieldError("firstName") || fieldError("FirstName") ? "has-error" : ""}`}>
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
              />
              {(fieldError("firstName") || fieldError("FirstName")) && (
                <span className="auth-error">
                  {fieldError("firstName") || fieldError("FirstName")}
                </span>
              )}
            </div>

            <div className={`auth-field ${fieldError("lastName") || fieldError("LastName") ? "has-error" : ""}`}>
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
              />
              {(fieldError("lastName") || fieldError("LastName")) && (
                <span className="auth-error">
                  {fieldError("lastName") || fieldError("LastName")}
                </span>
              )}
            </div>
          </div>

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
              autoComplete="new-password"
              placeholder="Min 8 chars, upper, lower, number & symbol"
              value={form.password}
              onChange={handleChange}
            />
            {(fieldError("password") || fieldError("Password")) && (
              <span className="auth-error">{fieldError("password") || fieldError("Password")}</span>
            )}
          </div>

          {/* Gender */}
          <div className={`auth-field ${fieldError("gender") || fieldError("Gender") ? "has-error" : ""}`}>
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {(fieldError("gender") || fieldError("Gender")) && (
              <span className="auth-error">{fieldError("gender") || fieldError("Gender")}</span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
