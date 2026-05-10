import  { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./Hospital.css";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const initials = (name = "") => {
  const p = name.trim().split(" ");
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
};

const formatCurrency = (val) =>
  val !== null && val !== undefined
    ? `$${Number(val).toLocaleString()}`
    : null;

const DoctorDetail = () => {
  const navigate  = useNavigate();
  const { docId } = useParams();
  const { state }    = useLocation();
  const hospitalId   = state?.hospitalId;
  const token = getToken();

  const [doctor,  setDoctor]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (!docId) { setError("No doctor ID provided."); setLoading(false); return; }

    fetch(
      `https://tumorhospital.runasp.net/api/Hospital/doctor/${docId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(async res => {
        if (res.status === 401) { navigate("/login"); return; }
        if (res.status === 403) { setError("You don't have permission to view this doctor."); return; }
        if (!res.ok) { setError("Doctor not found or unavailable."); return; }
        setDoctor(await res.json());
      })
      .catch(() => setError("Server error. Please try again."))
      .finally(() => setLoading(false));
  }, [docId, token, navigate]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="hosp-detail-page">
        <div className="hosp-detail-inner">
          <div className="hosp-detail-card">
            <div className="hosp-detail-hero">
              <div className="hosp-skeleton hosp-skeleton-circle" style={{ width: 88, height: 88, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="hosp-skeleton hosp-skeleton-line" style={{ width: "55%", marginBottom: 10 }} />
                <div className="hosp-skeleton hosp-skeleton-line" style={{ width: "30%" }} />
              </div>
            </div>
            <div className="hosp-detail-body">
              <div className="hosp-skeleton hosp-skeleton-line" style={{ width: "80%", marginBottom: 10 }} />
              <div className="hosp-skeleton hosp-skeleton-line" style={{ width: "60%", marginBottom: 10 }} />
              <div className="hosp-skeleton hosp-skeleton-line" style={{ width: "40%" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
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
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p className="hosp-empty-title">Unable to load</p>
                <p className="hosp-empty-msg">{error}</p>
                <button className="hosp-btn hosp-btn--primary" onClick={() => navigate(-1)}>
                  Go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasImage = !!doctor?.profileImageUrl;
  const consultation = formatCurrency(doctor?.consultationCost);
  const followUp     = formatCurrency(doctor?.followUpCost);
  const surgery      = formatCurrency(doctor?.surgeryCost);

  return (
    <div className="hosp-detail-page">
      <div className="hosp-detail-inner">

        {/* ── Back ── */}
        <button
          className="hosp-back-btn"
          onClick={() => hospitalId
            ? navigate(`/admin/HospitalInfo//${hospitalId}`)
            : navigate(-1)
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to hospital
        </button>

        {/* ── Main card ── */}
        <div className="hosp-detail-card">

          {/* Hero section */}
          <div className="hosp-detail-hero">
            <div className="hosp-detail-avatar">
              {hasImage ? (
                <img src={doctor.profileImageUrl} alt={doctor.fullName} />
              ) : (
                <span className="hosp-detail-avatar-initials">
                  {initials(doctor?.fullName)}
                </span>
              )}
            </div>

            <div className="hosp-detail-hero-info">
              <h1 className="hosp-detail-name">
                Dr. {doctor?.fullName || "—"}
              </h1>
              <div className="hosp-detail-spec">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                {doctor?.specialization || "General"}
              </div>
              <div className="hosp-detail-meta">
                <span className="hosp-detail-chip">
                  {doctor?.gender || "—"}
                </span>
                {doctor?.isSurgeon && (
                  <span className="hosp-detail-chip hosp-detail-chip--surgeon">
                    ✦ Surgeon
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="hosp-detail-body">

            {/* Bio */}
            {doctor?.bio && (
              <>
                <div className="hosp-detail-section-title">About</div>
                <p className="hosp-detail-bio">{doctor.bio}</p>
                <div className="hosp-divider" />
              </>
            )}

            {/* Costs */}
            <div className="hosp-detail-section-title">Consultation fees</div>
            <div className="hosp-cost-grid">
              <div className="hosp-cost-card">
                <span className="hosp-cost-label">Consultation</span>
                {consultation
                  ? <span className="hosp-cost-value">{consultation}</span>
                  : <span className="hosp-cost-value--na">Not set</span>
                }
              </div>
              <div className="hosp-cost-card">
                <span className="hosp-cost-label">Follow-up</span>
                {followUp
                  ? <span className="hosp-cost-value">{followUp}</span>
                  : <span className="hosp-cost-value--na">Not set</span>
                }
              </div>
              <div className="hosp-cost-card">
                <span className="hosp-cost-label">Surgery</span>
                {doctor?.isSurgeon
                  ? surgery
                    ? <span className="hosp-cost-value">{surgery}</span>
                    : <span className="hosp-cost-value--na">Not set</span>
                  : <span className="hosp-cost-value--na">Not a surgeon</span>
                }
              </div>
            </div>

            <div className="hosp-divider" />

            {/* Working days */}
            <div className="hosp-detail-section-title">Working schedule</div>
            {doctor?.workingDays?.length > 0 ? (
              <div className="hosp-schedule-grid">
                {doctor.workingDays.map((wd, i) => (
                  <div key={i} className="hosp-schedule-row">
                    <span className="hosp-schedule-day">{wd.day}</span>
                    <span className="hosp-schedule-time">
                      <span className="hosp-schedule-dot" />
                      {wd.fromTime} — {wd.toTime}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hosp-schedule-empty">No working schedule defined.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
