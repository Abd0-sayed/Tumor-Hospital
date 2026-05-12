import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Hospital.css";

const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

const UpdateHospital = () => {
  const navigate = useNavigate();
  const { hospitalId } = useParams();
  const token = getToken();

  const [form, setForm] = useState({
    name: "",
    government: "",
    address: "",
    maxNumberOfDoctors: "",
    maxNumberOfReceptionists: ""
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [hospital, sethospital] = useState({});

 


useEffect(() => {
  if (!hospitalId || !token) return;

  hospitaldata();
}, [hospitalId, token]);

const hospitaldata = async () => {
  try {
    const res = await fetch(
      "https://tumorhospital.runasp.net/api/Hospitals",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 401) {
      navigate("/login");
      return;
    }

    if (!res.ok) {
      throw new Error("Failed to fetch hospitals");
    }

    const hospitals = await res.json();

    // find hospital by id
    const foundhospital = hospitals.find(h => h.id === hospitalId);
    if (!foundhospital) {
      setError("Hospital not found");
      return;
    }
    sethospital(foundhospital)

    // update form state
    setForm(prev => ({
      ...prev,
      name: foundhospital.name || "",
      government: foundhospital.government || "",
      address: foundhospital.address || "",
    }));

    console.log(hospital);

  } catch (err) {
    setError(err.message);
  }
};



  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchHospital();
  }, [hospitalId]);

  const fetchHospital = async () => {
    if (!hospitalId) { setError("Invalid hospital ID."); setInitialLoading(false); return; }
    try {
      const res = await fetch(`https://tumorhospital.runasp.net/api/Hospital/dashboard/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { navigate("/login"); return; }
      if (res.status === 403) { setError("You don't have permission to update this hospital."); setInitialLoading(false); return; }
      if (!res.ok) throw new Error("Failed to load hospital details");
      const data = await res.json();
      setForm(prev => ({
  ...prev,
  maxNumberOfDoctors:
    data.maxNumberOfDoctors ??
    data.MaxNumberOfDoctors ??
    "",
    
  maxNumberOfReceptionists:
    data.maxNumberOfReceptionists ??
    data.MaxNumberOfReceptionists ??
    ""
}));
      console.log(data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setError(""); setSuccess("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Hospital name is required.";
    else if (form.name.length > 100) errs.name = "Name must be 100 characters or less.";
    
    if (!form.government.trim()) errs.government = "Government is required.";
    else if (form.government.length > 100) errs.government = "Government must be 100 characters or less.";
    
    if (!form.address.trim()) errs.address = "Address is required.";
    else if (form.address.length > 300) errs.address = "Address must be 300 characters or less.";
    
    const doctors = Number(form.maxNumberOfDoctors);
    if (!form.maxNumberOfDoctors || isNaN(doctors)) errs.maxNumberOfDoctors = "Max doctors is required";
    else if (doctors < 1 || doctors > 200) errs.maxNumberOfDoctors = "Must be between 1 and 200";
    
    const receptionists = Number(form.maxNumberOfReceptionists);
    if (!form.maxNumberOfReceptionists || isNaN(receptionists)) errs.maxNumberOfReceptionists = "Max receptionists is required";
    else if (receptionists < 1 || receptionists > 200) errs.maxNumberOfReceptionists = "Must be between 1 and 200";
    
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setSubmitting(true); setError(""); setSuccess("");
    
    const nameToSend =
      hospital?.name === form.name ? "" : form.name.trim();

  const addressToSend =
      hospital?.address === form.address ? "" : form.address.trim();

    try {
      const res = await fetch(`https://tumorhospital.runasp.net/api/Hospital/${hospitalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: nameToSend,
          government: form.government.trim(),
          address: addressToSend,
          maxNumberOfDoctors: Number(form.maxNumberOfDoctors),
          maxNumberOfReceptionists: Number(form.maxNumberOfReceptionists)
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.Message || data.message || data.errors?.Name?.[0] || data.errors?.Address?.[0] || "Failed to update hospital. Check for duplicate name/address or validation errors.";
        setError(msg);
        return;
      }
      setSuccess(data.Message || data.message || "Hospital updated successfully!");
      setFieldErrors({});
      setTimeout(() => {
        navigate(`/admin/HospitalInfo/${hospitalId}`);
      }, 200);
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };
console.log(form);

  if (initialLoading) {
    return (
      <div className="hosp-page">
        <div className="hosp-inner">
          <div className="hosp-detail-card">
            <div className="hosp-detail-body" style={{ padding: "2rem" }}>
              <div className="hosp-skeleton-flex" style={{ gap: "1rem" }}>
                <div className="hosp-skeleton hosp-skeleton-line hosp-skeleton-line--wide" />
                <div className="hosp-skeleton hosp-skeleton-line hosp-skeleton-line--wide" />
                <div className="hosp-skeleton hosp-skeleton-line" />
                <div className="hosp-skeleton hosp-skeleton-line" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hosp-page">
      <style>{`
        .hosp-form-input {
          height: 42px; padding: 0 0.9rem; border: 1.5px solid var(--border); border-radius: var(--radius);
          background: var(--white); color: var(--dark); font-family: var(--ff-body); font-size: 0.9rem;
          outline: none; transition: border-color var(--transition), box-shadow var(--transition);
          width: 100%; box-sizing: border-box;
        }
        .hosp-form-input:focus {
          border-color: var(--blue); box-shadow: 0 0 0 3px rgba(26,143,227,0.13);
        }
        .hosp-schedule-field.has-error .hosp-form-input {
          border-color: var(--danger); background-color: var(--danger-bg);
        }
        .hosp-form-textarea {
          padding: 0.75rem 0.9rem; border: 1.5px solid var(--border); border-radius: var(--radius);
          background: var(--white); color: var(--dark); font-family: var(--ff-body); font-size: 0.9rem;
          outline: none; transition: border-color var(--transition), box-shadow var(--transition);
          width: 100%; box-sizing: border-box; min-height: 80px; resize: vertical;
        }
        .hosp-form-textarea:focus {
          border-color: var(--blue); box-shadow: 0 0 0 3px rgba(26,143,227,0.13);
        }
        .hosp-schedule-field.has-error .hosp-form-textarea {
          border-color: var(--danger); background-color: var(--danger-bg);
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>

      <div className="hosp-inner">
        <button className="hosp-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="hosp-detail-card">
          <div className="hosp-detail-hero" style={{ padding: "1.5rem 2rem" }}>
            <div className="hosp-detail-hero-info">
              <h1 className="hosp-detail-name" style={{ margin: 0, fontSize: "1.5rem" }}>Update Hospital Information</h1>
              <p style={{ color: "rgba(255,255,255,0.75)", margin: "0.4rem 0 0", fontSize: "0.85rem" }}>Modify details and capacity limits</p>
            </div>
          </div>

          <div className="hosp-detail-body">
            {error && <div className="hosp-schedule-alert">{error}</div>}
            {success && <div className="hosp-schedule-success">{success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="hosp-schedule-form-row">
                <div className={`hosp-schedule-field ${fieldErrors.name ? "has-error" : ""}`}>
                  <label htmlFor="h-name">Hospital Name</label>
                  <input id="h-name" className="hosp-form-input" type="text" name="name" value={form.name} onChange={handleChange} maxLength={100} placeholder="e.g. Central City Hospital" />
                  {fieldErrors.name && <span className="hosp-schedule-field-error">{fieldErrors.name}</span>}
                </div>
                <div className={`hosp-schedule-field ${fieldErrors.government ? "has-error" : ""}`}>
                  <label htmlFor="h-gov">Government / Region</label>
                  <input id="h-gov" className="hosp-form-input" type="text" name="government" value={form.government} onChange={handleChange} maxLength={100} placeholder="e.g. Cairo Governorate" />
                  {fieldErrors.government && <span className="hosp-schedule-field-error">{fieldErrors.government}</span>}
                </div>
              </div>

              <div className={`hosp-schedule-field ${fieldErrors.address ? "has-error" : ""}`} style={{ marginBottom: "1rem" }}>
                <label htmlFor="h-addr">Full Address</label>
                <textarea id="h-addr" className="hosp-form-textarea" name="address" value={form.address} onChange={handleChange} maxLength={300} placeholder="Street, Building, Postal Code, etc." />
                {fieldErrors.address && <span className="hosp-schedule-field-error">{fieldErrors.address}</span>}
              </div>

              <div className="hosp-schedule-form-row">
                <div className={`hosp-schedule-field ${fieldErrors.maxNumberOfDoctors ? "has-error" : ""}`}>
                  <label htmlFor="h-docs">Max Doctors (1-200)</label>
                  <input id="h-docs" className="hosp-form-input" type="number" name="maxNumberOfDoctors" min={1} max={200} value={form.maxNumberOfDoctors} onChange={handleChange} />
                  {fieldErrors.maxNumberOfDoctors && <span className="hosp-schedule-field-error">{fieldErrors.maxNumberOfDoctors}</span>}
                </div>
                <div className={`hosp-schedule-field ${fieldErrors.maxNumberOfReceptionists ? "has-error" : ""}`}>
                  <label htmlFor="h-receps">Max Receptionists (1-200)</label>
                  <input id="h-receps" className="hosp-form-input" type="number" name="maxNumberOfReceptionists" min={1} max={200} value={form.maxNumberOfReceptionists} onChange={handleChange} />
                  {fieldErrors.maxNumberOfReceptionists && <span className="hosp-schedule-field-error">{fieldErrors.maxNumberOfReceptionists}</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.65rem", justifyContent: "flex-end", marginTop: "1.75rem" }}>
                <button type="button" className="hosp-btn hosp-btn--ghost" onClick={() => navigate(-1)} disabled={submitting}>Cancel</button>
                <button type="submit" className="hosp-btn hosp-btn--primary" disabled={submitting}>
                  {submitting ? <span className="hosp-spinner" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateHospital;