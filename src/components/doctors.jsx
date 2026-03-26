import { useState } from "react";
import { FaLinkedinIn, FaFacebookF, FaInstagram } from "react-icons/fa";
import "./componentsStyle/doctorCards.scss";
const DoctorCard = ({ name, specialty, imageUrl }) => {
  return (
    <div className="doctor-card">
      <div className="image-container">
        <img src={imageUrl} alt={name} />
      </div>

      <div className="info-body">
        <h3 className="name">{name}</h3>
        <p className="specialty">{specialty}</p>

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

      <button className="view-profile-btn">View Profile</button>
    </div>
  );
};

const DoctorSection = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const doctors = [
    {
      id: 1,
      name: "Dr. Adnan Khan",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=500",
    },
    {
      id: 2,
      name: "Dr. Sarah Jenkins",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400&h=500",
    },
    {
      id: 3,
      name: "Dr. Michael Chen",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=500",
    },
    {
      id: 4,
      name: "Dr. Michael Chen",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=500",
    },
    {
      id: 5,
      name: "Dr. Michael Chen",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=500",
    },
    {
      id: 6,
      name: "Dr. Michael Chen",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=500",
    },
    {
      id: 7,
      name: "Dr. Michael Chen",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=500",
    },
    {
      id: 8,
      name: "Dr. Michael Chen",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=500",
    },
    {
      id: 9,
      name: "Dr. Michael Chen",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=500",
    },
    {
      id: 10,
      name: "Dr. Michael Chen",
      specialty: "NEUROLOGY",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=500",
    },
  ];

  const itemsPerPage = 3;
  const pages = [];
  for (let i = 0; i < doctors.length; i += itemsPerPage) {
    pages.push(doctors.slice(i, i + itemsPerPage));
  }
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
    </section>
  );
};
export default DoctorSection;
