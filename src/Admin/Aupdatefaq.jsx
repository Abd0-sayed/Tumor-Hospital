import "./style/admin.scss";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");
  
function Aupdatefaq() {
  const token= getToken();
  const [updatedfaq, setupdatedfaq] = useState({});
  const params = useParams();
  const myNavigator = useNavigate();
  const id = params.faqid;

//
 useEffect(() => {
    if (!token) {
      myNavigator("/login", { replace: true });
    }
  }, [token, myNavigator]);

  if (!token) return null;
  //

  useEffect(() => {
    fetch(`https://tumorhospital.runasp.net/api/FAQs`,{ headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) {
          throw "Couldn't fetch data";
        }
        return res.json();
      })
      .then((data) => {
        const item = data.find((obj) => obj.id === Number(id));
        setupdatedfaq(item);
      })
      .catch((errors) => console.log(errors));
  }, [id]);

  function updatefaq(e) {
    e.preventDefault();
    fetch(`https://tumorhospital.runasp.net/api/FAQs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json",Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedfaq),
    })
      .then((res) => {
        if (!res.ok) {
          throw "Faq couldn't be updated. Kindly try again";
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
          Edit <span>FAQ</span>
        </h1>

        <form onSubmit={updatefaq} className="admin-form">
          <div className="form-group full-width">
            <label htmlFor="question">Question</label>
            <input
              type="text"
              id="question"
              value={updatedfaq.question || ""}
              onChange={(e) =>
                setupdatedfaq((prev) => ({ ...prev, question: e.target.value }))
              }
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="answer" className="para">
              Answer
            </label>
            <textarea
              type="text"
              id="answer"
              className="form-control"
              value={updatedfaq.answer || ""}
              onChange={(e) =>
                setupdatedfaq((prev) => ({ ...prev, answer: e.target.value }))
              }
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Update FAQ
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

export default Aupdatefaq;
