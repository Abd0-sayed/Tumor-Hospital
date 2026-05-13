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

  if (loading) {
    return <PageLoad />;
  }

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
    <div className="doctor-profile-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft />
        Back to Doctors
      </button>

      <div className="profile-card">
        <div className="profile-header">
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
          {/* LEFT COLUMN */}
          <div className="left-column">
            {/* ABOUT */}
            <section className="info-section">
              <h2>
                <FaInfoCircle />
                About the Doctor
              </h2>

              <p className="bio-text">
                {doctor.bio || "No biography provided yet."}
              </p>
            </section>

            {/* SCHEDULE */}
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
                        <span className="booked-tag">Fully Booked</span>
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

          {/* RIGHT COLUMN */}
          <div className="right-column">
            {/* PRICING */}
            <section className="info-section">
              <h2>
                <FaMoneyBillWave />
                Fees & Pricing
              </h2>

              <div className="pricing-grid">
                <div className="price-card">
                  <span className="price-label">Consultation</span>

                  <span className="price-amount">
                    {doctor.consultationCost} EGP
                  </span>
                </div>

                <div className="price-card">
                  <span className="price-label">Follow-Up</span>

                  <span className="price-amount">
                    {doctor.followUpCost} EGP
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

            {/* ACTIONS */}
            <div className="action-section">
              <h2>Book Your Visit</h2>

              <div className="booking-buttons">
                <button
                  className="btn-primary large-btn"
                  disabled={!doctor.isAbleToAppointConsultation}
                  onClick={() =>
                    toast.info("Proceeding to Consultation Booking...")
                  }
                >
                  Book Consultation
                </button>

                <button
                  className="btn-secondary large-btn"
                  disabled={!doctor.isAbleToAppointFollowUp}
                  onClick={() =>
                    toast.info("Proceeding to Follow-Up Booking...")
                  }
                >
                  Book Follow-Up
                </button>
              </div>

              {!doctor.isAbleToAppointConsultation &&
                !doctor.isAbleToAppointFollowUp && (
                  <p className="warning-text">
                    This doctor is currently not accepting new appointments.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
