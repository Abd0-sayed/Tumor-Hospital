import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageLoad from "../pageLoad.jsx";
import "./pagesStyle/recepSchudle.scss";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppointmentsTable = () => {
  const role = sessionStorage.getItem("role");
  const isReceptionist = role === "Receptionist";
  const token = sessionStorage.getItem("token");

  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = parseInt(searchParams.get("page") || "1", 10);
  const reason = searchParams.get("reason") || "";
  const status = searchParams.get("status") || "";

  // Track month and year individually in URL search params
  const monthFilter = searchParams.get("month") || "";
  const yearFilter = searchParams.get("year") || "";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // View & Modify Prescription States
  const [modalOpen, setModalOpen] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [prescriptionLoadingId, setPrescriptionLoadingId] = useState(null);
  const [viewModalId, setViewModalId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    medication: "",
    dosage: "",
    startDate: "",
    endDate: "",
  });
  const [isUpdatingOrDeleting, setIsUpdatingOrDeleting] = useState(false);

  // Create Prescription States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [isSubmittingPrescription, setIsSubmittingPrescription] =
    useState(false);
  const [formData, setFormData] = useState({
    medication: "",
    dosage: "",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);

    if (key !== "page") newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleViewPrescription = async (appointmentId) => {
    setPrescriptionLoadingId(appointmentId);
    setViewModalId(appointmentId);
    setIsEditing(false);
    try {
      const response = await fetch(
        `https://tumorhospital.runasp.net/api/prescriptions/${appointmentId}`,
        {
          method: "GET",
          headers: { accept: "*/*", Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
      const data = await response.json();

      setPrescriptionData(data);
      setEditFormData({
        medication: data.medication || "",
        dosage: data.dosage || "",
        startDate: data.startDate ? data.startDate.split("T")[0] : "",
        endDate: data.endDate ? data.endDate.split("T")[0] : "",
      });
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error(`Error fetching prescription: ${err.message}`);
    } finally {
      setPrescriptionLoadingId(null);
    }
  };

  const handleUpdatePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingOrDeleting(true);

    try {
      const payload = {
        appointmentId: viewModalId,
        prescriptionId: prescriptionData.prescriptionId,
        medication: editFormData.medication,
        dosage: editFormData.dosage,
        startDate: `${editFormData.startDate}T00:00:00`,
        endDate: `${editFormData.endDate}T00:00:00`,
      };

      const response = await fetch(
        `https://tumorhospital.runasp.net/api/prescriptions/${prescriptionData.prescriptionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

      toast.success("Prescription updated successfully!");
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(`Error updating prescription: ${err.message}`);
    } finally {
      setIsUpdatingOrDeleting(false);
    }
  };

  const handleDeletePrescription = async () => {
    setIsUpdatingOrDeleting(true);

    try {
      const response = await fetch(
        `https://tumorhospital.runasp.net/api/prescriptions/${prescriptionData.prescriptionId}`,
        {
          method: "DELETE",
          headers: { accept: "*/*", Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

      toast.success("Prescription deleted successfully!");
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(`Error deleting prescription: ${err.message}`);
    } finally {
      setIsUpdatingOrDeleting(false);
    }
  };

  const handleOpenCreateModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setFormData({ medication: "", dosage: "", startDate: "", endDate: "" });
    setCreateModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingPrescription(true);

    try {
      const payload = {
        appointmentId: selectedAppointmentId,
        medication: formData.medication,
        dosage: formData.dosage,
        startDate: `${formData.startDate}T00:00:00`,
        endDate: `${formData.endDate}T00:00:00`,
      };

      const response = await fetch(
        `https://tumorhospital.runasp.net/api/prescriptions/${selectedAppointmentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

      toast.success("Prescription added successfully!");
      setCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(`Error saving prescription: ${err.message}`);
    } finally {
      setIsSubmittingPrescription(false);
    }
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
      toast.error(`Error updating request: ${err.message}`);
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

        // Append parsed simple integer parameters directly to the query structure
        if (isReceptionist) {
          if (monthFilter) params.append("month", monthFilter);
          if (yearFilter) params.append("year", yearFilter);
        }

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
  }, [
    pageNumber,
    reason,
    status,
    monthFilter,
    yearFilter,
    role,
    token,
    isReceptionist,
  ]);

  const currentYear = new Date().getFullYear();
  const yearsArray = Array.from({ length: 8 }, (_, i) => currentYear - i);

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

            {/* Rendered only if user is a receptionist */}
            {isReceptionist && (
              <>
                <div className="filter-group">
                  <label>Month</label>
                  <select
                    value={monthFilter}
                    onChange={(e) =>
                      handleFilterChange("month", e.target.value)
                    }
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

                <div className="filter-group">
                  <label>Year</label>
                  <select
                    value={yearFilter}
                    onChange={(e) => handleFilterChange("year", e.target.value)}
                  >
                    <option value="">All Years</option>
                    {yearsArray.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
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
                    <th>Video Call</th>
                    {!isReceptionist && <th>Prescriptions</th>}
                    {isReceptionist && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => {
                    const currentId = appt.id || appt.appointmentId;
                    const isPending = appt.status?.toLowerCase() === "pending";
                    const isProcessingThisRow = actionLoadingId === currentId;
                    const isPrescriptionLoading =
                      prescriptionLoadingId === currentId;

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

                        <td>
                          <a
                            href={appt.videoCallLink}
                            target="_blank"
                            style={{
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                          >
                            {appt.videoCallLink ? "Link" : "###"}
                          </a>
                        </td>

                        {!isReceptionist && (
                          <td>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                type="button"
                                className="btn-view-prescription"
                                disabled={isPrescriptionLoading}
                                onClick={() =>
                                  handleViewPrescription(currentId)
                                }
                              >
                                {isPrescriptionLoading ? "..." : "View"}
                              </button>

                              {role === "Doctor" && (
                                <button
                                  type="button"
                                  className="btn-view-prescription"
                                  onClick={() =>
                                    handleOpenCreateModal(currentId)
                                  }
                                >
                                  Add Prescription
                                </button>
                              )}
                            </div>
                          </td>
                        )}

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

      {modalOpen && prescriptionData && (
        <div className="prescription-modal-backdrop">
          <form
            className="prescription-modal-card"
            onSubmit={handleUpdatePrescriptionSubmit}
          >
            <div className="modal-header">
              <h3>
                {isEditing ? "Edit Prescription" : "Prescription Details"}
              </h3>
              <button
                type="button"
                className="close-x"
                onClick={() => setModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div
                className={`detail-item ${isEditing ? "input-field-group" : ""}`}
              >
                <label>Medication</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="medication"
                    required
                    value={editFormData.medication}
                    onChange={handleEditInputChange}
                  />
                ) : (
                  <p className="medication-name">
                    {prescriptionData.medication}
                  </p>
                )}
              </div>

              <div
                className={`detail-item ${isEditing ? "input-field-group" : ""}`}
              >
                <label>Dosage</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="dosage"
                    required
                    value={editFormData.dosage}
                    onChange={handleEditInputChange}
                  />
                ) : (
                  <p className="dosage-tag">{prescriptionData.dosage}</p>
                )}
              </div>

              <div className="detail-dates-grid">
                <div
                  className={`detail-item ${isEditing ? "input-field-group" : ""}`}
                >
                  <label>Start Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="startDate"
                      required
                      value={editFormData.startDate}
                      onChange={handleEditInputChange}
                    />
                  ) : (
                    <p>
                      {prescriptionData.startDate
                        ? prescriptionData.startDate.split("T")[0]
                        : "---"}
                    </p>
                  )}
                </div>
                <div
                  className={`detail-item ${isEditing ? "input-field-group" : ""}`}
                >
                  <label>End Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="endDate"
                      required
                      value={editFormData.endDate}
                      onChange={handleEditInputChange}
                    />
                  ) : (
                    <p>
                      {prescriptionData.endDate
                        ? prescriptionData.endDate.split("T")[0]
                        : "---"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer group-actions">
              {role === "Doctor" && !isEditing && (
                <div className="left-actions">
                  <button
                    type="button"
                    className="btn-delete"
                    disabled={isUpdatingOrDeleting}
                    onClick={handleDeletePrescription}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                </div>
              )}

              <div className="right-actions">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={isUpdatingOrDeleting}
                    >
                      {isUpdatingOrDeleting ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {createModalOpen && (
        <div className="prescription-modal-backdrop">
          <form
            className="prescription-modal-card"
            onSubmit={handleCreatePrescriptionSubmit}
          >
            <div className="modal-header">
              <h3>Create Prescription</h3>
              <button
                type="button"
                className="close-x"
                onClick={() => setCreateModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-item input-field-group">
                <label htmlFor="medication">Medication Name</label>
                <input
                  type="text"
                  id="medication"
                  name="medication"
                  required
                  placeholder="e.g. Paracetamol"
                  value={formData.medication}
                  onChange={handleInputChange}
                />
              </div>

              <div className="detail-item input-field-group">
                <label htmlFor="dosage">Dosage Instructions</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  required
                  placeholder="e.g. 500mg twice daily"
                  value={formData.dosage}
                  onChange={handleInputChange}
                />
              </div>

              <div className="detail-dates-grid">
                <div className="detail-item input-field-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="detail-item input-field-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmittingPrescription}
              >
                {isSubmittingPrescription ? "Saving..." : "Save Prescription"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTable;
