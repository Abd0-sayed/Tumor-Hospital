import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Hospital.css";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const buildInitials = (firstName = "", lastName = "") =>
  ((firstName?.[0] ?? "") + (lastName?.[0] ?? "")).toUpperCase() || "?";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debouncedValue;
};

const StatCard = ({ icon, value, label, sub, colorClass, fillPct }) => {
  const pct = Math.min(Math.round(fillPct ?? 0), 100);
  const barClass = pct >= 90 ? "hosp-stat-bar-fill--high" : pct >= 70 ? "hosp-stat-bar-fill--medium" : "";
  return (
    <div className={`hosp-stat-card hosp-stat-card--${colorClass}`}>
      <div className={`hosp-stat-icon hosp-stat-icon--${colorClass}`}>{icon}</div>
      <div>
        <div className="hosp-stat-value">{value ?? "—"}</div>
        <div className="hosp-stat-label">{label}</div>
        {sub && <div className="hosp-stat-sub">{sub}</div>}
      </div>
      {fillPct !== undefined && (
        <div className="hosp-stat-bar-wrap">
          <div className={`hosp-stat-bar-fill ${barClass}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const rawSet = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1].filter(p => p >= 1 && p <= totalPages));
  const sorted = [...rawSet].sort((a, b) => a - b);
  const pages = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) pages.push(`e${i}`);
    pages.push(p);
  });
  return (
    <div className="hosp-pagination">
      <span className="hosp-pagination-info">{totalItems === 0 ? "No results" : `Showing ${from}–${to} of ${totalItems}`}</span>
      <div className="hosp-pagination-controls">
        <button className="hosp-page-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {pages.map(p => typeof p === "string" ? (
          <span key={p} className="hosp-page-btn" style={{ border: "none", cursor: "default" }}>…</span>
        ) : (
          <button key={p} className={`hosp-page-btn ${p === currentPage ? "hosp-page-btn--active" : ""}`} onClick={() => onPageChange(p)}>{p}</button>
        ))}
        <button className="hosp-page-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
};

const DeleteModal = ({ name, onConfirm, onCancel, loading }) => (
  <div className="hosp-modal-overlay" onClick={onCancel}>
    <div className="hosp-modal" onClick={e => e.stopPropagation()}>
      <div className="hosp-modal-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </div>
      <h2 className="hosp-modal-title">Delete doctor?</h2>
      <p className="hosp-modal-msg">You are about to permanently delete <span className="hosp-modal-name">{name}</span>. This action cannot be undone.</p>
      <div className="hosp-modal-actions">
        <button className="hosp-btn hosp-btn--ghost" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="hosp-btn hosp-btn--danger" onClick={onConfirm} disabled={loading}>{loading ? <span className="hosp-spinner" /> : "Delete"}</button>
      </div>
    </div>
  </div>
);

const StatSkeleton = () => (
  <div className="hosp-stats-grid">
    {[1,2,3,4].map(i => (
      <div key={i} className="hosp-stat-card hosp-stat-card--blue">
        <div className="hosp-skeleton hosp-skeleton-circle" style={{ width: 42, height: 42, borderRadius: 10 }} />
        <div><div className="hosp-skeleton hosp-skeleton-line" style={{ width: 60, marginBottom: 8 }} /><div className="hosp-skeleton hosp-skeleton-line" style={{ width: 100 }} /></div>
      </div>
    ))}
  </div>
);

const TableSkeleton = ({ rows = 5 }) => (
  <div>{Array.from({ length: rows }).map((_, i) => (
    <div key={i} className="hosp-skeleton-row">
      <div className="hosp-skeleton hosp-skeleton-circle" />
      <div style={{ flex: 1 }}>
        <div className="hosp-skeleton hosp-skeleton-line" style={{ width: "55%", marginBottom: 6 }} />
        <div className="hosp-skeleton hosp-skeleton-line" style={{ width: "30%" }} />
      </div>
      <div className="hosp-skeleton hosp-skeleton-line" style={{ width: 80 }} />
    </div>
  ))}</div>
);

const HospitalInfo = () => {
  const navigate = useNavigate();
  const { hospitalId } = useParams();
  const token = getToken();

  const [dashboard, setDashboard]     = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError]     = useState("");

  const [doctors, setDoctors]         = useState([]);
  const [docPage, setDocPage]         = useState(1);
  const [docTotal, setDocTotal]       = useState({ pages: 1, items: 0, size: 15 });
  const [docSearch, setDocSearch]     = useState("");
  const [docLoading, setDocLoading]   = useState(true);
  const [docError, setDocError]       = useState("");

  const [receps, setReceps]           = useState([]);
  const [recPage, setRecPage]         = useState(1);
  const [recTotal, setRecTotal]       = useState({ pages: 1, items: 0, size: 10 });
  const [recSearch, setRecSearch]     = useState("");
  const [recLoading, setRecLoading]   = useState(true);
  const [recError, setRecError]       = useState("");

  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError]     = useState("");

  const [reactivatingId, setReactivatingId]   = useState(null);
  const [reactivateError, setReactivateError] = useState("");

  const [deleting, setDeleting]   = useState(false);
  const [hospError, setHospError] = useState("");

  const debouncedDocSearch = useDebounce(docSearch, 400);
  const debouncedRecSearch = useDebounce(recSearch, 400);

  useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);

  useEffect(() => {
    if (!hospitalId || !token) return;
    setDashLoading(true); setDashError("");
    fetch(`https://tumorhospital.runasp.net/api/Hospital/dashboard/${hospitalId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (res.status === 401) { navigate("/login"); return; } if (!res.ok) { setDashError("Failed to load dashboard."); return; } setDashboard(await res.json()); })
      .catch(() => setDashError("Server error. Please try again."))
      .finally(() => setDashLoading(false));
  }, [hospitalId, token, navigate]);

  const fetchDoctors = useCallback(() => {
    if (!hospitalId || !token) return;
    setDocLoading(true); setDocError("");
    const params = new URLSearchParams({ pageNumber: docPage });
    if (debouncedDocSearch) params.set("doctorName", debouncedDocSearch);
    fetch(`https://tumorhospital.runasp.net/api/Hospital/${hospitalId}/doctors?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (res.status === 401) { navigate("/login"); return; }
        if (!res.ok) { setDocError("Failed to load doctors."); return; }
        const response = await res.json();
        setDoctors(response.data ?? []);
        setDocTotal({ pages: response.totalPages ?? 1, items: response.totalRecords ?? 0, size: response.pageSize ?? 15 });
      })
      .catch(() => setDocError("Server error loading doctors."))
      .finally(() => setDocLoading(false));
  }, [hospitalId, token, docPage, debouncedDocSearch, navigate]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { setDocPage(1); }, [debouncedDocSearch]);

  const fetchReceps = useCallback(() => {
    if (!hospitalId || !token) return;
    setRecLoading(true); setRecError("");
    const params = new URLSearchParams({ pageNumber: recPage });
    if (debouncedRecSearch) params.set("receptionistName", debouncedRecSearch);
    fetch(`https://tumorhospital.runasp.net/api/Hospital/${hospitalId}/receptionists?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (res.status === 401) { navigate("/login"); return; }
        if (!res.ok) { setRecError("Failed to load receptionists."); return; }
        const data = await res.json();
        setReceps(data.data ?? []);
        setRecTotal({ pages: data.totalPages ?? 1, items: data.totalCount ?? 0, size: 10 });
      })
      .catch(() => setRecError("Server error loading receptionists."))
      .finally(() => setRecLoading(false));
  }, [hospitalId, token, recPage, debouncedRecSearch, navigate]);

  useEffect(() => { fetchReceps(); }, [fetchReceps]);
  useEffect(() => { setRecPage(1); }, [debouncedRecSearch]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true); setDeleteError("");
    try {
      const res = await fetch(`https://tumorhospital.runasp.net/api/Admin/Doctor/${deleteTarget.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { navigate("/login"); return; }
      if (!res.ok) { const data = await res.json().catch(() => ({})); setDeleteError(data.errors?.Identity?.[0] || data.message || "Delete failed."); return; }
      setDeleteTarget(null);
      fetchDoctors();
    //  setDashboard(prev => prev ? { ...prev, numberOfDoctors: Math.max(0, (prev.numberOfDoctors ?? 1) - 1) } : prev);
    } catch { setDeleteError("Server error. Please try again."); }
    finally { setDeleteLoading(false); }
  };

  const handleReactivate = async (doctorId) => {
    setReactivatingId(doctorId); setReactivateError("");
    try {
      const res = await fetch(`https://tumorhospital.runasp.net/api/Admin/reactive-account/${doctorId}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { navigate("/login"); return; }
      if (!res.ok) { const data = await res.json().catch(() => ({})); setReactivateError(data.errors?.Identity?.[0] || data.message || "Reactivation failed."); return; }
      fetchDoctors();
    } catch { setReactivateError("Server error. Please try again."); }
    finally { setReactivatingId(null); }
  };

  const handleDeleteHospital = async () => {
    if (!window.confirm("Are you sure you want to delete this hospital? This action cannot be undone.")) return;
    setDeleting(true); setHospError("");
    try {
      const res = await fetch(`https://tumorhospital.runasp.net/api/Hospital/${hospitalId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setHospError(data.Message || data.message || "Failed to delete hospital."); return; }
      navigate("/admin");
    } catch { setHospError("Server error. Please try again later."); }
    finally { setDeleting(false); }
  };

  const docPct = dashboard?.maxNumberOfDoctors ? (dashboard.numberOfDoctors / dashboard.maxNumberOfDoctors) * 100 : 0;
  const recPct = dashboard?.maxNumberOfReceptionists ? (dashboard.numberOfReceptionists / dashboard.maxNumberOfReceptionists) * 100 : 0;

  return (
    <div className="hosp-page">
      <div className="hosp-inner">
        <button className="hosp-back-btn" onClick={() => navigate("/admin")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><polyline points="15 18 9 12 15 6"/></svg>
          Back to hospitals
        </button>

        <div className="hosp-page-header">
          <div>
            <h1 className="hosp-page-title">Hospital Dashboard</h1>
            <p className="hosp-page-subtitle">Capacity overview and staff management</p>
          </div>
        </div>

        {hospError && <div className="hosp-alert">{hospError}</div>}

        {dashLoading ? <StatSkeleton /> : dashError ? <div className="hosp-alert">{dashError}</div> : (
          <div className="hosp-stats-grid">
            <StatCard colorClass="blue" fillPct={docPct} value={dashboard?.numberOfDoctors} label="Doctors" sub={`of ${dashboard?.maxNumberOfDoctors} max`}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
            <StatCard colorClass="navy" fillPct={recPct} value={dashboard?.numberOfReceptionists} label="Receptionists" sub={`of ${dashboard?.maxNumberOfReceptionists} max`}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>} />
            <StatCard colorClass="green" value={dashboard?.maxNumberOfDoctors} label="Doctor Capacity" sub="Maximum allowed"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} />
            <StatCard colorClass="orange" value={dashboard?.maxNumberOfReceptionists} label="Receptionist Capacity" sub="Maximum allowed"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} />
          </div>
        )}

        <div className="hosp-hospital-actions">
          <button className="hosp-action-btn hosp-action-btn--view" onClick={() => navigate(`/admin/HospitalInfo/${hospitalId}/UpdateHospital`, { state: { hospitalId } })}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Update Hospital
          </button>
          <button className="hosp-action-btn hosp-action-btn--delete" onClick={handleDeleteHospital} disabled={deleting}>
            {deleting ? <span className="hosp-spinner hosp-spinner--dark" /> : (
              <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>Delete Hospital</>
            )}
          </button>
        </div>

        {/* ══ DOCTORS PANEL ══ */}
        <div className="hosp-panel">
          <div className="hosp-panel-header">
            <div>
              <h2 className="hosp-panel-title">Doctors</h2>
              <p className="hosp-panel-count">{docTotal.items > 0 ? `${docTotal.items} total` : ""}</p>
            </div>
            <div className="hosp-search-wrap">
              <span className="hosp-search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
              <input className="hosp-search-input" type="text" placeholder="Search by name…" value={docSearch} onChange={e => setDocSearch(e.target.value)} />
            </div>
          </div>

          {deleteError    && <div className="hosp-alert" style={{ margin: "0.75rem 1.25rem 0" }}>{deleteError}</div>}
          {reactivateError && <div className="hosp-alert" style={{ margin: "0.75rem 1.25rem 0" }}>{reactivateError}</div>}

          <div className="hosp-table-wrap">
            {docLoading ? <TableSkeleton rows={5} /> : docError ? (
              <div className="hosp-empty">
                <div className="hosp-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                <p className="hosp-empty-title">Failed to load</p><p className="hosp-empty-msg">{docError}</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="hosp-empty">
                <div className="hosp-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                <p className="hosp-empty-title">No doctors found</p>
                <p className="hosp-empty-msg">{docSearch ? "Try a different search term." : "No doctors assigned to this hospital yet."}</p>
              </div>
            ) : (
              <table className="hosp-table">
                <thead>
                  <tr><th>Doctor</th><th>Gender</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {doctors.map(doc => {
                    const fullName       = `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || "—";
                    const isDeleted      = !!doc.isDeleted;
                    const isActive       = !!doc.isActive;
                    const isReactivating = reactivatingId === doc.id;

                    return (
                      <tr key={doc.id} className={isDeleted ? "hosp-row--deleted" : ""}>
                        {/* Doctor */}
                        <td>
                          <div className="hosp-doc-cell">
                            <div className="hosp-doc-avatar">
                              {doc.profileImageUrl
                                ? <img src={doc.profileImageUrl} alt={fullName} />
                                : <span className="hosp-doc-avatar-initials">{buildInitials(doc.firstName, doc.lastName)}</span>
                              }
                            </div>
                            <span className="hosp-doc-name">{fullName}</span>
                          </div>
                        </td>

                        {/* Gender */}
                        <td>
                          <span className={`hosp-badge hosp-badge--${(doc.gender || "").toLowerCase()}`}>{doc.gender || "—"}</span>
                        </td>

                        {/* isActive status dot */}
                        <td>
                          <div className={`hosp-status-cell ${isActive ? "hosp-status-cell--active" : "hosp-status-cell--inactive"}`}>
                            <span className={`hosp-status-dot ${isActive ? "hosp-status-dot--active" : "hosp-status-dot--inactive"}`} />
                            {isActive ? "Active" : "Inactive"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="hosp-row-actions">
                            {/* View — always enabled */}
                            <button className="hosp-action-btn hosp-action-btn--view" onClick={() => navigate(`DoctorDetail/${doc.id}`, { state: { hospitalId } })}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              View
                            </button>

                            {/* Delete — disabled if already deleted */}
                            <button
                              className="hosp-action-btn hosp-action-btn--delete"
                              disabled={isDeleted}
                              title={isDeleted ? "Doctor is already deleted" : "Delete doctor"}
                              onClick={() => { setDeleteError(""); setReactivateError(""); setDeleteTarget({ id: doc.id, name: fullName }); }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                              Delete
                            </button>

                            {/* Reactivate — enabled only if doctor is deleted */}
                            <button
                              className="hosp-action-btn hosp-action-btn--reactivate"
                              disabled={!isDeleted || isReactivating}
                              title={!isDeleted ? "Doctor is not deleted" : "Reactivate this doctor"}
                              onClick={() => handleReactivate(doc.id)}
                            >
                              {isReactivating ? <span className="hosp-spinner hosp-spinner--dark" /> : (
                                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>Reactivate</>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <Pagination currentPage={docPage} totalPages={docTotal.pages} totalItems={docTotal.items} pageSize={docTotal.size} onPageChange={setDocPage} />
        </div>

        {/* ══ RECEPTIONISTS PANEL ══ */}
        <div className="hosp-panel">
          <div className="hosp-panel-header">
            <div>
              <h2 className="hosp-panel-title">Receptionists</h2>
              <p className="hosp-panel-count">{recTotal.items > 0 ? `${recTotal.items} total` : ""}</p>
            </div>
            <div className="hosp-search-wrap">
              <span className="hosp-search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
              <input className="hosp-search-input" type="text" placeholder="Search by name…" value={recSearch} onChange={e => setRecSearch(e.target.value)} />
            </div>
          </div>
          <div className="hosp-table-wrap">
            {recLoading ? <TableSkeleton rows={4} /> : recError ? (
              <div className="hosp-empty"><p className="hosp-empty-title">Failed to load</p><p className="hosp-empty-msg">{recError}</p></div>
            ) : receps.length === 0 ? (
              <div className="hosp-empty">
                <div className="hosp-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
                <p className="hosp-empty-title">No receptionists found</p>
                <p className="hosp-empty-msg">{recSearch ? "Try a different search term." : "No receptionists assigned to this hospital yet."}</p>
              </div>
            ) : (
              <table className="hosp-table">
                <thead><tr><th>Name</th><th>ID</th></tr></thead>
                <tbody>
                  {receps.map(rec => {
                    console.log(rec);
                    const  firstName=rec.firstName ?? "";
                    const lastName=rec.lastName ?? "";
                    const fullname=firstName+" "+lastName;
                    const initials = (firstName?.[0] ?? "") + (lastName?.[0] ?? "");

                    return(
                    <tr key={rec.id}>
                      <td>
                        <div className="hosp-doc-cell">
                          <div className="hosp-doc-avatar">
                            <span className="hosp-doc-avatar-initials">{initials.toUpperCase() || "?"}</span>
                          </div>
                          <span className="hosp-doc-name">{fullname || "—"}</span>
                        </div>
                      </td>
                      <td className="hosp-id-cell">{rec.id?.slice(0, 8)}…</td>
                    </tr>
                    )
                })}
                </tbody>
              </table>
            )}
          </div>
          <Pagination currentPage={recPage} totalPages={recTotal.pages} totalItems={recTotal.items} pageSize={recTotal.size} onPageChange={setRecPage} />
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { if (!deleteLoading) { setDeleteTarget(null); setDeleteError(""); } }}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default HospitalInfo;
