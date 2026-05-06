import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, BrowserRouter, Routes, Route } from "react-router-dom";
import "./style/Profile.css";
import dummy from '../assets/doctor.png';

// ── Auth Helpers ────────────────────────────────────────────────────────
const getToken = () =>   sessionStorage.getItem("token");
const getUserId = () =>  sessionStorage.getItem("userId");
 const DoctorUpdate = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initial = state?.profile || {};
  const [form, setForm] = useState({ firstName:initial.firstName || "", lastName:initial.lastName || "", email:initial.email || "", phoneNumber:initial.phoneNumber || "", bio:initial.bio || "", gender:initial.gender || ""});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initial.profilePicturePath || dummy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const userId = getUserId();
  const token = getToken();

//   useEffect(() => {
//     if (initial.fullName) {
//     // //   const parts = initial.fullName.trim().split(" ");
//     //   setForm({
//     //     firstName: initial.firstName || "",
//     //     lastName:  initial.lastName || "",
//     //     email:     initial.email || "",
//     //     phoneNumber: initial.phoneNumber || "",
//     //     bio:      initial.bio || "",
//     //     gender:   initial.gender || ""
//     //   });
//     }
//   }, [initial]);
        console.log(initial.profilePicturePath);
        console.log(initial);
        
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) { setError("Invalid file type. Only JPG, JPEG, PNG allowed."); return; }
    if (file.size > 1024 * 1024) { setError("File size exceeds 1MB."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res = await fetch(`https://tumorhospital.runasp.net/api/Profile/Doctor`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, phoneNumber: form.phoneNumber, bio: form.bio, gender: form.gender })
      });
      if (!res.ok) throw new Error("Failed to update profile fields");

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const imgRes = await fetch(`https://tumorhospital.runasp.net/api/Doctor/Profile-Picture`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!imgRes.ok) throw new Error("Failed to upload profile picture");
      }
      setSuccess(true);
      setTimeout(() => navigate("/DoctorProfile"), 1500);
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
        <button className="profile-back-btn" onClick={() => navigate("/DoctorProfile")}>← Back</button>
        <div className="profile-form-header">
          <div className="profile-form-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </div>
          <div>
            <h2 className="profile-form-title">Update Doctor Profile</h2>
            <p className="profile-form-subtitle">Modify your personal details and upload a profile picture.</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-field-wrap">
            <label>Profile Picture</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={avatarPreview} alt="Preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
              <input type="file" accept=".png,.jpg,.jpeg" onChange={handleFileChange} style={{ flex: 1 }} />
            </div>
          </div>
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
            <label>Email (Read-only)</label>
            <input type="email" value={form.email} readOnly style={{ background: 'var(--bg)', cursor: 'not-allowed' }} />
          </div>
          <div className="profile-row">
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
          </div>
          <div className="profile-field-wrap">
            <label>Bio</label>
            <input type="text" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short professional bio" />
          </div>
          <div className="profile-field-wrap">
            <label>Specialization</label>
            <input type="text" value={initial.specializationName || "—"} readOnly style={{ background: 'var(--bg)', cursor: 'not-allowed' }} />
          </div>

          {error && <div className="profile-alert" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>{error}</div>}
          <div className="profile-form-actions">
            <button type="button" className="profile-btn profile-btn--ghost" onClick={() => navigate("/DoctorProfile")}>Cancel</button>
            <button type="submit" className="profile-btn profile-btn--primary" disabled={loading}>{loading ? <span className="profile-spinner" /> : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
 export default  DoctorUpdate;