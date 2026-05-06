import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, BrowserRouter, Routes, Route } from "react-router-dom";
import "./style/Profile.css";

// ── Auth Helpers ────────────────────────────────────────────────────────
const getToken = () =>  sessionStorage.getItem("token");
const getUserId = () => sessionStorage.getItem("userId");
 const ReceptionistUpdate = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initial = state?.profile || {};
  const [form, setForm] = useState({ firstName: initial.firstName|| "", lastName: initial.lastName|| "", phoneNumber: initial.phoneNumber|| "", gender: initial.gender|| "", address:initial.address|| "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const userId = getUserId();
  const token = getToken();

  useEffect(() => {
    if (initial.fullName) {
    //   const parts = initial.fullName.trim().split(" ");
    //   setForm({
    //     firstName: initial.firstName || "",
    //     lastName: initial.lastName || "",
    //     phoneNumber: initial.phoneNumber || "",
    //     gender: initial.gender || "",
    //     address: initial.address || ""
    //   });
      console.log(form);
      
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch(`https://tumorhospital.runasp.net/api/Profile/Receptionist`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update receptionist profile");
      }
      setSuccess(true);
      setTimeout(() => navigate("/Reciptionprofile"), 1500);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="profile-page">
        <div className="profile-card profile-card--center">
          <div className="profile-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="profile-success-title">Profile Updated</h2>
          <p className="profile-success-msg">Your changes have been saved successfully. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <button className="profile-back-btn" onClick={() => navigate("/ReceptionistProfile")}>← Back</button>
        <div className="profile-form-header">
          <div className="profile-form-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </div>
          <div>
            <h2 className="profile-form-title">Update Receptionist Profile</h2>
            <p className="profile-form-subtitle">Modify your contact and location details.</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-row">
            <div className="profile-field-wrap">
              <label>First name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div className="profile-field-wrap">
              <label>Last name</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
          </div>
          <div className="profile-field-wrap">
            <label>Phone number</label>
            <input type="tel" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          </div>
          <div className="profile-field-wrap">
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="profile-field-wrap">
            <label>Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
          </div>

          {error && <div className="profile-alert" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>{error}</div>}
          <div className="profile-form-actions">
            <button type="button" className="profile-btn profile-btn--ghost" onClick={() => navigate("/Reciptionprofile")}>Cancel</button>
            <button type="submit" className="profile-btn profile-btn--primary" disabled={loading}>{loading ? <span className="profile-spinner" /> : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


  export default  ReceptionistUpdate;
