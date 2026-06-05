import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageLoad from "../pageLoad.jsx";
import "./pagesStyle/bills.scss";

const BillsGrid = () => {
  const role = sessionStorage.getItem("role");
  const isReceptionist = role === "Receptionist";

  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = parseInt(searchParams.get("page") || "1", 10);
  const patientName = searchParams.get("patientName") || "";
  const globalBillCode = searchParams.get("billCode") || "";

  // Custom simple month & year selections mapped directly out of URL params
  const monthFilter = searchParams.get("month") || "";
  const yearFilter = searchParams.get("year") || "";

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [activeModalBill, setActiveModalBill] = useState(null);
  const [enteredBillCode, setEnteredBillCode] = useState("");

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);

    if (key !== "page") newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePayBillSubmit = async (e) => {
    e.preventDefault();
    if (!activeModalBill || !enteredBillCode.trim()) return;

    const targetBillId = activeModalBill.billId;
    setActionLoadingId(targetBillId);

    try {
      const token = sessionStorage.getItem("token");
      const queryParams = new URLSearchParams();

      queryParams.append("billCode", enteredBillCode.trim());

      const payURL = `https://tumorhospital.runasp.net/api/Reception/Pay/${targetBillId}`;
      const response = await fetch(`${payURL}?${queryParams.toString()}`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

      setBills((prevBills) =>
        prevBills.map((bill) =>
          bill.billId === targetBillId ? { ...bill, status: "Paid" } : bill,
        ),
      );

      handleCloseVerificationModal();
    } catch (err) {
      console.error(err);
      alert(`Error processing payment: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenVerificationModal = (bill) => {
    setActiveModalBill(bill);
    setEnteredBillCode("");
  };

  const handleCloseVerificationModal = () => {
    setActiveModalBill(null);
    setEnteredBillCode("");
  };

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("token");
        const queryParams = new URLSearchParams();

        if (isReceptionist) {
          queryParams.append("pageNumber", pageNumber.toString());
          if (patientName) queryParams.append("patientName", patientName);
          if (globalBillCode) queryParams.append("billCode", globalBillCode);

          // Append simple month/year parameters explicitly if present
          if (monthFilter) queryParams.append("month", monthFilter);
          if (yearFilter) queryParams.append("year", yearFilter);
        }

        const fetchURL = isReceptionist
          ? "https://tumorhospital.runasp.net/api/Reception/bills"
          : "https://tumorhospital.runasp.net/api/Patient/bills";

        const response = await fetch(`${fetchURL}?${queryParams.toString()}`, {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        const result = await response.json();

        setBills(result.data || []);
        setTotalPages(result.totalPages || 0);
        setTotalRecords(result.totalRecords || 0);
      } catch (err) {
        setError("Failed to download bills ledger details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [
    pageNumber,
    patientName,
    globalBillCode,
    monthFilter,
    yearFilter,
    isReceptionist,
  ]);

  // Generate continuous option range down from current year
  const currentYear = new Date().getFullYear();
  const yearsArray = Array.from({ length: 8 }, (_, i) => currentYear - i);

  return (
    <div className="doctor-profile">
      <div className="profile-dashboard-header">
        <h1>{isReceptionist ? "Billing Overview" : "My Invoices"}</h1>
        <p className="subtitle">
          Total Statements: <strong>{totalRecords}</strong>
        </p>

        {isReceptionist && (
          <div className="filter-card-panel">
            <div className="input-field-wrapper">
              <input
                type="text"
                placeholder="Search patient name..."
                value={patientName}
                onChange={(e) =>
                  handleFilterChange("patientName", e.target.value)
                }
              />
            </div>
            <div className="input-field-wrapper">
              <input
                type="text"
                placeholder="Enter bill code..."
                value={globalBillCode}
                onChange={(e) => handleFilterChange("billCode", e.target.value)}
              />
            </div>

            {/* Custom Month Select Field */}
            <div className="input-field-wrapper custom-select-wrapper">
              <select
                value={monthFilter}
                onChange={(e) => handleFilterChange("month", e.target.value)}
                className="filter-select-element"
              >
                <option value="">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* Custom Year Select Field */}
            <div className="input-field-wrapper custom-select-wrapper">
              <select
                value={yearFilter}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                className="filter-select-element"
              >
                <option value="">All Years</option>
                {yearsArray.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-center-block">
          <PageLoad />
          <p>Syncing transaction records...</p>
        </div>
      ) : error ? (
        <div className="profile-error">{error}</div>
      ) : bills.length === 0 ? (
        <div className="empty-state-card">
          <p className="empty-text">
            No active billing logs match your parameters.
          </p>
        </div>
      ) : (
        <div className="dashboard-cards-grid">
          {bills.map((bill) => {
            const currentBillId = bill.billId;
            const isUnpaid = bill.status?.toLowerCase() === "pending";

            return (
              <div
                key={currentBillId}
                className={`invoice-display-card ${!isUnpaid ? "is-settled" : ""}`}
              >
                <div className="card-top-row">
                  <span className="invoice-reference-id">
                    #{currentBillId.slice(0, 13)}
                  </span>
                  <span
                    className={`badge ${
                      bill.status?.toLowerCase() === "paid"
                        ? "confirm-badge"
                        : "pending-badge"
                    }`}
                  >
                    {bill.status}
                  </span>
                </div>

                <div className="card-main-content">
                  {isReceptionist && (
                    <div className="meta-row">
                      <span className="label">Account Holder</span>
                      <span className="value strong">{bill.patientName}</span>
                    </div>
                  )}
                  <div className="meta-row">
                    <span className="label">Appointment Date</span>
                    <span className="value">
                      {bill.appointmentDate || "---"}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="label">Issued Timestamp</span>
                    <span className="value timestamp">
                      {bill.createdAt
                        ? new Date(bill.createdAt).toLocaleDateString()
                        : "---"}
                    </span>
                  </div>

                  {!isReceptionist && bill.billCode && (
                    <div
                      className="meta-row secure-code-row"
                      style={{
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px dashed #e2e8f0",
                      }}
                    >
                      <span
                        className="label"
                        style={{ color: "#2563eb", fontWeight: "600" }}
                      >
                        Bill Code
                      </span>
                      <span
                        className="value strong"
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.9rem",
                        }}
                      >
                        {bill.billCode}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card-footer-action-row">
                  <div className="amount-group">
                    <span className="label">Total Due</span>
                    <span className="amount-value">{bill.totalAmount} EGP</span>
                  </div>

                  {isReceptionist && isUnpaid && (
                    <button
                      className="btn-action btn-accept"
                      onClick={() => handleOpenVerificationModal(bill)}
                    >
                      Collect Pay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isReceptionist && totalPages > 1 && (
        <div className="action-section" style={{ marginTop: "3rem" }}>
          <div className="booking-buttons">
            <button
              className="btn-secondary"
              disabled={pageNumber <= 1}
              onClick={() =>
                handleFilterChange("page", (pageNumber - 1).toString())
              }
            >
              Previous
            </button>
            <span
              className="warning-text"
              style={{ margin: "0 1rem", alignSelf: "center" }}
            >
              Page {pageNumber} of {totalPages}
            </span>
            <button
              className="btn-primary"
              disabled={pageNumber >= totalPages}
              onClick={() =>
                handleFilterChange("page", (pageNumber + 1).toString())
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeModalBill && (
        <div className="booking-modal-overlay">
          <div
            className="modal-backdrop"
            onClick={handleCloseVerificationModal}
          />

          <form className="modal-content" onSubmit={handlePayBillSubmit}>
            <div className="modal-header">
              <div>
                <h3>Collect Verification Settle</h3>
                <p className="modal-subtitle">
                  Account Statement:{" "}
                  <span className="highlight-type">
                    {activeModalBill.patientName}
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="close-x-btn"
                onClick={handleCloseVerificationModal}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-verification-form-wrapper">
                <p
                  style={{
                    color: "#4a5568",
                    fontSize: "0.95rem",
                    marginBottom: "1.25rem",
                    lineHeight: "1.6",
                  }}
                >
                  Please request the **Private Bill Code** from the patient.
                  This step confirms the patient holds physical clearance
                  validation matching the ID &nbsp;
                  <strong>#{activeModalBill.billId.slice(0, 8)}</strong>.
                </p>

                <div
                  className="modal-input-field-block"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      color: "#1e293b",
                    }}
                  >
                    Required Patient Code
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ask patient for code and type here..."
                    value={enteredBillCode}
                    onChange={(e) => setEnteredBillCode(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCloseVerificationModal}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn-confirm-submit"
                disabled={!enteredBillCode.trim() || actionLoadingId !== null}
              >
                {actionLoadingId ? "Settle process..." : "Authorize Settle"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BillsGrid;
