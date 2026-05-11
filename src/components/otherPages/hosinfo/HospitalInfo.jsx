import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams,useLocation } from "react-router-dom";
import "./Hospital.css";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");
// const { state } = useLocation();
//                   const hosid = state?.hosid || "";
// ── Small helpers ──────────────────────────────────────────────────────────
const initials = (name = "") => {
  const p = name.trim().split(" ");
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debouncedValue;
};

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, sub, colorClass, fillPct }) => {
  const pct = Math.min(Math.round(fillPct ?? 0), 100);
  const barClass =
    pct >= 90 ? "hosp-stat-bar-fill--high" :
    pct >= 70 ? "hosp-stat-bar-fill--medium" : "";

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
          <div
            className={`hosp-stat-bar-fill ${barClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ── Pagination ─────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to   = Math.min(currentPage * pageSize, totalItems);

  // Build page numbers: always show first, last, current ±1, with ellipsis
  const pages = [];
  const range = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1].filter(p => p >= 1 && p <= totalPages));
  const sorted = [...range].sort((a, b) => a - b);
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) pages.push("...");
    pages.push(p);
  });

  return (
    <div className="hosp-pagination">
      <span className="hosp-pagination-info">
        Showing {from}–{to} of {totalItems}
      </span>
      <div className="hosp-pagination-controls">
        <button
          className="hosp-page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="hosp-page-btn" style={{ cursor: "default", border: "none" }}>…</span>
          ) : (
            <button
              key={p}
              className={`hosp-page-btn ${p === currentPage ? "hosp-page-btn--active" : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="hosp-page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ── Delete Modal ───────────────────────────────────────────────────────────
const DeleteModal = ({ name, onConfirm, onCancel, loading }) => (
  <div className="hosp-modal-overlay" onClick={onCancel}>
    <div className="hosp-modal" onClick={e => e.stopPropagation()}>
      <div className="hosp-modal-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </div>
      <h2 className="hosp-modal-title">Delete doctor?</h2>
      <p className="hosp-modal-msg">
        You are about to permanently delete{" "}
        <span className="hosp-modal-name">{name}</span>. This action cannot
        be undone and will remove all their data from the system.
      </p>
      <div className="hosp-modal-actions">
        <button className="hosp-btn hosp-btn--ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="hosp-btn hosp-btn--danger" onClick={onConfirm} disabled={loading}>
          {loading ? <span className="hosp-spinner" /> : "Delete"}
        </button>
      </div>
    </div>
  </div>
);





// ── Main component ─────────────────────────────────────────────────────────
const HospitalInfo = () => {
  const navigate = useNavigate();
  const { hospitalId } = useParams();
  const token = getToken();

  // Dashboard
  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError]     = useState("");

  // Doctors
  const [doctors, setDoctors]         = useState([]);
  const [docPage, setDocPage]         = useState(1);
  const [docTotal, setDocTotal]       = useState({ pages: 1, items: 0, size: 10 });
  const [docSearch, setDocSearch]     = useState("");
  const [docLoading, setDocLoading]   = useState(true);
  const [docError, setDocError]       = useState("");
  const [trq, settrq]         = useState([]);


  // Receptionists
  const [receps, setReceps]           = useState([]);
  const [recPage, setRecPage]         = useState(1);
  const [recTotal, setRecTotal]       = useState({ pages: 1, items: 0, size: 10 });
  const [recSearch, setRecSearch]     = useState("");
  const [recLoading, setRecLoading]   = useState(true);
  const [recError, setRecError]       = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError]   = useState("");
    const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

// ////////////////////////////
// ////////////////////////////
// ////////////////////////////
// ////////////////////////////
// Delete Hospital
const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this hospital? This action cannot be undone.")) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`https://tumorhospital.runasp.net/api/Hospital/${hospitalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.Message || data.message || "Failed to delete hospital. It may have doctors or receptionists associated with it.";
        setError(msg);
        return;
      }

      // Success - navigate away
      navigate(-1); 
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setDeleting(false);
    }
  };




// ////////////////////////////
// ////////////////////////////
// ////////////////////////////
// ////////////////////////////
// ////////////////////////////




  const debouncedDocSearch = useDebounce(docSearch, 400);
  const debouncedRecSearch = useDebounce(recSearch, 400);

  // ── Auth guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // ── Dashboard fetch ────────────────────────────────────────────────────
  useEffect(() => {
    if (!hospitalId || !token) return;
    setDashLoading(true);
    setDashError("");

    fetch(`https://tumorhospital.runasp.net/api/Hospital/dashboard/${hospitalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (res.status === 401) { navigate("/login"); return; }
        if (!res.ok) { setDashError("Failed to load dashboard."); return; }
        setDashboard(await res.json());
      })
      .catch(() => setDashError("Server error. Please try again."))
      .finally(() => setDashLoading(false));
  }, [hospitalId, token, navigate]);

  // ── Doctors fetch ──────────────────────────────────────────────────────
  const fetchDoctors = useCallback(() => {
    if (!hospitalId || !token) return;
    setDocLoading(true);
    setDocError("");

    const params = new URLSearchParams({ pageNumber: docPage });
    if (debouncedDocSearch) params.set("doctorName", debouncedDocSearch);
    fetch(
      `https://tumorhospital.runasp.net/api/Hospital/${hospitalId}/doctors?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(async res => {
        console.log(hospitalId);
        if (res.status === 401) { navigate("/login"); return; }
        if (!res.ok) { setDocError("Failed to load doctors."); return; }
        const response = await res.json();
        setDoctors(response.data ?? []);
        settrq(response.data);
        setDocTotal({ pages: response.totalPages ?? 1, items: response.totalItems ?? 0, size: response.pageSize ?? 10 });
        console.log(response);
        // console.log(response.response[0].firstName);
        console.log("-----------");
        console.log(doctors);
        console.log(trq);
        console.log(response.data);
      })
      .catch(() => setDocError("Server error loading doctors."))
      .finally(() => setDocLoading(false));
  }, [hospitalId, token, docPage, debouncedDocSearch, navigate]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  // Reset to page 1 when search changes
  useEffect(() => { setDocPage(1); }, [debouncedDocSearch]);

  // ── Receptionists fetch ────────────────────────────────────────────────
  const fetchReceps = useCallback(() => {
    if (!hospitalId || !token) return;
    setRecLoading(true);
    setRecError("");

    const params = new URLSearchParams({ pageNumber: recPage });
    if (debouncedRecSearch) params.set("receptionistName", debouncedRecSearch);

    fetch(
      `https://tumorhospital.runasp.net/api/Hospital/${hospitalId}/receptionists?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
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

  // ── Delete doctor ──────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch(
        `https://tumorhospital.runasp.net/api/Admin/Doctor/${deleteTarget.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) { navigate("/login"); return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.errors?.Identity?.[0] || data.message || "Delete failed.";
        setDeleteError(msg);
        return;
      }
      setDeleteTarget(null);
      fetchDoctors();
      // Also refresh dashboard numbers
      setDashboard(prev => prev ? { ...prev, numberOfDoctors: Math.max(0, (prev.numberOfDoctors ?? 1) - 1) } : prev);
    } catch {
      setDeleteError("Server error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Dashboard skeleton ────────────────────────────────────────────────
  const StatSkeleton = () => (
    <div className="hosp-stats-grid">
      {[1,2,3,4].map(i => (
        <div key={i} className="hosp-stat-card hosp-stat-card--blue">
          <div className="hosp-skeleton hosp-skeleton-circle" style={{ width: 42, height: 42, borderRadius: 10 }} />
          <div>
            <div className="hosp-skeleton hosp-skeleton-line" style={{ width: 60, marginBottom: 8 }} />
            <div className="hosp-skeleton hosp-skeleton-line" style={{ width: 100 }} />
          </div>
        </div>
      ))}
    </div>
  );

  // ── Table skeleton ────────────────────────────────────────────────────
  const TableSkeleton = ({ rows = 5 }) => (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="hosp-skeleton-row">
          <div className="hosp-skeleton hosp-skeleton-circle" />
          <div style={{ flex: 1 }}>
            <div className="hosp-skeleton hosp-skeleton-line" style={{ width: "55%", marginBottom: 6 }} />
            <div className="hosp-skeleton hosp-skeleton-line" style={{ width: "30%" }} />
          </div>
          <div className="hosp-skeleton hosp-skeleton-line" style={{ width: 80 }} />
        </div>
      ))}
    </div>
  );

  // ── Doctor capacity pct ───────────────────────────────────────────────
  const docPct = dashboard?.maxNumberOfDoctors
    ? (dashboard.numberOfDoctors / dashboard.maxNumberOfDoctors) * 100 : 0;
  const recPct = dashboard?.maxNumberOfReceptionists
    ? (dashboard.numberOfReceptionists / dashboard.maxNumberOfReceptionists) * 100 : 0;
  return (
    <div className="hosp-page">
      <div className="hosp-inner">

        {/* ── Back ── */}
        <button className="hosp-back-btn" onClick={() => navigate("/admin")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to hospitals
        </button>

        {/* ── Page header ── */}
        <div className="hosp-page-header">
          <div>
            <h1 className="hosp-page-title">Hospital Dashboard</h1>
            <p className="hosp-page-subtitle">Capacity overview and staff management</p>
          </div>
        </div>

        {/* ══ DASHBOARD STATS ══ */}
        {dashLoading ? <StatSkeleton /> : dashError ? (
          <div className="hosp-alert">{dashError}</div>
        ) : (
          <div className="hosp-stats-grid">
            <StatCard
              colorClass="blue"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              value={dashboard?.numberOfDoctors}
              label="Doctors"
              sub={`of ${dashboard?.maxNumberOfDoctors} max`}
              fillPct={docPct}
            />
            <StatCard
              colorClass="navy"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
              value={dashboard?.numberOfReceptionists}
              label="Receptionists"
              sub={`of ${dashboard?.maxNumberOfReceptionists} max`}
              fillPct={recPct}
            />
            <StatCard
              colorClass="green"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              value={dashboard?.maxNumberOfDoctors}
              label="Doctor Capacity"
              sub="Maximum allowed"
            />
            <StatCard
              colorClass="orange"
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              value={dashboard?.maxNumberOfReceptionists}
              label="Receptionist Capacity"
              sub="Maximum allowed"
            />
          </div>
        )}

        {/* ══ DOCTORS PANEL ══ */}
        <div className="hosp-panel">
          <div className="hosp-panel-header">
            <div>
              <h2 className="hosp-panel-title">Doctors</h2>
              <p className="hosp-panel-count">
                {docTotal.items > 0 ? `${docTotal.items} total` : ""}
              </p>
            </div>
            <div className="hosp-search-wrap">
              <span className="hosp-search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                className="hosp-search-input"
                type="text"
                placeholder="Search by name…"
                value={docSearch}
                onChange={e => setDocSearch(e.target.value)}
              />
            </div>
          </div>

          {deleteError && <div className="hosp-alert" style={{ margin: "0 1.25rem 0" }}>{deleteError}</div>}

          <div className="hosp-table-wrap">
            {docLoading ? (
              <TableSkeleton rows={5} />
            ) : docError ? (
              <div className="hosp-empty">
                <div className="hosp-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p className="hosp-empty-title">Failed to load</p>
                <p className="hosp-empty-msg">{docError}</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="hosp-empty">
                <div className="hosp-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <p className="hosp-empty-title">No doctors found</p>
                <p className="hosp-empty-msg">
                  {docSearch ? "Try a different search term." : "No doctors are assigned to this hospital yet."}
                </p>
              </div>
            ) : (
              <table className="hosp-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Gender</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div className="hosp-doc-cell">
                          <div className="hosp-doc-avatar">
                            {doc.profileImageUrl ? (
                              <img src={doc.profileImageUrl} alt={doc.fullName} />
                            ) : (
                              <span className="hosp-doc-avatar-initials">
                                {initials(doc.fullName)}
                              </span>
                            )}
                          </div>
                          <span className="hosp-doc-name">{`${doc.firstName || ""} ${doc.lastName || ""}`.trim() || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`hosp-badge hosp-badge--${(doc.gender || "").toLowerCase()}`}>
                          {doc.gender || "—"}
                        </span>
                      </td>
                      <td>
                        <div className="hosp-row-actions">
                          <button
                            className="hosp-action-btn hosp-action-btn--view"
                            onClick={() => navigate(`DoctorDetail/${doc.id}`, { state: { hospitalId } })}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            View
                          </button>
                          <button
                            className="hosp-action-btn hosp-action-btn--delete"
                            onClick={() => { setDeleteError(""); setDeleteTarget({ id: doc.id, name: doc.fullName }); }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <Pagination
            currentPage={docPage}
            totalPages={docTotal.pages}
            totalItems={docTotal.items}
            pageSize={docTotal.size}
            onPageChange={setDocPage}
          />
        </div>

        {/* ══ RECEPTIONISTS PANEL ══ */}
        <div className="hosp-panel">
          <div className="hosp-panel-header">
            <div>
              <h2 className="hosp-panel-title">Receptionists</h2>
              <p className="hosp-panel-count">
                {recTotal.items > 0 ? `${recTotal.items} total` : ""}
              </p>
            </div>
            <div className="hosp-search-wrap">
              <span className="hosp-search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                className="hosp-search-input"
                type="text"
                placeholder="Search by name…"
                value={recSearch}
                onChange={e => setRecSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="hosp-table-wrap">
            {recLoading ? (
              <TableSkeleton rows={4} />
            ) : recError ? (
              <div className="hosp-empty">
                <p className="hosp-empty-title">Failed to load</p>
                <p className="hosp-empty-msg">{recError}</p>
              </div>
            ) : receps.length === 0 ? (
              <div className="hosp-empty">
                <div className="hosp-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <p className="hosp-empty-title">No receptionists found</p>
                <p className="hosp-empty-msg">
                  {recSearch ? "Try a different search term." : "No receptionists assigned to this hospital yet."}
                </p>
              </div>
            ) : (
              <table className="hosp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {receps.map(rec => (
                    <tr key={rec.id}>
                      <td>
                        <div className="hosp-doc-cell">
                          <div className="hosp-doc-avatar">
                            <span className="hosp-doc-avatar-initials">
                              {initials(rec.name)}
                            </span>
                          </div>
                          <span className="hosp-doc-name">{rec.name || "—"}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--muted)" }}>
                        {rec.id?.slice(0, 8)}…
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <Pagination
            currentPage={recPage}
            totalPages={recTotal.pages}
            totalItems={recTotal.items}
            pageSize={recTotal.size}
            onPageChange={setRecPage}
          />
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { if (!deleteLoading) { setDeleteTarget(null); setDeleteError(""); } }}
          loading={deleteLoading}
        />
      )}
  <div>
    <button className="hosp-action-btn hosp-action-btn--view" onClick={() => navigate(`/admin/HospitalInfo/${hospitalId}/UpdateHospital`, { state: { hospitalId } })}> 
      Update Hospital data
      </button>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginTop: "1.75rem" }}>
                <button 
                  type="button" 
                  className="hosp-btn hosp-btn--danger" 
                  onClick={handleDelete} 
                  disabled={submitting || deleting}
                >
                  {deleting ? <span className="hosp-spinner" /> : "Delete Hospital"}
                </button>
                
                <div style={{ display: "flex", gap: "0.65rem" }}>
                  <button type="button" className="hosp-btn hosp-btn--ghost" onClick={() => navigate(-1)} disabled={submitting || deleting}>Cancel</button>
                  <button type="submit" className="hosp-btn hosp-btn--primary" disabled={submitting || deleting}>
                    {submitting ? <span className="hosp-spinner" /> : "Save Changes"}
                  </button>
                </div>
              </div>  
    </div>  
    </div>
);
};



export default HospitalInfo;



