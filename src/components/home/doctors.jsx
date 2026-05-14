import { useState, useEffect } from "react";
import { FaLinkedinIn, FaFacebookF, FaInstagram } from "react-icons/fa";
import "./homeStyle/doctorCards.scss";
import { Link } from "react-router-dom";
import PageLoad from "../pageLoad";
const DoctorCard = ({ firstName, lastName, profileImageUrl, specialty }) => {
  return (
    <div className="doctor-card">
      <div className="image-container">
        <img
          src={profileImageUrl || "https://via.placeholder.com/400x500"}
          alt={firstName}
        />
      </div>

      <div className="info-body">
        <h3 className="name">
          Dr. {firstName} {lastName}
        </h3>

        <p className="specialty">{specialty || "General Medicine"}</p>

        <div className="social-links">
          <a href="#" aria-label="LinkedIn">
            <FaLinkedinIn />
          </a>
          <a href="#" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="#" aria-label="Instagram">
            <FaInstagram />
          </a>
        </div>
      </div>

      <button className="view-profile-btn">
        <Link to="doctorsPage" style={{ color: "white" }}>
          Appoint Now
        </Link>
      </button>
    </div>
  );
};

const DoctorSection = () => {
  const [doctors, setDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Doctors")
      .then((res) => res.json())
      .then((responseBody) => {
        if (responseBody.data) {
          setDoctors(responseBody.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const itemsPerPage = 3;
  const pages = [];
  for (let i = 0; i < doctors.length; i += itemsPerPage) {
    pages.push(doctors.slice(i, i + itemsPerPage));
  }

  if (loading) return <PageLoad />;
  if (doctors.length === 0) return <h1>No Doctors</h1>;
  return (
    <section className="doctor-section">
      <div className="section-header">
        <span className="subtitle">Trusted Care</span>
        <h2 className="title">Our Doctors</h2>
      </div>

      <div className="carousel-viewport">
        <div
          className="pages-container"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {pages.map((group, pageIndex) => (
            <div key={pageIndex} className="page-grid">
              {group.map((doc) => (
                <DoctorCard key={doc.id} {...doc} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="pagination-dots">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={currentPage === index ? "active" : ""}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default DoctorSection;
