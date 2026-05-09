import { CheckCircle, ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./pagesStyle/donations.scss";
import PageLoad from "../pageLoad";

const TransactionSuccess = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let urlid = urlParams.get("invoice_id");

  fetch(
    `https://tumorhospital.runasp.net/api/Payment/fawaterak/webhooks/success?invoice_id=${urlid}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!urlid) {
    return <PageLoad />;
  }
  let amount = sessionStorage.getItem("amount");
  return (
    <div className="success-container">
      <div className="success-card">
        <div className="icon-wrapper">
          <CheckCircle size={64} className="icon-success" color="#10b981" />
        </div>

        <h1>Payment Successful!</h1>
        <p className="subtitle">
          Your transaction has been processed. A receipt has been sent to your
          registered email.
        </p>

        <div className="details-box">
          <div className="detail-row">
            <span className="label">Amount Paid</span>
            <span className="value amount">${amount}</span>
          </div>
          <div className="detail-row">
            <span className="label">Transaction ID</span>
            <span className="value">{urlid}</span>
          </div>
          <div className="detail-row">
            <span className="label">Date</span>
            <span className="value">{`${year}-${month + 1}-${day}`}</span>
          </div>
        </div>
        <NavLink to="/">
          <div className="action-group">
            <button className="btn btn-primary">
              Continue to Main Page <ArrowRight size={18} />
            </button>
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default TransactionSuccess;
