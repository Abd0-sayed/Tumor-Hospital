import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Specialization.scss";

const API = "https://tumorhospital.runasp.net/api";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

// ── helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────
function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="spec-skeleton-row">
      <td><div className="spec-skeleton-line spec-skeleton-line--medium" /></td>
      <td><div className="spec-skeleton-line spec-skeleton-line--long" /></td>
      <td><div className="spec-skeleton-line spec-skeleton-line--short" /></td>
      <td />
    </tr>
  ));
}

// ── Delete modal ──────────────────────────────────────────────────────────────
function DeleteModal({ target, onClose, onConfirm, deleting }) {
  return (
    <div className="spec-modal-overlay" onClick={onClose}>
      <div className="spec-modal" onClick={(e) => e.stopPropagation()}>
        <div className="spec-modal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                            </svg></div>
        <h2 className="spec-modal-title">Delete Specialization</h2>
        <p className="spec-modal-msg">Are you sure you want to delete</p>
        <p className="spec-modal-name">"{target.name}"?</p>
        <div className="spec-modal-actions">
          <button
            className="spec-modal-cancel-btn"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="spec-modal-delete-btn"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <span className="spec-btn-spinner" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main list component ───────────────────────────────────────────────────────
export default function SpecializationList() {
  const navigate = useNavigate();

  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [alert, setAlert]         = useState(null); // { type: "error"|"success", msg }
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting]   = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchSpecializations = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch(`${API}/Specialization`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        const errs = data.Errors || data.errors || {};
        const msg =
          errs.Message?.[0] ||
          errs.message?.[0] ||
          data.message ||
          "Failed to load specializations.";
        setAlert({ type: "error", msg });
        return;
      }
      setSpecializations(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  // ── client-side search ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return specializations;
    const q = search.toLowerCase();
    return specializations.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [search, specializations]);

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setAlert(null);
    try {
      const res = await fetch(`${API}/Specialization/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errs = data.Errors || data.errors || {};
        const msg =
          errs.Message?.[0] ||
          errs.message?.[0] ||
          data.message ||
          "Failed to delete specialization.";
        setAlert({ type: "error", msg });
        setDeleteTarget(null);
        return;
      }
      setSpecializations((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setAlert({ type: "success", msg: `"${deleteTarget.name}" deleted successfully.` });
      setDeleteTarget(null);
    } catch {
      setAlert({ type: "error", msg: "Network error. Please try again." });
    } finally {
      setDeleting(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="spec-page">
      <div className="spec-inner">

        {/* Header */}
        <div className="spec-page-header">
          <div>
            <h1 className="spec-page-title">Specializations</h1>
            <p className="spec-page-subtitle">Manage hospital medical specializations</p>
          </div>
          <button
            className="spec-add-btn"
            onClick={() => navigate("/admin/Specializations/Add")}
          >
            ＋ Add Specialization
          </button>
        </div>

        {/* Alert */}
        {alert && (
          <div
            key={alert.msg}
            className={`spec-alert spec-alert--${alert.type}`}
          >
            <span>{alert.type === "error" ? "⚠️" : "✅"}</span>
            <span>{alert.msg}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="spec-toolbar">
          <div className="spec-search-wrap">
            <span className="spec-search-icon">🔍</span>
            <input
              className="spec-search-input"
              type="text"
              placeholder="Search specializations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p className="spec-count">
            <strong>{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "result" : "results"}
          </p>
        </div>

        {/* Table */}
        <div className="spec-table-card">
          <div className="spec-table-wrap">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="spec-empty">
                        <div className="spec-empty-icon">🩺</div>
                        <p className="spec-empty-title">
                          {search ? "No results found" : "No specializations yet"}
                        </p>
                        <p className="spec-empty-msg">
                          {search
                            ? "Try a different search term."
                            : "Add the first specialization using the button above."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id}>
                      <td className="spec-name-cell">{s.name}</td>
                      <td className="spec-desc-cell">
                        {s.description && s.description !== "N/A" ? (
                          <span className="spec-desc-text">{s.description}</span>
                        ) : (
                          <span className="spec-na">N/A</span>
                        )}
                      </td>
                      <td className="spec-date-cell">{formatDate(s.createdAt)}</td>
                      <td className="spec-actions-cell">
                        <button
                          className="spec-action-btn spec-action-btn--edit"
                          title="Edit"
                          onClick={() =>
                            navigate(`/admin/Specializations/Edit/${s.id}`, {
                              state: { specialization: s },
                            })
                          }
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button
                          className="spec-action-btn spec-action-btn--delete"
                          title="Delete"
                          onClick={() => setDeleteTarget({ id: s.id, name: s.name })}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          target={deleteTarget}
          onClose={() => !deleting && setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
