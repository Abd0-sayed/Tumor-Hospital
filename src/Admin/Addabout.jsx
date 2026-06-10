import { useState, useEffect } from "react";
import "./style/about.scss";
import { Link, useNavigate } from "react-router-dom";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

function Addabout() {
  const token = getToken();
  const [about, setabout] = useState({});
  const myNavigator = useNavigate();

  //
  useEffect(() => {
    if (!token) {
      myNavigator("/login", { replace: true });
    }
  }, [token, myNavigator]);

  if (!token) return null;
  //
  async function addabout(e) {
    e.preventDefault();

    try {
      let accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      let response = await fetch("https://tumorhospital.runasp.net/api/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(about),
      });

      // Access token expired
      if (response.status === 401) {
        const refreshToken =
          localStorage.getItem("refreshToken") ||
          sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          myNavigator("/login");
          return;
        }

        // Call refresh endpoint
        const refreshResponse = await fetch(
          "https://tumorhospital.runasp.net/api/Auth/Refresh-Token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refreshToken,
            }),
          },
        );

        if (!refreshResponse.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("refreshToken");

          myNavigator("/login");
          return;
        }

        const refreshData = await refreshResponse.json();

        // Save new access token
        localStorage.setItem("token", refreshData.token);

        // Retry original request
        response = await fetch("https://tumorhospital.runasp.net/api/about", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshData.token}`,
          },
          body: JSON.stringify(about),
        });
      }

      if (!response.ok) {
        throw new Error("About couldn't be updated");
      }

      await response.json();

      myNavigator("/admin#about");
    } catch (error) {
      console.error(error);
    }
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
                maxLength={200}
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
                maxLength={2000}
                placeholder="Hospital overview..."
                onChange={(e) =>
                  setabout((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="mission">Mission</label>
              <textarea
                type="text"
                id="mission"
                maxLength={2000}
                onChange={(e) =>
                  setabout((prev) => ({ ...prev, mission: e.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="vision">Vision</label>
              <textarea
                type="text"
                maxLength={2000}
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
                maxLength={14}
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
