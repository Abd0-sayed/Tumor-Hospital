import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageLoad from "../pageLoad.jsx";
import "./pagesStyle/recepSchudle.scss";

const AppointmentsTable = () => {
  const role = sessionStorage.getItem("role");
  const isReceptionist = role === "Receptionist";
  const token = sessionStorage.getItem("token");

  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = parseInt(searchParams.get("page") || "1", 10);
  const reason = searchParams.get("reason") || "";
  const status = searchParams.get("status") || "";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);

    if (key !== "page") newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleAppointmentAction = async (appointmentId, actionType) => {
    setActionLoadingId(appointmentId);
    try {
      const endpoint =
        actionType === "accept" ? "accept-appointment" : "reject-appointment";
      const params = new URLSearchParams();
      params.append("appointmentId", appointmentId);

      const actionURL = "https://tumorhospital.runasp.net/api/Appointment";

      const response = await fetch(
        `${actionURL}/${endpoint}?${params.toString()}`,
        {
          method: "PUT",
          headers: { accept: "*/*", Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

      setAppointments((prev) =>
        prev.map((appt) => {
          const currentId = appt.id || appt.appointmentId;
          if (currentId === appointmentId) {
            return {
              ...appt,
              status: actionType === "accept" ? "Confirmed" : "Cancelled",
            };
          }
          return appt;
        }),
      );
    } catch (err) {
      console.error(err);
      alert(`Error updating request: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("pageNumber", pageNumber.toString());
        if (reason) params.append("appointmentReason", reason);
        if (status) params.append("appointmentStatus", status);

        let fetchURL = "https://tumorhospital.runasp.net/api/Appointments";
        if (role === "Patient") {
          fetchURL =
            "https://tumorhospital.runasp.net/api/Patient/Appointments";
        } else if (role === "Doctor") {
          fetchURL = "https://tumorhospital.runasp.net/api/Doctor/Appointments";
        }

        const response = await fetch(`${fetchURL}?${params.toString()}`, {
          method: "GET",
          headers: { accept: "*/*", Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        const result = await response.json();

        setAppointments(result.data || []);
        setTotalPages(result.totalPages || 0);
        setTotalRecords(result.totalRecords || 0);
      } catch (err) {
        setError("Failed to fetch data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [pageNumber, reason, status, role, token]);

  return (
    <div className="doctor-profile">
      <div className="profile">
        <div className="header">
          <div className="header-info">
            <h1>
              {isReceptionist ? "Manage Appointments" : "My Appointments"}
            </h1>
            <div className="location-info">
              <span>
                Total Records: <strong>{totalRecords}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="profile-body">
          <div className="filter-panel">
            <div className="filter-group">
              <label>Reason for Visit</label>
              <select
                value={reason}
                onChange={(e) => handleFilterChange("reason", e.target.value)}
              >
                <option value="">All Reasons</option>
                <option value="Consultation">Consultation</option>
                <option value="VideoCall">Video-Call</option>
                <option value="FollowUp">Follow-Up</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Appointment Status</label>
              <select
                value={status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          {loading ? (
            <>
              <PageLoad />
              <div className="profile-loading">Loading dataset timeline...</div>
            </>
          ) : error ? (
            <div className="profile-error">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="info-section">
              <p className="empty-text">No matching records found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="appointments-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    {isReceptionist && (
                      <>
                        <th>Patient</th> <th>Doctor</th>
                      </>
                    )}
                    {role === "Doctor" && (
                      <>
                        <th>Patient</th>
                      </>
                    )}
                    {role === "Patient" && (
                      <>
                        <th>Doctor</th>
                      </>
                    )}

                    <th>Reason</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    {isReceptionist && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => {
                    const currentId = appt.id || appt.appointmentId;
                    const isPending = appt.status?.toLowerCase() === "pending";
                    const isProcessingThisRow = actionLoadingId === currentId;

                    return (
                      <tr key={currentId}>
                        <td>
                          {appt.appointmentId?.includes("-")
                            ? appt.appointmentId.slice(
                                0,
                                appt.appointmentId.indexOf("-"),
                              )
                            : appt.appointmentId?.slice(0, 8) || "N/A"}
                        </td>
                        {role === "Doctor" && <td>{appt.patientName}</td>}
                        {isReceptionist && (
                          <>
                            <td>{appt.patientName}</td>{" "}
                            <td>{appt.doctorName}</td>
                          </>
                        )}
                        {role === "Patient" && <td>{appt.doctorName}</td>}

                        <td>
                          <span className="bio-text">
                            {appt.reason || "No detail assigned"}
                          </span>
                        </td>
                        <td>
                          <div className="datetime-stack">
                            <span className="primary-date">
                              {appt.attendenceDate}
                            </span>
                            <div className="secondary-time">
                              <span className="day-tag">{appt.dayOfWeek}</span>
                              <span className="time-range">
                                {appt.fromTime && appt.toTime
                                  ? `${appt.fromTime.slice(0, 5)} - ${appt.toTime.slice(0, 5)}`
                                  : "---"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              appt.status?.toLowerCase() === "completed" ||
                              appt.status?.toLowerCase() === "confirmed" ||
                              appt.status?.toLowerCase() === "approved"
                                ? "confirm-badge"
                                : appt.status?.toLowerCase() === "pending"
                                  ? "pending-badge"
                                  : appt.status?.toLowerCase() === "rejected" ||
                                      appt.status?.toLowerCase() === "cancelled"
                                    ? "cancelled-badge"
                                    : appt.status?.toLowerCase() === "absent"
                                      ? "grey-badge"
                                      : "just-badge"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>

                        {isReceptionist && (
                          <td className="actions-cell">
                            <div className="action-buttons">
                              <button
                                className="btn-action btn-accept"
                                disabled={
                                  !isPending || actionLoadingId !== null
                                }
                                onClick={() =>
                                  handleAppointmentAction(currentId, "accept")
                                }
                              >
                                {isProcessingThisRow ? "wait..." : "Accept"}
                              </button>
                              <button
                                className="btn-action btn-reject"
                                disabled={
                                  !isPending || actionLoadingId !== null
                                }
                                onClick={() =>
                                  handleAppointmentAction(currentId, "reject")
                                }
                              >
                                {isProcessingThisRow ? "wait..." : "Reject"}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="action-section" style={{ marginTop: "2rem" }}>
              <div className="booking-buttons">
                <button
                  className="btn-secondary"
                  disabled={pageNumber <= 1}
                  onClick={() =>
                    handleFilterChange("page", (pageNumber - 1).toString())
                  }
                >
                  Previous Page
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
                  Next Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsTable;
