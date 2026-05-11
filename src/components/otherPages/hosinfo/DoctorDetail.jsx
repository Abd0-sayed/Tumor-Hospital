
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./Hospital.css";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const buildInitials = (name = "") => {
  const p = name.trim().split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
};

const formatCurrency = (val) =>
  val !== null && val !== undefined
    ? `$${Number(val).toLocaleString()}`
    : null;

const ALLOWED_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

/* ══════════════════════════════════════════════════════════════
Inline Add-Schedule Panel
══════════════════════════════════════════════════════════════ */
const AddSchedulePanel = ({ docId, existingDays, onSuccess, onClose }) => {
  const token = getToken();
  const takenDays = new Set((existingDays || []).map(d => d.day));
  const [form, setForm] = useState({ dayOfWeek: "", startTime: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.dayOfWeek) e.dayOfWeek = "Please select a day";
    if (!form.startTime) e.startTime = "Please enter a start time";
    else {
      const [h, m] = form.startTime.split(":").map(Number);
      const totalMinutes = h * 60 + m;
      if (totalMinutes < 360) e.startTime = "Start time must be 06:00 or later";
      if (totalMinutes > 960) e.startTime = "Start time must be 16:00 or earlier";
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setServerError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true); setServerError(""); setSuccessMsg("");

    try {
      const res = await fetch(
        `https://tumorhospital.runasp.net/api/Schedule?docId=${docId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dayOfWeek: form.dayOfWeek, startTime: form.startTime + "" })
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errsObj = data.errors || data.Errors || {};
        const msg = errsObj.dayOfWeek?.[0] || errsObj.DayOfWeek?.[0] || errsObj.startTime?.[0] || errsObj.StartTime?.[0] || errsObj.Identity?.[0] || errsObj.identity?.[0] || data.message || "Failed to create schedule. Please try again.";
        setServerError(msg);
        return;
      }
      setSuccessMsg("Schedule created successfully!");
      setForm({ dayOfWeek: "", startTime: "" });
      setFieldErrors({});
      setTimeout(() => onSuccess(), 900);
    } catch {
      setServerError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hosp-schedule-form-panel">
      <p className="hosp-schedule-form-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="12" y1="14" x2="12" y2="18"/>
          <line x1="10" y1="16" x2="14" y2="16"/>
        </svg>
        Add working day
      </p>
      {serverError && <div className="hosp-schedule-alert">{serverError}</div>}
      {successMsg && (
        <div className="hosp-schedule-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {successMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="hosp-schedule-form-row">
          <div className={`hosp-schedule-field ${fieldErrors.dayOfWeek ? "has-error" : ""}`}>
            <label htmlFor="sched-day">Day of week</label>
            <select id="sched-day" name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange}>
              <option value="">Select a day…</option>
              {ALLOWED_DAYS.map(day => (
                <option key={day} value={day} disabled={takenDays.has(day)}>
                  {day}{takenDays.has(day) ? " (already assigned)" : ""}
                </option>
              ))}
            </select>
            {fieldErrors.dayOfWeek && <span className="hosp-schedule-field-error">{fieldErrors.dayOfWeek}</span>}
          </div>
          <div className={`hosp-schedule-field ${fieldErrors.startTime ? "has-error" : ""}`}>
            <label htmlFor="sched-time">Start time</label>
            <input id="sched-time" name="startTime" type="time" min="06:00" max="16:00" value={form.startTime} onChange={handleChange} />
            <span className="hosp-schedule-hint">Between 06:00 and 16:00 — shift is 8 hours</span>
            {fieldErrors.startTime && <span className="hosp-schedule-field-error">{fieldErrors.startTime}</span>}
          </div>
        </div>
        <div className="hosp-schedule-form-actions">
          <button type="button" className="hosp-btn hosp-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="hosp-btn hosp-btn--primary" disabled={loading}>{loading ? <span className="hosp-spinner" /> : "Add schedule"}</button>
        </div>
      </form>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
Inline Edit-Schedule Panel
══════════════════════════════════════════════════════════════ */
const EditSchedulePanel = ({ docId, scheduleId, initialDay, initialTime, onSuccess, onClose }) => {
  const token = getToken();
  const parseTime = (t) => t ? t.substring(0, 5) : "";
  const [form, setForm] = useState({ dayOfWeek: initialDay || "", startTime: parseTime(initialTime) });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.dayOfWeek) e.dayOfWeek = "Please select a day";
    if (!form.startTime) e.startTime = "Please enter a start time";
    else {
      const [h, m] = form.startTime.split(":").map(Number);
      const total = h * 60 + m;
      if (total < 360) e.startTime = "Start time must be 06:00 or later";
      if (total > 960) e.startTime = "Start time must be 16:00 or earlier";
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true); setServerError("");
    try {
      const res = await fetch(
        `https://tumorhospital.runasp.net/api/Schedule?scheduleId=${scheduleId}&docId=${docId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dayOfWeek: form.dayOfWeek, startTime: form.startTime + ":00" })
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.errors?.dayOfWeek?.[0] || data.errors?.startTime?.[0] || data.message || "Failed to update schedule.";
        setServerError(msg);
        return;
      }
      onSuccess();
    } catch {
      setServerError("Server error. Please try again later.");
    } finally { setLoading(false); }
  };

  return (
    <div className="hosp-schedule-form-panel hosp-schedule-form-panel--edit">
      <p className="hosp-schedule-form-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Update working day
      </p>
      {serverError && <div className="hosp-schedule-alert">{serverError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="hosp-schedule-form-row">
          <div className={`hosp-schedule-field ${fieldErrors.dayOfWeek ? "has-error" : ""}`}>
            <label htmlFor="edit-day">Day of week</label>
            <select id="edit-day" name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange}>
              <option value="">Select a day…</option>
              {ALLOWED_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            {fieldErrors.dayOfWeek && <span className="hosp-schedule-field-error">{fieldErrors.dayOfWeek}</span>}
          </div>
          <div className={`hosp-schedule-field ${fieldErrors.startTime ? "has-error" : ""}`}>
            <label htmlFor="edit-time">Start time</label>
            <input id="edit-time" name="startTime" type="time" min="06:00" max="16:00" value={form.startTime} onChange={handleChange} />
            <span className="hosp-schedule-hint">Between 06:00 and 16:00</span>
            {fieldErrors.startTime && <span className="hosp-schedule-field-error">{fieldErrors.startTime}</span>}
          </div>
        </div>
        <div className="hosp-schedule-form-actions">
          <button type="button" className="hosp-btn hosp-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="hosp-btn hosp-btn--primary" disabled={loading}>{loading ? <span className="hosp-spinner" /> : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
Inline Delete-Confirm Panel
══════════════════════════════════════════════════════════════ */
const DeleteConfirmPanel = ({ docId, scheduleId, onSuccess, onClose }) => {
  const token = getToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(
        `https://tumorhospital.runasp.net/api/Schedule?scheduleId=${scheduleId}&doctorId=${docId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || "Cannot delete schedule. Ensure minimum 3 working days and no pending/approved appointments.";
        setError(msg);
        return;
      }
      onSuccess();
    } catch {
      setError("Server error. Please try again later.");
    } finally { setLoading(false); }
  };

  return (
    <div className="hosp-schedule-form-panel hosp-schedule-form-panel--delete">
      <p className="hosp-schedule-form-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
        Confirm deletion
      </p>
      {error && <div className="hosp-schedule-alert">{error}</div>}
      <p className="hosp-schedule-confirm-msg">Are you sure you want to remove this working day? This action cannot be undone.</p>
      <div className="hosp-schedule-form-actions">
        <button className="hosp-btn hosp-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="hosp-btn hosp-btn--danger" onClick={handleDelete} disabled={loading}>{loading ? <span className="hosp-spinner" /> : "Delete schedule"}</button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
Main DoctorDetail component
══════════════════════════════════════════════════════════════ */
const DoctorDetail = () => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const { state } = useLocation();
  const hospitalId = state?.hospitalId;
  const token = getToken();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDoctor = () => {
    if (!token) { navigate("/login"); return; }
    if (!docId) { setError("No doctor ID provided."); setLoading(false); return; }
    setLoading(true); setError("");

    fetch(`https://tumorhospital.runasp.net/api/Hospital/doctor/${docId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        if (res.status === 401) { navigate("/login"); return; }
        if (res.status === 403) { setError("You don't have permission to view this doctor."); return; }
        if (!res.ok) { setError("Doctor not found or unavailable."); return; }
        setDoctor(await res.json());
        // console.log(doctor);
        
      })
      .catch(() => setError("Server error. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctor(); }, [docId]);

  const handleScheduleSuccess = () => {
    setShowAddForm(false);
    setEditingId(null);
    setDeletingId(null);
    fetchDoctor();
  };

  const scheduleCount = doctor?.workingDays?.length ?? 0;
  const scheduleIsFull = scheduleCount >= 5;
  const canDelete = scheduleCount > 3;

  if (loading) {
    return (
      <div className="hosp-detail-page">
        <div className="hosp-detail-inner">
          <div className="hosp-detail-card">
            <div className="hosp-detail-hero">
              <div className="hosp-skeleton hosp-skeleton-circle" />
              <div className="hosp-skeleton-flex">
                <div className="hosp-skeleton hosp-skeleton-line hosp-skeleton-line--wide" />
                <div className="hosp-skeleton hosp-skeleton-line" />
              </div>
            </div>
            <div className="hosp-detail-body">
              <div className="hosp-skeleton hosp-skeleton-line hosp-skeleton-line--wide" />
              <div className="hosp-skeleton hosp-skeleton-line" />
              <div className="hosp-skeleton hosp-skeleton-line hosp-skeleton-line--narrow" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hosp-detail-page">
        <div className="hosp-detail-inner">
          <button className="hosp-back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div className="hosp-detail-card">
            <div className="hosp-detail-body">
              <div className="hosp-empty">
                <div className="hosp-empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p className="hosp-empty-title">Unable to load</p>
                <p className="hosp-empty-msg">{error}</p>
                <button className="hosp-btn hosp-btn--primary" onClick={() => navigate(-1)}>Go back</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasImage = !!doctor?.profileImageUrl;
  const consultation = formatCurrency(doctor?.consultationCost);
  const followUp = formatCurrency(doctor?.followUpCost);
  const surgery = formatCurrency(doctor?.surgeryCost);

  return (
    <div className="hosp-detail-page">
      <div className="hosp-detail-inner">
        <button className="hosp-back-btn" onClick={() => hospitalId ? navigate(`/admin/HospitalInfo//${hospitalId}`) : navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to hospital
        </button>

        <div className="hosp-detail-card">
          <div className="hosp-detail-hero">
            <div className="hosp-detail-avatar">
              {hasImage ? (
                <img src={doctor.profileImageUrl} alt={doctor.fullName} />
              ) : (
                <span className="hosp-detail-avatar-initials">{buildInitials(doctor?.fullName)}</span>
              )}
            </div>
            <div className="hosp-detail-hero-info">
              <h1 className="hosp-detail-name">Dr. {doctor?.fullName || "— "}</h1>
              <div className="hosp-detail-spec">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                {doctor?.specialization || "General "}
              </div>
              <div className="hosp-detail-meta">
                <span className="hosp-detail-chip">{doctor?.gender || "—"}</span>
                {doctor?.isSurgeon && <span className="hosp-detail-chip hosp-detail-chip--surgeon">✦ Surgeon</span>}
              </div>
            </div>
          </div>

          <div className="hosp-detail-body">
            {doctor?.bio && (
              <>
                <div className="hosp-detail-section-title">About</div>
                <p className="hosp-detail-bio">{doctor.bio}</p>
                <div className="hosp-divider" />
              </>
            )}

            <div className="hosp-detail-section-title">Consultation fees</div>
            <div className="hosp-cost-grid">
              <div className="hosp-cost-card">
                <span className="hosp-cost-label">Consultation</span>
                {consultation ? <span className="hosp-cost-value">{consultation}</span> : <span className="hosp-cost-value--na">Not set</span>}
              </div>
              <div className="hosp-cost-card">
                <span className="hosp-cost-label">Follow-up</span>
                {followUp ? <span className="hosp-cost-value">{followUp}</span> : <span className="hosp-cost-value--na">Not set</span>}
              </div>
              <div className="hosp-cost-card">
                <span className="hosp-cost-label">Surgery</span>
                {doctor?.isSurgeon ? surgery ? <span className="hosp-cost-value">{surgery}</span> : <span className="hosp-cost-value--na">Not set</span> : <span className="hosp-cost-value--na">Not a surgeon</span>}
              </div>
            </div>

            <div className="hosp-divider" />

            <div className="hosp-schedule-header">
              <div className="hosp-schedule-header-left">
                <span className="hosp-schedule-section-title">Working schedule</span>
                <span className={`hosp-schedule-limit ${scheduleIsFull ? "hosp-schedule-limit--full" : ""}`}>{scheduleCount}/5 days</span>
              </div>
              <button className="hosp-schedule-add-btn" onClick={() => setShowAddForm(prev => !prev)} disabled={scheduleIsFull} title={scheduleIsFull ? "Maximum of 5 working days reached" : "Add a working day"}>
                {showAddForm ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add schedule
                  </>
                )}
              </button>
            </div>

            {showAddForm && (
              <AddSchedulePanel
                docId={docId}
                existingDays={doctor?.workingDays ?? []}
                onSuccess={handleScheduleSuccess}
                onClose={() => setShowAddForm(false)}
              />
            )}

            {doctor?.workingDays?.length > 0 ? (
              <div className="hosp-schedule-list">
                {doctor.workingDays.map((wd) => {
                  const schedId = wd.id || wd.scheduleId;
                  const isEditing = editingId === schedId;
                  const isDeleting = deletingId === schedId;

                  return (
                    <div key={schedId} className="hosp-schedule-wrapper">
                      <div className="hosp-schedule-row">
                        <span className="hosp-schedule-day">{wd.day}</span>
                        <span className="hosp-schedule-time">
                          <span className="hosp-schedule-dot" />
                          {wd.fromTime} — {wd.toTime}
                        </span>
                        <div className="hosp-schedule-actions">
                          <button className="hosp-schedule-edit-btn" onClick={() => setEditingId(isEditing ? null : schedId)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Update
                          </button>
                          <button className="hosp-schedule-delete-btn" onClick={() => setDeletingId(isDeleting ? null : schedId)} disabled={!canDelete} title={!canDelete ? "Minimum 3 working days required" : "Delete schedule"}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                      {isEditing && (
                        <EditSchedulePanel
                          docId={docId}
                          scheduleId={schedId}
                          initialDay={wd.day}
                          initialTime={wd.fromTime}
                          onSuccess={handleScheduleSuccess}
                          onClose={() => setEditingId(null)}
                        />
                      )}
                      {isDeleting && (
                        <DeleteConfirmPanel
                          docId={docId}
                          scheduleId={schedId}
                          onSuccess={handleScheduleSuccess}
                          onClose={() => setDeletingId(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="hosp-schedule-empty">No working schedule defined yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
