import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Admin/style/admin.scss"; // Ensure SASS is imported

export default function Addhospital() {
  const myNavigator = useNavigate();
  const [formData, setFormData] = useState({
    name: "", // Changed from firstName to match your input name
    government: "",
    address: "",
    maxNumberOfDoctors: 0,
    maxNumberOfReceptionists: 0,
  });

  // Basic Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Max to numbers
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    fetch(`https://tumorhospital.runasp.net/api/Hospital`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Hospital couldn't be created. Kindly try again");
        }
        return res.json();
      })
      .then(() => {
        myNavigator("/admin");
      })
      .catch((err) => console.error(err));
  }

  return (
    <div className="admin-form-page">
      <div className="form-card">
        <h1 className="form-title">
          Add <span>Hospital</span>
        </h1>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="input-grid">
            {/* Hospital Name */}
            <div className="form-group full-width">
              <label htmlFor="name">Hospital Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter hospital name"
                onChange={handleChange}
                required
              />
            </div>

            {/* Government */}
            <div className="form-group">
              <label htmlFor="government">Government / Province</label>
              <input
                type="text"
                id="government"
                name="government"
                placeholder="e.g. Cairo"
                onChange={handleChange}
                required
              />
            </div>

            {/* Address */}
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Street address"
                onChange={handleChange}
                required
              />
            </div>

            {/* Max Doctors */}
            <div className="form-group">
              <label htmlFor="maxNumberOfDoctors">Max Doctors</label>
              <input
                type="number"
                id="maxNumberOfDoctors"
                name="maxNumberOfDoctors"
                value={formData.maxNumberOfDoctors}
                onChange={handleNumberChange}
              />
            </div>

            {/* Max Receptionists */}
            <div className="form-group">
              <label htmlFor="maxNumberOfReceptionists">
                Max Receptionists
              </label>
              <input
                type="number"
                id="maxNumberOfReceptionists"
                name="maxNumberOfReceptionists"
                value={formData.maxNumberOfReceptionists}
                onChange={handleNumberChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Create Hospital
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
