import { useState } from "react";
import "../Admin/style/admin.scss"; // Ensure the path is correct for your project
import { Link, useNavigate } from "react-router-dom";
const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");
  
export default function Addfaq() {
  const token= getToken();
  const [faq, setfaq] = useState({});
  const myNavigator = useNavigate();

  function addfaq(e) {
    e.preventDefault();
    fetch(`https://tumorhospital.runasp.net/api/FAQs`, {
      method: "POST",
      headers: { "Content-Type": "application/json",Authorization: `Bearer ${token}` },
      body: JSON.stringify(faq),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("FAQ couldn't be created. Kindly try again");
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
          Add <span>FAQ</span>
        </h1>

        <form onSubmit={addfaq} className="admin-form">
          <div className="input-grid">
            {/* Question Field */}
            <div className="form-group full-width">
              <label htmlFor="Question">Question</label>
              <input
                type="text"
                id="Question"
                placeholder="Enter the common question here..."
                required
                onChange={(e) =>
                  setfaq((prev) => ({ ...prev, question: e.target.value }))
                }
              />
            </div>

            {/* Answer Field - Using textarea for better text entry */}
            <div className="form-group full-width">
              <label htmlFor="Answer">Answer</label>
              <textarea
                id="Answer"
                rows="5"
                placeholder="Provide a detailed answer..."
                required
                onChange={(e) =>
                  setfaq((prev) => ({ ...prev, answer: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Add FAQ
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
