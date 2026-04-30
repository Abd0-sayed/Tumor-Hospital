import "./componentsStyle/About.scss";
import { useState, useEffect } from "react";
import PageLoad from "./pageLoad";

const AboutPage = () => {
  const [hospitalData, setData] = useState(null);
  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/about")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (hospitalData) {
    const {
      id,
      hospitalName,
      description,
      mission,
      vision,
      email,
      phone,
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

        <footer className="about-footer">
          <div className="contact-box">
            <h2>Get In Touch</h2>
            <p>For inquiries, please contact our team:</p>
            <p>
              <strong>Email:</strong> {email}
            </p>
            <p>
              <strong>Phone:</strong> {phone}
            </p>
            <button className="contact-btn">Email Us Now</button>
          </div>
        </footer>
      </div>
    );
  } else {
    return <PageLoad />;
  }
};

export default AboutPage;
