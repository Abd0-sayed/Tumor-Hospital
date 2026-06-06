import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Admin/style/admin.scss";
const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");
  
export default function Addreceptionist() {
  const token= getToken();
  const [hospitalname, sethosName] = useState([]);
  const myNavigator = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    hospitalName: "",
    email: "",
    gender: "",
    address: "",
  });

//
 useEffect(() => {
    if (!token) {
      myNavigator("/login", { replace: true });
    }
  }, [token, myNavigator]);

  if (!token) return null;
  //
  
  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Hospitals",{ headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => sethosName(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (e) => {
    setFormData((prev) => ({ ...prev, gender: e.target.value }));
  };

  function Addrec(e) {
    e.preventDefault();
    console.log(formData);
    fetch(`https://tumorhospital.runasp.net/api/Admin/create-receptionist`, {
      method: "POST",
      headers: { "Content-Type": "application/json",Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Receptionist couldn't be created.");
        return res.json();
      })
      .then(() => myNavigator("/admin"))
      .catch((err) => console.error(err));
  }

  return (
    <div className="admin-form-page">
      <div className="form-card">
        <h1 className="form-title">
          Add <span>Receptionist</span>
        </h1>

        <form onSubmit={Addrec} className="admin-form">
          <div className="input-grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter first name"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter last name"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@hospital.com"
                onChange={handleChange}
                required
              />
            </div>

            {/* Hospital Selection with specific class for arrow */}
            <div className="form-group select-group">
              <label htmlFor="hospitalName">Assigned Hospital</label>
              <select
                id="hospitalName"
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

            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Residential address"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
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
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Create Receptionist
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
