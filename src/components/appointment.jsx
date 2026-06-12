import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  FaStethoscope,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaArrowLeft,
  FaMoneyBillWave,
  FaClock,
  FaCalendarCheck,
} from "react-icons/fa";

import PageLoad from "../components/pageLoad.jsx";

import "./style/appointment.scss";

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBookingType, setActiveBookingType] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userRole = sessionStorage.getItem("role");
    const token = sessionStorage.getItem("token");

    if (!userRole || userRole.toLowerCase() !== "patient") {
      toast.error("Access Denied: You must be logged in as a patient.", {
        toastId: "role-error",
      });
      navigate("/");
      return;
    }

    if (!token) {
      toast.warning("Please log in to view doctor profiles.", {
        toastId: "auth-warning",
      });
      navigate("/login");
      return;
    }

    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch(
          `https://tumorhospital.runasp.net/api/Doctor/${doctorId}`,
          {
            method: "GET",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load doctor profile. They might not exist.",
          );
        }

        const data = await response.json();
        setDoctor(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message, {
          toastId: "fetch-error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId, navigate]);

  const handleOpenBooking = (type) => {
    setActiveBookingType(type);
    setSelectedDay(null);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDay) return;

    const token = sessionStorage.getItem("token");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://tumorhospital.runasp.net/api/Appointment/${activeBookingType}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId: doctorId,
            dayOfWeek: selectedDay,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.message || "Something went wrong with the database",
        );
      }

      toast.success("Appointment successfully created!");
      setIsModalOpen(false);

      const updatedResponse = await fetch(
        `https://tumorhospital.runasp.net/api/Doctor/${doctorId}`,
        {
          method: "GET",
          headers: { accept: "*/*", Authorization: `Bearer ${token}` },
        },
      );
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setDoctor(updatedData);
      }
    } catch (err) {
      toast.error(
        err.message || "An unexpected error occurred during booking.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoad />;

  if (error || !doctor) {
    return (
      <div className="profile-error">
        <h2>Doctor Not Found</h2>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="doctor-profile">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft />
        Back to Doctors
      </button>

      <div className="profile">
        <div className="header">
          <div className="image-wrapper">
            <img
              src={doctor.profileImageUrl || "https://via.placeholder.com/200"}
              alt={`Dr. ${doctor.fullName}`}
            />
          </div>

          <div className="header-info">
            <h1>Dr. {doctor.fullName}</h1>
            <div className="badges-wrapper">
              <span className="badge specialization-badge">
                <FaStethoscope />
                {doctor.specialization || "General Practitioner"}
              </span>
              {doctor.isSurgeon && (
                <span className="badge surgeon-badge">Surgery Specialist</span>
              )}
            </div>
            <div className="location-info">
              <FaMapMarkerAlt className="icon" />
              <span>{doctor.location || "Location not specified"}</span>
            </div>
          </div>
        </div>

        <div className="profile-body">
          <div className="left-column">
            <section className="info-section">
              <h2>
                <FaInfoCircle />
                About the Doctor
              </h2>
              <p className="bio-text">
                {doctor.bio || "No biography provided yet."}
              </p>
            </section>

            <section className="info-section">
              <h2>
                <FaCalendarCheck />
                Available Schedule
              </h2>
              {doctor.workingDays && doctor.workingDays.length > 0 ? (
                <div className="schedule-grid">
                  {doctor.workingDays.map((slot, index) => (
                    <div
                      key={index}
                      className={`schedule-card ${
                        !slot.isAvailable ? "unavailable" : ""
                      }`}
                    >
                      <div className="day-header">
                        <strong>{slot.day}</strong>
                        <span className="date-tag">{slot.date}</span>
                      </div>
                      <div className="time-info">
                        <FaClock />
                        {slot.fromTime} - {slot.toTime}
                      </div>
                      {!slot.isAvailable && (
                        <span className="booked-tag" style={{ color: "red" }}>
                          Not Available
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">
                  No schedule available at the moment.
                </p>
              )}
            </section>
          </div>

          <div className="right-column">
            <section className="info-section">
              <h2>
                <FaMoneyBillWave />
                Fees & Pricing
              </h2>
              <div className="pricing-grid">
                <div className="price-card">
                  <span className="price-label">
                    Consultation {doctor.discountPercentage && "| Discount"}
                  </span>
                  <span className="price-amount">
                    {doctor.consultationCost} EGP
                    {doctor.discountPercentage &&
                      ` | ${((100 - doctor.discountPercentage) / 100) * doctor.consultationCost} EGP`}
                  </span>
                </div>
                {doctor.isAbleToAppointVideoCall && (
                  <div className="price-card">
                    <span className="price-label">
                      Video Call {doctor.discountPercentage && "| Discount"}
                    </span>
                    <span className="price-amount">
                      {doctor.videoCallCost} EGP
                      {doctor.discountPercentage &&
                        ` | ${((100 - doctor.discountPercentage) / 100) * doctor.videoCallCost} EGP`}
                    </span>
                  </div>
                )}
                <div className="price-card">
                  <span className="price-label">
                    Follow-Up {doctor.discountPercentage && "| Discount"}
                  </span>
                  <span className="price-amount">
                    {doctor.followUpCost} EGP
                    {doctor.discountPercentage &&
                      ` | ${((100 - doctor.discountPercentage) / 100) * doctor.followUpCost} EGP`}
                  </span>
                </div>
                {doctor.isSurgeon && (
                  <div className="price-card highlight">
                    <span className="price-label">Surgery Cost</span>
                    <span className="price-amount">
                      {doctor.surgeryCost} EGP
                    </span>
                  </div>
                )}
              </div>
            </section>

            <div className="action-section">
              <h2>Book Your Visit</h2>
              <div className="booking-buttons">
                <button
                  className="btn-primary large-btn"
                  disabled={!doctor.isAbleToAppointConsultation}
                  onClick={() => handleOpenBooking("consultaion")}
                >
                  Book Consultation
                </button>
                <button
                  className="btn-secondary large-btn"
                  disabled={!doctor.isAbleToAppointFollowUp}
                  onClick={() => handleOpenBooking("followup")}
                >
                  Book Follow-Up
                </button>
                <button
                  className="btn-primary large-btn"
                  disabled={!doctor.isAbleToAppointVideoCall}
                  onClick={() => handleOpenBooking("video-call")}
                >
                  Book Video-Call
                </button>
              </div>
              {!doctor.isAbleToAppointConsultation &&
                !doctor.isAbleToAppointFollowUp &&
                !doctor.isAbleToAppointVideoCall && (
                  <p className="warning-text">
                    This doctor is currently not accepting new appointments.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="booking-modal-overlay">
          <div
            className="modal-backdrop"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3>Select Appointment Day</h3>
                <p className="modal-subtitle">
                  Type:
                  <span className="highlight-type">
                    {activeBookingType === "consultaion"
                      ? "Consultation"
                      : activeBookingType === "followup"
                        ? "Follow-Up"
                        : "Video Call"}
                  </span>
                </p>
              </div>
              <button
                className="close-x-btn"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-schedule-grid">
                {doctor.workingDays?.map((slot, index) => {
                  const isSelected = selectedDay === slot.day;
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!slot.isAvailable}
                      className={`modal-schedule-card ${!slot.isAvailable ? "is-booked" : ""} ${isSelected ? "is-selected" : ""}`}
                      onClick={() => setSelectedDay(slot.day)}
                    >
                      <div className="card-top">
                        <span className="day-txt">{slot.day}</span>
                        <span className="date-txt">{slot.date}</span>
                      </div>
                      <div className="time-txt">
                        <FaClock className="clock-icon" />
                        {slot.fromTime} - {slot.toTime}
                      </div>
                      <div className="status-indicator">
                        {!slot.isAvailable
                          ? "Not Available"
                          : isSelected
                            ? "✓ Selected"
                            : "Available"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-submit"
                disabled={!selectedDay || isSubmitting}
                onClick={handleConfirmBooking}
              >
                {isSubmitting ? "Booking..." : "Confirm Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
