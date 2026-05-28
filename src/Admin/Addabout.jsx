import { useState } from "react";
import "./style/about.scss";
import { Link, useNavigate } from "react-router-dom";

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

function Addabout() {
  const token= getToken();
  const [about, setabout] = useState({});
  const myNavigator = useNavigate();

  function addabout(e) {
    e.preventDefault();
    fetch(`https://tumorhospital.runasp.net/api/about`, {
      method: "POST",
      headers: { "Content-Type": "application/json" ,Authorization: `Bearer ${token}`},
      body: JSON.stringify(about),
    })
      .then((res) => {
        if (!res.ok) {
          throw "about couldn't be updated. Kindly try again";
        }
        return res.json();
      })
      .then(() => {
        myNavigator("/admin");
      });
  }

  return (
    <div className="admin-form-page">
      <div className="form-card">
        <h1 className="form-title">
          ADD <span>About</span>
        </h1>

        <form onSubmit={addabout} className="admin-form">
          <div className="input-grid">
            <div className="form-group full-width">
              <label htmlFor="hospitalName">Hospital Name</label>
              <input
                type="text"
                id="hospitalName"
                placeholder="Enter hospital name"
                onChange={(e) =>
                  setabout((prev) => ({
                    ...prev,
                    hospitalName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows="3"
                placeholder="Hospital overview..."
                onChange={(e) =>
                  setabout((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="mission">Mission</label>
              <input
                type="text"
                id="mission"
                onChange={(e) =>
                  setabout((prev) => ({ ...prev, mission: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="vision">Vision</label>
              <input
                type="text"
                id="vision"
                onChange={(e) =>
                  setabout((prev) => ({ ...prev, vision: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                placeholder="contact@hospital.com"
                onChange={(e) =>
                  setabout((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                placeholder="+20..."
                onChange={(e) =>
                  setabout((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Add About
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
export default Addabout;
