import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./style/Specialization.scss";

const API = "https://tumorhospital.runasp.net/api";
const NAME_MAX = 50;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const emptyForm = { name: "", description: "" };

// ── Field-level error extraction from server response ─────────────────────────
function extractError(data) {
  const errs = data.Errors || data.errors || {};
  return (
    errs.Message?.[0] ||
    errs.message?.[0] ||
    errs.Name?.[0] ||
    errs.name?.[0] ||
    errs.Description?.[0] ||
    errs.description?.[0] ||
    data.message ||
    "Something went wrong. Please try again."
  );
}

// ── Main form (Add + Edit) ────────────────────────────────────────────────────
export default function SpecializationForm() {
  const navigate  = useNavigate();
  const { id }    = useParams();           // present on Edit route
  const { state } = useLocation();         // { specialization } passed from list

  const isEdit = Boolean(id);

  const [form, setForm]         = useState(emptyForm);
  const [errors, setErrors]     = useState({});      // field-level
  const [apiError, setApiError] = useState("");      // form-level
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [originalName, setOriginalName] = useState("");
  // ── Pre-fill for edit ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isEdit) {
      const s = state?.specialization;
      if (s) {
        setForm({
          name: s.name || "",
          description: s.description === "N/A" ? "" : s.description || "",
        });
        setOriginalName(s.name || "");
      } else {
        // Fallback: fetch if arrived directly via URL
        fetchById();
      }
    }
  }, []);

  const fetchById = async () => {
    try {
      const res  = await fetch(`${API}/Specialization`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const found = data.find((s) => s.id === id);
        if (found) {
          setForm({
            name: found.name || "",
            description: found.description === "N/A" ? "" : found.description || "",
          });
            setOriginalName(found.name || "");
        }
      }
    } catch {
      setApiError("Failed to load specialization data.");
    }
  };

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    const name = form.name.trim();

    if (!name) {
      errs.name = "Name is required.";
    } else if (name.length > NAME_MAX) {
      errs.name = `Name cannot exceed ${NAME_MAX} characters.`;
    }

    return errs;
  };

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    setApiError("");
    setErrors({});
    const trimmedName = form.name.trim();

    const body = {
      name:  trimmedName === originalName ? "" : trimmedName,
      description: form.description.trim() || "N/A",
    };

    try {
      const url    = isEdit ? `${API}/Specialization/${id}` : `${API}/Specialization`;
      const method = isEdit ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Server may return field-specific errors
        const errs = data.Errors || data.errors || {};
        const fieldErrors = {};
        if (errs.Name?.[0])        fieldErrors.name        = errs.Name[0];
        if (errs.name?.[0])        fieldErrors.name        = errs.name[0];
        if (errs.Description?.[0]) fieldErrors.description = errs.Description[0];

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setApiError(extractError(data));
        }
        return;
      }

      setSuccess(true);
      // Redirect to list after short delay
      setTimeout(() => navigate("/admin/Specializations"), 1500);
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const nameLen = form.name.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="spec-form-page">
      <div className="spec-form-card">

        {/* Back link */}
        <button
          className="spec-back-link"
          onClick={() => navigate("/admin/Specializations")}
        >
          ← Back to Specializations
        </button>

        {/* Header */}
        <div className="spec-form-header">
          <div className="spec-form-icon">
            {isEdit ? "✏️" : "🩺"}
          </div>
          <div>
            <h1 className="spec-form-title">
              {isEdit ? "Edit Specialization" : "Add Specialization"}
            </h1>
            <p className="spec-form-subtitle">
              {isEdit
                ? "Update the specialization details below."
                : "Fill in the details to create a new specialization."}
            </p>
          </div>
        </div>

        {/* Success state */}
        {success ? (
          <div className="spec-form-success">
            <div className="spec-form-success-icon">✅</div>
            <p className="spec-form-success-title">
              {isEdit ? "Updated Successfully" : "Added Successfully"}
            </p>
            <p className="spec-form-success-msg">Redirecting to the list…</p>
          </div>
        ) : (
          <>
            {/* Form-level error */}
            {apiError && (
              <div key={apiError} className="spec-form-alert">
                <span>⚠️</span>
                <span>{apiError}</span>
              </div>
            )}

            {/* Name field */}
            <div className={`spec-field${errors.name ? " has-error" : ""}`}>
              <label htmlFor="spec-name">
                Name <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                id="spec-name"
                name="name"
                type="text"
                placeholder="e.g. Cardiology"
                value={form.name}
                onChange={handleChange}
                maxLength={NAME_MAX + 10} // allow typing over; we validate
                disabled={submitting}
                autoFocus
              />
              {/* Character counter */}
              <p
                className={`spec-char-count${nameLen > NAME_MAX ? " spec-char-count--over" : ""}`}
              >
                {nameLen} / {NAME_MAX}
              </p>
              {errors.name && (
                <p className="spec-field-error">{errors.name}</p>
              )}
            </div>

            {/* Description field */}
            <div className={`spec-field${errors.description ? " has-error" : ""}`}>
              <label htmlFor="spec-description">Description</label>
              <textarea
                id="spec-description"
                name="description"
                placeholder="Optional — brief description of this specialization"
                value={form.description}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.description && (
                <p className="spec-field-error">{errors.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="spec-form-actions">
              <button
                className="spec-cancel-btn"
                onClick={() => navigate("/admin/Specializations")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="spec-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spec-btn-spinner" />
                    {isEdit ? "Saving…" : "Adding…"}
                  </>
                ) : (
                  isEdit ? "Save Changes" : "Add Specialization"
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
