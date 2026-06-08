import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/admin.scss";
import "./style/doctor.scss";
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export default function Adddoctor() {
  const token = getToken();
  const [Specialization, setSpec] = useState([]);
  const [hospitalname, sethosName] = useState([]);
  const myNavigator = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    specializationName: "",
    hospitalName: "",
    isVideoCallDoctor: false,
    consultationCost: 0,
    followUpCost: 0,
    videoCallCost: 0,
    schedules: [],
  });

  const dayOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  //
  useEffect(() => {
    if (!token) {
      myNavigator("/login", { replace: true });
    }
  }, [token, myNavigator]);

  if (!token) return null;
  //

  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Specialization", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error(err));

    fetch("https://tumorhospital.runasp.net/api/Hospitals", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => sethosName(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (e) => {
    setFormData((prev) => ({ ...prev, gender: e.target.value }));
  };

  const handleVedioChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isVideoCallDoctor: e.target.value === "true",
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const exists = prev.schedules.find((d) => d.dayOfWeek === day);
      if (exists) {
        return {
          ...prev,
          schedules: prev.schedules.filter((d) => d.dayOfWeek !== day),
        };
      } else {
        return {
          ...prev,
          schedules: [...prev.schedules, { dayOfWeek: day, startTime: "" }],
        };
      }
    });
  };

  const handleTimeChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.map((d) =>
        d.dayOfWeek === day ? { ...d, [field]: value } : d,
      ),
    }));
  };

  function createDoctor(e) {
    e.preventDefault();
    if (formData.schedules.length < 3) {
      alert("Select at least 3 days");
      return;
    }
    for (let s of formData.schedules) {
      if (!s.startTime) {
        alert(`Please set time for ${s.dayOfWeek}`);
        return;
      }
    }

    fetch(`https://tumorhospital.runasp.net/api/Admin/create-doctor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Doctor couldn't be created.");
        return res.json();
      })
      .then(() => myNavigator("/admin"))
      .catch((err) => console.error(err));
  }

  return (
    <div className="admin-form-page">
      <div className="form-card">
        <h1 className="form-title">
          Add <span>Doctor</span>
        </h1>

        <form onSubmit={createDoctor} className="admin-form">
          <div className="input-grid">
            {/* Personal Info */}
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter first name"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter last name"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="doctor@hospital.com"
                onChange={handleChange}
                required
              />
            </div>

            {/* Selects */}
            <div className="form-group select-group">
              <label>Specialization</label>
              <select
                value={formData.specializationName}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    specializationName: e.target.value,
                  }))
                }
                required
              >
                <option value="">Select Specialization</option>
                {Specialization.map((spc) => (
                  <option key={spc.id} value={spc.name}>
                    {spc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group select-group">
              <label>Hospital</label>
              <select
                value={formData.hospitalName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, hospitalName: e.target.value }))
                }
                required
              >
                <option value="">Select Hospital</option>
                {hospitalname.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Radio Options */}
            <div className="form-group">
              <label>Gender</label>
              <div className="gender-radio-group">
                <label className="radio-label">
                  <input
                    name="gender"
                    type="radio"
                    value="Male"
                    onChange={handleGenderChange}
                    required
                  />
                  <span>Male</span>
                </label>
                <label className="radio-label">
                  <input
                    name="gender"
                    type="radio"
                    value="Female"
                    onChange={handleGenderChange}
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Video Call Available?</label>
              <div className="gender-radio-group">
                <label className="radio-label">
                  <input
                    name="vedio"
                    type="radio"
                    value="true"
                    onChange={handleVedioChange}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-label">
                  <input
                    name="vedio"
                    type="radio"
                    value="false"
                    onChange={handleVedioChange}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* Costs Section */}
            <div className="form-group">
              <label>Consultation Cost</label>
              <input
                type="number"
                name="consultationCost"
                value={formData.consultationCost}
                onChange={handleNumberChange}
              />
            </div>
            <div className="form-group">
              <label>Follow Up Cost</label>
              <input
                type="number"
                name="followUpCost"
                value={formData.followUpCost}
                onChange={handleNumberChange}
              />
            </div>
            <div className="form-group full-width">
              <label>Video Call Cost</label>
              <input
                type="number"
                name="videoCallCost"
                value={formData.videoCallCost}
                onChange={handleNumberChange}
              />
            </div>

            {/* Schedule Section */}
            <div className="form-group full-width">
              <label style={{ marginBottom: "1.5rem" }}>
                Weekly Schedule (Min. 3 Days)
              </label>
              <div className="schedule-list">
                {dayOfWeek.map((day) => {
                  const selectedDay = formData.schedules.find(
                    (d) => d.dayOfWeek === day,
                  );
                  return (
                    <div
                      key={day}
                      className={`schedule-item ${selectedDay ? "active" : ""}`}
                    >
                      <label className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={!!selectedDay}
                          onChange={() => handleDayToggle(day)}
                        />
                        <span>{day}</span>
                      </label>
                      {selectedDay && (
                        <input
                          type="time"
                          value={selectedDay.startTime}
                          onChange={(e) =>
                            handleTimeChange(day, "startTime", e.target.value)
                          }
                          className="time-picker"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Add Doctor
            </button>
            <Link to="/admin" className="btn-cancel">
              Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
