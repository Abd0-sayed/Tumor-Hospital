import "./style/admin.scss";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function Aupdatefaq() {
  const [updatedfaq, setupdatedfaq] = useState({});
  const params = useParams();
  const myNavigator = useNavigate();
  const id = params.faqid;

  useEffect(() => {
    fetch(`https://tumorhospital.runasp.net/api/FAQs`)
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
  }, []);

  function updatefaq(e) {
    e.preventDefault();
    fetch(`https://tumorhospital.runasp.net/api/FAQs/${params.faqid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedfaq),
    })
      .then((res) => {
        if (!res.ok) {
          throw "Faq couldn't be updated. Kindly try again";
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
        <h1 className="display-1 text-primary mt-5">Edit FAQ</h1>
        <form onSubmit={updatefaq} className="my-5">
          <div className="form-group">
            <label htmlFor="question">Question</label>
            <input
              type="text"
              id="question"
              className="form-control mt-2 mb-4"
              value={updatedfaq.question || ""}
              onChange={(e) =>
                setupdatedfaq((prev) => ({ ...prev, question: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="answer">Answer</label>
            <input
              type="text"
              id="answer"
              className="form-control mt-2 mb-4"
              value={updatedfaq.answer || ""}
              onChange={(e) =>
                setupdatedfaq((prev) => ({ ...prev, answer: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary me-3">
              Update FAQ
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
export default Aupdatefaq;
