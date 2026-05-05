import "../Admin/style/admin.scss";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function Aupdateabout() {
  const [updatedabout, setupdatedabout] = useState({});
  const params = useParams();
  const myNavigator = useNavigate();

  useEffect(() => {
    fetch(`https://tumorhospital.runasp.net/api/about`)
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedabout),
    })
      .then((res) => {
        if (!res.ok) {
          throw "about couldn't be updated. Kindly try again";
        }
        return res.json();
      })
      .then((data) => {
        myNavigator("/admin");
      });
  }

  return (
    <>
      <div className="container-fluid">
        <h1 className="display-1 text-primary mt-5">Edit About</h1>
        <form onSubmit={updateabout} className="my-5">
          <div className="form-group">
            <label htmlFor="hospitalName">hospitalName</label>
            <input
              type="text"
              id="hospitalName"
              className="form-control mt-2 mb-4"
              value={updatedabout.hospitalName || ""}
              onChange={(e) =>
                setupdatedabout((prev) => ({
                  ...prev,
                  hospitalName: e.target.value,
                }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              className="form-control mt-2 mb-4"
              value={updatedabout.description || ""}
              onChange={(e) =>
                setupdatedabout((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="mission">Mission</label>
            <input
              type="text"
              id="mission"
              className="form-control mt-2 mb-4"
              value={updatedabout.mission || ""}
              onChange={(e) =>
                setupdatedabout((prev) => ({
                  ...prev,
                  mission: e.target.value,
                }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="vision">Vision</label>
            <input
              type="text"
              id="vision"
              className="form-control mt-2 mb-4"
              value={updatedabout.vision || ""}
              onChange={(e) =>
                setupdatedabout((prev) => ({ ...prev, vision: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="text"
              id="email"
              className="form-control mt-2 mb-4"
              value={updatedabout.email || ""}
              onChange={(e) =>
                setupdatedabout((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              className="form-control mt-2 mb-4"
              value={updatedabout.phone || ""}
              onChange={(e) =>
                setupdatedabout((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <button type="submit" className="btn btn-primary me-3">
              Update About
            </button>
            <Link to="/admin" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
export default Aupdateabout;
