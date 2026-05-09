import "./componentsStyle/About.scss";
import { useState, useEffect } from "react";
import PageLoad from "./pageLoad";

const AboutPage = () => {
  const [hospitalData, setData] = useState(null);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    // 1. Fetch the data
    fetch("https://tumorhospital.runasp.net/api/about")
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setData(data);
        }
      })
      .catch((err) => console.error("Fetch error:", err));

    const timer = setTimeout(() => {
      setShowNoData(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // SUCCESS STATE
  if (hospitalData) {
    const {
      hospitalName,
      description,
      mission,
      vision,
      totalDoctors = "0",
      totalPatients = "0",
      totalReceptionist = "0",
    } = hospitalData;

    return (
      <div className="medai-about-container">
        <header className="about-header">
          <h1>Leading the Way at {hospitalName.toUpperCase()}</h1>
        </header>

        <main className="about-content">
          <section className="description-section">
            <h2>Our Comprehensive Services</h2>
            <p>{description}</p>
          </section>

          <section className="values-grid">
            <div className="value-card mission">
              <h3>Our Mission</h3>
              <p className="value-text">{mission}</p>
            </div>
            <div className="value-card vision">
              <h3>Our Vision</h3>
              <p className="value-text">{vision}</p>
            </div>
          </section>

          <section className="stats-section">
            <h2>{hospitalName.toUpperCase()} by the Numbers</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{totalDoctors}</span>
                <span className="stat-label">Total Doctors</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{totalPatients}</span>
                <span className="stat-label">Active Patients</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{totalReceptionist}</span>
                <span className="stat-label">Staff Receptionists</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="medai-about-container loading-state">
      {showNoData ? (
        <div className="no-data-msg">
          <h1>No Data Found</h1>
          <p>Please try again later.</p>
        </div>
      ) : (
        <PageLoad />
      )}
    </div>
  );
};

export default AboutPage;
