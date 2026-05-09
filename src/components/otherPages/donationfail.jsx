import { NavLink } from "react-router-dom";
import { XCircle, RefreshCw } from "lucide-react";
import "./pagesStyle/donations.scss"; // Assuming you kept them in the same file or imported accordingly

const TransactionFailure = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let urlid = urlParams.get("invoice_id");
  let errorMsg = urlParams.get("errorMessage");

  fetch(
    `https://tumorhospital.runasp.net/api/Payment/fawaterak/webhooks/fail?invoice_id=${urlid}&errorMessage=${errorMsg}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    },
  );

  return (
    <div className="failure-container">
      <div className="failure-card">
        <div className="icon-wrapper-error">
          <XCircle size={64} color="#EF4444" strokeWidth={2.5} />
        </div>

        <h1>Payment Failed</h1>
        <p className="subtitle">We couldn't process your transaction </p>

        <div className="action-group">
          <NavLink to={"/donations"}>
            <button
              className="btn btn-primary"
              style={{ backgroundColor: "#EF4444" }} // Override primary color for "Danger"
            >
              <RefreshCw size={18} /> Try Again
            </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default TransactionFailure;
