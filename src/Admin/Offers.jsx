import { useState, useEffect, useCallback } from "react";
import "./style/Offers.scss";

const API = "https://tumorhospital.runasp.net/api";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  title: "",
  description: "",
  discountPercentage: "",
  startDate: "",
  endDate: "",
});

// ── Extract server error (matches existing app error shape) ───────────────────
const extractServerError = (data) => {
  const errs = data.Errors || data.errors || {};
  return (
    errs.Message?.[0] || errs.message?.[0] ||
    errs.Title?.[0]   || errs.title?.[0]   ||
    errs.StartDate?.[0] || errs.EndDate?.[0] ||
    errs.DiscountPercentage?.[0] ||
    data.message || "Something went wrong. Please try again."
  );
};

// ── Client-side validation ────────────────────────────────────────────────────
const validateForm = (form, isReactivate = false) => {
  const errs = {};
  const today = todayStr();

  if (!form.title.trim())
    errs.title = "Title is required.";
  else if (form.title.trim().length > 100)
    errs.title = "Title cannot exceed 100 characters.";

  const pct = Number(form.discountPercentage);
  if (form.discountPercentage === "" || isNaN(pct))
    errs.discountPercentage = "Discount percentage is required.";
  else if (pct <= 0 || pct > 100)
    errs.discountPercentage = "Discount must be between 1 and 100.";
  else if (!Number.isInteger(pct))
    errs.discountPercentage = "Discount must be a whole number.";

  if (!form.startDate)
    errs.startDate = "Start date is required.";
  else if (isReactivate && form.startDate < today)
    errs.startDate = "Start date must be today or in the future when reactivating.";

  if (!form.endDate)
    errs.endDate = "End date is required.";

  if (form.startDate && form.endDate && form.endDate <= form.startDate)
    errs.endDate = "End date must be after the start date.";

  return errs;
};

// ════════════════════════════════════════════════════════════════════════════
// OFFER FORM (shared by Add, Edit, Reactivate)
// ════════════════════════════════════════════════════════════════════════════
const OfferForm = ({
  mode,          // "add" | "edit" | "reactivate"
  initial,       // prefill data for edit/reactivate
  onSuccess,
  onClose,
}) => {
  const isReactivate = mode === "reactivate";
  const isEdit       = mode === "edit" || isReactivate;
  const offerId      = initial?.id;

  const [form, setForm]         = useState(() => ({
    title:              initial?.title              ?? "",
    description:        initial?.description        ?? "",
    discountPercentage: initial?.discountPercentage ?? "",
    startDate:          isReactivate ? todayStr()   : (initial?.startDate ?? ""),
    endDate:            isReactivate ? ""            : (initial?.endDate   ?? ""),
  }));
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async () => {
    const errs = validateForm(form, isReactivate);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true); setApiError("");
    const body = {
      title:              form.title.trim(),
      description:        form.description.trim() || "",
      discountPercentage: Number(form.discountPercentage),
      startDate:          form.startDate,
      endDate:            form.endDate,
    };

    const url    = isEdit ? `${API}/Offers/${offerId}` : `${API}/Offers`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res  = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Try to map field-level errors from server
        const serverErrs = data.Errors || data.errors || {};
        const fieldMap = {
          title:              serverErrs.Title?.[0]              || serverErrs.title?.[0],
          description:        serverErrs.Description?.[0]        || serverErrs.description?.[0],
          discountPercentage: serverErrs.DiscountPercentage?.[0] || serverErrs.discountPercentage?.[0],
          startDate:          serverErrs.StartDate?.[0]          || serverErrs.startDate?.[0],
          endDate:            serverErrs.EndDate?.[0]            || serverErrs.endDate?.[0],
        };
        const hasFieldErrs = Object.values(fieldMap).some(Boolean);
        if (hasFieldErrs) {
          setFieldErrors(fieldMap);
        } else {
          setApiError(extractServerError(data));
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => { onSuccess(); }, 900);
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    add:        { title: "New Offer",        sub: "Fill in the details to create a new offer." },
    edit:       { title: "Edit Offer",       sub: "Update the offer details below." },
    reactivate: { title: "Reactivate Offer", sub: "Update dates to bring this expired offer back." },
  };

  return (
    <div className={`off-card-edit-panel${isReactivate ? " off-card-edit-panel--reactivate" : ""}`}>
      {success ? (
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem", color: "var(--success, #1A7A4A)", fontWeight: 600, fontSize: ".9rem" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="20 6 9 17 4 12" /></svg>
          {mode === "add" ? "Offer created!" : isReactivate ? "Offer reactivated!" : "Offer updated!"}
        </div>
      ) : (
        <>
          <div className="off-form-header" style={{ marginBottom: ".85rem" }}>
            <div className="off-form-icon">
              {isReactivate ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
              ) : isEdit ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              )}
            </div>
            <div>
              <p className="off-form-title">{labels[mode].title}</p>
              <p className="off-form-subtitle">{labels[mode].sub}</p>
            </div>
          </div>

          {apiError && (
            <div key={apiError} className="off-alert off-alert--error" style={{ marginBottom: ".9rem" }}>
              <span>⚠️</span><span>{apiError}</span>
            </div>
          )}

          <div className="off-form-grid">
            {/* Title */}
            <div className={`off-form-field off-form-field--full${fieldErrors.title ? " has-error" : ""}`}>
              <label htmlFor="off-title">Title <span style={{ color: "#D0392B" }}>*</span></label>
              <input
                id="off-title" name="title" type="text"
                placeholder="e.g. Summer Discount"
                value={form.title} onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors.title && <span className="off-field-error">{fieldErrors.title}</span>}
            </div>

            {/* Description */}
            <div className={`off-form-field off-form-field--full${fieldErrors.description ? " has-error" : ""}`}>
              <label htmlFor="off-desc">Description</label>
              <textarea
                id="off-desc" name="description"
                placeholder="Optional — describe what this offer covers"
                value={form.description} onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors.description && <span className="off-field-error">{fieldErrors.description}</span>}
            </div>

            {/* Discount */}
            <div className={`off-form-field${fieldErrors.discountPercentage ? " has-error" : ""}`}>
              <label htmlFor="off-pct">Discount % <span style={{ color: "#D0392B" }}>*</span></label>
              <input
                id="off-pct" name="discountPercentage" type="number"
                min="1" max="100" step="1"
                placeholder="e.g. 20"
                value={form.discountPercentage} onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors.discountPercentage && <span className="off-field-error">{fieldErrors.discountPercentage}</span>}
            </div>

            {/* Start date */}
            <div className={`off-form-field${fieldErrors.startDate ? " has-error" : ""}`}>
              <label htmlFor="off-start">Start Date <span style={{ color: "#D0392B" }}>*</span></label>
              <input
                id="off-start" name="startDate" type="date"
                min={isReactivate ? todayStr() : undefined}
                value={form.startDate} onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors.startDate && <span className="off-field-error">{fieldErrors.startDate}</span>}
            </div>

            {/* End date */}
            <div className={`off-form-field${fieldErrors.endDate ? " has-error" : ""}`}>
              <label htmlFor="off-end">End Date <span style={{ color: "#D0392B" }}>*</span></label>
              <input
                id="off-end" name="endDate" type="date"
                min={form.startDate || (isReactivate ? todayStr() : undefined)}
                value={form.endDate} onChange={handleChange}
                disabled={loading}
              />
              {fieldErrors.endDate && <span className="off-field-error">{fieldErrors.endDate}</span>}
            </div>
          </div>

          <div className="off-form-actions">
            <button className="off-form-cancel-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="off-form-submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="off-spinner" /> : (
                mode === "add" ? "Create Offer"
                  : isReactivate ? "Reactivate"
                  : "Save Changes"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// DELETE MODAL
// ════════════════════════════════════════════════════════════════════════════
const DeleteModal = ({ offer, onConfirm, onCancel, loading, error }) => (
  <div className="off-modal-overlay" onClick={onCancel}>
    <div className="off-modal" onClick={e => e.stopPropagation()}>
      <div className="off-modal-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </div>
      <h2 className="off-modal-title">Delete offer?</h2>
      <p className="off-modal-msg">
        You're about to permanently delete{" "}
        <span className="off-modal-name">"{offer.title}"</span>.
        This action cannot be undone.
      </p>
      {error && (
        <div className="off-alert off-alert--error" style={{ marginBottom: ".9rem" }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}
      <div className="off-modal-actions">
        <button className="off-modal-cancel-btn" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="off-modal-delete-btn" onClick={onConfirm} disabled={loading}>
          {loading ? <span className="off-spinner" /> : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// SKELETON CARDS
// ════════════════════════════════════════════════════════════════════════════
const SkeletonCards = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="off-skeleton-card">
        <div className="off-skeleton off-skeleton-box" />
        <div className="off-skeleton-lines">
          <div className="off-skeleton off-skeleton-line off-skeleton-line--wide" />
          <div className="off-skeleton off-skeleton-line off-skeleton-line--medium" />
          <div className="off-skeleton off-skeleton-line off-skeleton-line--short" />
        </div>
      </div>
    ))}
  </>
);

// ════════════════════════════════════════════════════════════════════════════
// OFFER CARD
// ════════════════════════════════════════════════════════════════════════════
const OfferCard = ({ offer, type, onEdit, onDelete, onReactivate, editingId, onCloseEdit, onRefresh }) => {
  const isEditing = editingId === offer.id;

  return (
    <div className="off-card-wrap">
      <div className="off-card">
        {/* Discount badge */}
        <div className={`off-discount-badge off-discount-badge--${type}`}>
          <span className="off-discount-pct">{offer.discountPercentage}%</span>
          <span className="off-discount-label">OFF</span>
        </div>

        {/* Info */}
        <div className="off-card-info">
          <h3 className="off-card-title">{offer.title}</h3>
          {offer.description ? (
            <p className="off-card-desc">{offer.description}</p>
          ) : (
            <p className="off-card-desc off-card-desc--empty">No description provided.</p>
          )}
          <div className="off-card-dates">
            <span className="off-date-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {fmtDate(offer.startDate)}
            </span>
            <span className="off-date-arrow">→</span>
            <span className="off-date-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {fmtDate(offer.endDate)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="off-card-actions">
          {type === "expired" ? (
            <>
              <button
                className="off-action-btn off-action-btn--reactivate"
                onClick={() => onReactivate(offer.id)}
                title="Reactivate this offer with new dates"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Reactivate
              </button>
              <button
                className="off-action-btn off-action-btn--delete"
                onClick={() => onDelete(offer)}
                title="Delete offer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                className="off-action-btn off-action-btn--edit"
                onClick={() => onEdit(offer.id)}
                title="Edit offer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Update
              </button>
              <button
                className="off-action-btn off-action-btn--delete"
                onClick={() => onDelete(offer)}
                title="Delete offer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inline edit/reactivate panel */}
      {isEditing && (
        <OfferForm
          mode={type === "expired" ? "reactivate" : "edit"}
          initial={offer}
          onSuccess={() => { onCloseEdit(); onRefresh(); }}
          onClose={onCloseEdit}
        />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// SECTION PANEL
// ════════════════════════════════════════════════════════════════════════════
const SectionPanel = ({ type, title, icon, offers, loading, error, onEdit, onDelete, onReactivate, editingId, onCloseEdit, onRefresh }) => {
  const isEmpty = !loading && !error && offers.length === 0;

  const emptyMessages = {
    current:  "No active offers right now.",
    upcoming: "No upcoming offers scheduled.",
    expired:  "No expired offers found.",
  };

  return (
    <div className={`off-section off-section--${type}`}>
      <div className="off-section-header">
        <div className={`off-section-badge off-section-badge--${type}`}>{icon}</div>
        <div className="off-section-title-wrap">
          <h2 className="off-section-title">{title}</h2>
          <p className="off-section-count">
            {loading ? "Loading…" : error ? "Failed to load" : `${offers.length} offer${offers.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="off-list">
        {loading ? (
          <SkeletonCards count={2} />
        ) : error ? (
          <div className="off-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="off-empty-msg">{error}</p>
          </div>
        ) : isEmpty ? (
          <div className="off-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
              <path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
            <p className="off-empty-msg">{emptyMessages[type]}</p>
          </div>
        ) : (
          offers.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              type={type}
              onEdit={onEdit}
              onDelete={onDelete}
              onReactivate={onReactivate}
              editingId={editingId}
              onCloseEdit={onCloseEdit}
              onRefresh={onRefresh}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN OFFERS PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function Offers() {
  // Data
  const [current,  setCurrent]  = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [expired,  setExpired]  = useState([]);

  // Loading
  const [loadingCurrent,  setLoadingCurrent]  = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingExpired,  setLoadingExpired]  = useState(true);

  // Errors
  const [errorCurrent,  setErrorCurrent]  = useState("");
  const [errorUpcoming, setErrorUpcoming] = useState("");
  const [errorExpired,  setErrorExpired]  = useState("");

  // UI state
  const [showAddForm, setShowAddForm]   = useState(false);
  const [editingId,   setEditingId]     = useState(null);   // id of card whose edit panel is open
  const [deleteTarget, setDeleteTarget] = useState(null);   // { id, title }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState("");

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchCurrent = useCallback(async () => {
    setLoadingCurrent(true); setErrorCurrent("");
    try {
      const res  = await fetch(`${API}/Offers/Offers`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json().catch(() => []);
      if (!res.ok) { setErrorCurrent("Failed to load current offers."); return; }
      setCurrent(Array.isArray(data) ? data : []);
    } catch { setErrorCurrent("Network error loading current offers."); }
    finally  { setLoadingCurrent(false); }
  }, []);

  const fetchUpcoming = useCallback(async () => {
    setLoadingUpcoming(true); setErrorUpcoming("");
    try {
      const res  = await fetch(`${API}/Offers/UpcomingOffers`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json().catch(() => []);
      if (!res.ok) { setErrorUpcoming("Failed to load upcoming offers."); return; }
      setUpcoming(Array.isArray(data) ? data : []);
    } catch { setErrorUpcoming("Network error loading upcoming offers."); }
    finally  { setLoadingUpcoming(false); }
  }, []);

  const fetchExpired = useCallback(async () => {
    setLoadingExpired(true); setErrorExpired("");
    try {
      const res  = await fetch(`${API}/Offers/ExpiredOffers`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json().catch(() => []);
      if (!res.ok) { setErrorExpired("Failed to load expired offers."); return; }
      setExpired(Array.isArray(data) ? data : []);
    } catch { setErrorExpired("Network error loading expired offers."); }
    finally  { setLoadingExpired(false); }
  }, []);

  const refreshAll = useCallback(() => {
    fetchCurrent();
    fetchUpcoming();
    fetchExpired();
  }, [fetchCurrent, fetchUpcoming, fetchExpired]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const handleEdit       = (id) => setEditingId(prev => prev === id ? null : id);
  const handleReactivate = (id) => setEditingId(prev => prev === id ? null : id);
  const handleCloseEdit  = ()   => setEditingId(null);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteRequest = (offer) => {
    setDeleteError("");
    setDeleteTarget({ id: offer.id, title: offer.title });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true); setDeleteError("");
    try {
      const res  = await fetch(`${API}/Offers/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setDeleteError(extractServerError(data)); return; }
      setDeleteTarget(null);
      refreshAll();
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="off-page">
      <div className="off-inner">

        {/* Page header */}
        <div className="off-page-header">
          <div>
            <h1 className="off-page-title">Offers</h1>
            <p className="off-page-subtitle">Manage discounts and promotional offers</p>
          </div>
          <button
            className="off-add-btn"
            onClick={() => { setShowAddForm(prev => !prev); setEditingId(null); }}
          >
            {showAddForm ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Offer
              </>
            )}
          </button>
        </div>

        {/* Add offer form */}
        {showAddForm && (
          <div className="off-form-panel">
            <div className="off-form-header">
              <div className="off-form-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
                  <path d="M12 22V7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              </div>
              <div>
                <p className="off-form-title">New Offer</p>
                <p className="off-form-subtitle">Fill in the details to create a new promotional offer.</p>
              </div>
            </div>

            <OfferForm
              mode="add"
              initial={null}
              onSuccess={() => { setShowAddForm(false); refreshAll(); }}
              onClose={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Current offers */}
        <SectionPanel
          type="current"
          title="Current Offers"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
          offers={current}
          loading={loadingCurrent}
          error={errorCurrent}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onReactivate={handleReactivate}
          editingId={editingId}
          onCloseEdit={handleCloseEdit}
          onRefresh={refreshAll}
        />

        {/* Upcoming offers */}
        <SectionPanel
          type="upcoming"
          title="Upcoming Offers"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" /><line x1="12" y1="14" x2="12" y2="18" />
              <line x1="10" y1="16" x2="14" y2="16" />
            </svg>
          }
          offers={upcoming}
          loading={loadingUpcoming}
          error={errorUpcoming}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onReactivate={handleReactivate}
          editingId={editingId}
          onCloseEdit={handleCloseEdit}
          onRefresh={refreshAll}
        />

        {/* Expired offers */}
        <SectionPanel
          type="expired"
          title="Expired Offers"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          }
          offers={expired}
          loading={loadingExpired}
          error={errorExpired}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onReactivate={handleReactivate}
          editingId={editingId}
          onCloseEdit={handleCloseEdit}
          onRefresh={refreshAll}
        />
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          offer={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { if (!deleteLoading) { setDeleteTarget(null); setDeleteError(""); } }}
          loading={deleteLoading}
          error={deleteError}
        />
      )}
    </div>
  );
}
