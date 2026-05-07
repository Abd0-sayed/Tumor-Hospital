import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Password.scss";

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

  const validate = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Invalid format";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    return newErrors;
  };

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
    setLoading(true);
    const submittedEmail = form.email;

    try {
      const response = await fetch(
        "https://tumorhospital.runasp.net/api/Auth/Register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        setErrors(
          data.errors || data.Errors || { general: "Registration failed" },
        );
        return;
      }
      navigate("/ConfirmEmail", { state: { email: submittedEmail } });
    } catch {
      setErrors({ general: "Server error, please try again later" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pw-page">
      <div className="pw-card pw-card--wide">
        <div className="pw-brand">
          <span className="pw-brand-icon">✦</span>
          <span className="pw-brand-name">TumorCare</span>
        </div>

        <h1 className="pw-title">Create account</h1>
        <p className="pw-subtitle">Join the patient portal today</p>

        {errors.general && (
          <div className="pw-error-alert">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="pw-form">
          <div className="pw-row">
            <div className={`pw-field ${errors.firstName ? "has-error" : ""}`}>
              <label>First name</label>
              <input
                name="firstName"
                type="text"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <span className="pw-error">{errors.firstName}</span>
              )}
            </div>
            <div className={`pw-field ${errors.lastName ? "has-error" : ""}`}>
              <label>Last name</label>
              <input
                name="lastName"
                type="text"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <span className="pw-error">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className={`pw-field ${errors.email ? "has-error" : ""}`}>
            <label>Email address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="pw-error">{errors.email}</span>}
          </div>

          <div className={`pw-field ${errors.password ? "has-error" : ""}`}>
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="pw-error">{errors.password}</span>
            )}
          </div>

          <div className={`pw-field ${errors.gender ? "has-error" : ""}`}>
            <label>Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="pw-select"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && <span className="pw-error">{errors.gender}</span>}
          </div>

          <button type="submit" className="pw-btn" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="pw-footer">
          Already have an account?{" "}
          <Link to="/login" className="pw-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
