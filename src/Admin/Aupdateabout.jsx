import "./style/about.scss";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");  
  
function Aupdateabout() {
  const token= getToken();
  const [updatedabout, setupdatedabout] = useState({});
  const params = useParams();
  const myNavigator = useNavigate();

//
 useEffect(() => {
    if (!token) {
      myNavigator("/login", { replace: true });
    }
  }, [token, myNavigator]);

  if (!token) return null;
  //

  useEffect(() => {
    fetch(`https://tumorhospital.runasp.net/api/about`,{ headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) {
          throw "Couldn't fetch data";
        }
        return res.json();
      })
      .then((data) => {
        setupdatedabout(data);
      })
      .catch((errors) => console.log(errors));
  }, []);

  function updateabout(e) {
    e.preventDefault();
    fetch(`https://tumorhospital.runasp.net/api/about/${params.aboutid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json",Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedabout),
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
    <>
      <div className="admin-form-page">
        <div className="form-card">
          <h1 className="form-title">
            Edit <span>About</span>
          </h1>

          <form onSubmit={updateabout} className="admin-form">
            <div className="input-grid">
              {/* Hospital Name */}
              <div className="form-group full-width">
                <label htmlFor="hospitalName">Hospital Name</label>
                <input
                  type="text"
                  id="hospitalName"
                  placeholder="Enter hospital name"
                  value={updatedabout.hospitalName || ""}
                  onChange={(e) =>
                    setupdatedabout((prev) => ({
                      ...prev,
                      hospitalName: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  placeholder="Hospital overview..."
                  value={updatedabout.description || ""}
                  onChange={(e) =>
                    setupdatedabout((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Mission */}
              <div className="form-group">
                <label htmlFor="mission">Mission</label>
                <input
                  type="text"
                  id="mission"
                  value={updatedabout.mission || ""}
                  onChange={(e) =>
                    setupdatedabout((prev) => ({
                      ...prev,
                      mission: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Vision */}
              <div className="form-group">
                <label htmlFor="vision">Vision</label>
                <input
                  type="text"
                  id="vision"
                  value={updatedabout.vision || ""}
                  onChange={(e) =>
                    setupdatedabout((prev) => ({
                      ...prev,
                      vision: e.target.value,
                    }))
                  }
                />
              </div>

              {/* E-mail */}
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  placeholder="contact@hospital.com"
                  value={updatedabout.email || ""}
                  onChange={(e) =>
                    setupdatedabout((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  placeholder="+20..."
                  value={updatedabout.phone || ""}
                  onChange={(e) =>
                    setupdatedabout((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Update About
              </button>
              <Link to="/admin" className="btn-cancel">
                Back to Dashboard
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default Aupdateabout;
