import { useState, useEffect } from "react";
import {
  FaStethoscope,
  FaMapMarkerAlt,
  FaCalendarDay,
  FaVideo,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./homeStyle/doctorsPage.scss";
import { useSearchParams, useNavigate } from "react-router-dom";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [governments, setGovernments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [, setSearchParams] = useSearchParams();
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    specializationName: "",
    government: "",
    workDay: "",
    IsVideoCallDoctor: "",
  });

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const navigate = useNavigate();
  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Hospital/governments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setGovernments(data);
      })
      .catch((err) => console.error("Failed to fetch hospitals:", err));

    fetch(
      "https://tumorhospital.runasp.net/api/Specialization/Specialization-names",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setSpecializations(data);
      })
      .catch((err) => console.error("Failed to fetch specializations:", err));

    fetchDoctors(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDoctors = (pageToFetch = 1) => {
    const params = new URLSearchParams();

    params.append("pageNumber", pageToFetch);

    if (filters.specializationName)
      params.append("specializationName", filters.specializationName);
    if (filters.government) params.append("government", filters.government);
    if (filters.workDay) params.append("workDay", filters.workDay);
    if (filters.IsVideoCallDoctor)
      params.append("IsVideoCallDoctor", filters.IsVideoCallDoctor);
    setSearchParams(params);
    const targetUrl = `https://tumorhospital.runasp.net/api/Doctors?${params.toString()}`;

    fetch(targetUrl)
      .then((res) => res.json())
      .then((data) => {
        const extractedDoctors = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        setDoctors(extractedDoctors);

        setCurrentPage(data?.pageNumber || pageToFetch);
        setTotalPages(data?.totalPages || 1);
      })
      .catch((err) => console.error("Failed to fetch doctors:", err));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      specializationName: "",
      government: "",
      workDay: "",
      IsVideoCallDoctor: "",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 on new search
    fetchDoctors(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchDoctors(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="doctors-directory">
      <aside className="filters-sidebar">
        <div className="filters-header">
          <h2>Filters</h2>
          <button onClick={clearFilters} className="clear-btn">
            Clear All
          </button>
        </div>

        <form onSubmit={handleSearch}>
          <div className="filter-group">
            <label>
              <FaStethoscope className="icon" /> Specialization
            </label>
            <select
              name="specializationName"
              value={filters.specializationName}
              onChange={handleFilterChange}
            >
              <option value="">All Specializations</option>
              {specializations.map((spec, index) => (
                <option key={index} value={spec.name || spec}>
                  {spec.name || spec}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaMapMarkerAlt className="icon" /> Government (Region)
            </label>
            <select
              name="government"
              value={filters.government}
              onChange={handleFilterChange}
            >
              <option value="">All Regions</option>
              {governments.map((gov, index) => (
                <option key={index} value={gov}>
                  {gov.charAt(0).toUpperCase() + gov.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaCalendarDay className="icon" /> Work Day
            </label>
            <select
              name="workDay"
              value={filters.workDay}
              onChange={handleFilterChange}
            >
              <option value="">All Days</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaVideo className="icon" /> Consult Type
            </label>
            <select
              name="IsVideoCallDoctor"
              value={filters.IsVideoCallDoctor}
              onChange={handleFilterChange}
            >
              <option value="">All Doctors</option>
              <option value="true">Video Call Available</option>
              <option value="false">In-Person Only</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            <FaSearch /> Search Doctors
          </button>
        </form>
      </aside>

      <main className="doctors-grid-container">
        <div className="results-header">
          <h1>Medical Staff</h1>
          <span>Showing {doctors.length} results</span>
        </div>

        {doctors.length > 0 ? (
          <>
            <div className="doctors-grid">
              {doctors.map((doc) => (
                <div key={doc.id} className="doctor-card">
                  <div className="card-image-wrapper">
                    <img
                      src={
                        doc.profileImageUrl || "https://via.placeholder.com/150"
                      }
                      alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                      loading="lazy"
                    />
                    {doc.IsVideoCallDoctor && (
                      <span className="badge video-badge">
                        <FaVideo /> Video Consult
                      </span>
                    )}
                  </div>

                  <div className="card-content">
                    <h3>
                      Dr. {doc.firstName} {doc.lastName}
                    </h3>
                    <p className="specialization">
                      {doc.specializationName || "General Practitioner"}
                    </p>

                    <div className="details-list">
                      {doc.government && (
                        <span className="detail-item">
                          <FaMapMarkerAlt /> {doc.government}
                        </span>
                      )}
                      {doc.workDay && (
                        <span className="detail-item">
                          <FaCalendarDay /> {doc.workDay}
                        </span>
                      )}
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => navigate(`/appointment/${doc.id}`)}
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div
                className="pagination-controls"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "3rem",
                }}
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <FaChevronLeft /> Previous
                </button>

                <span style={{ fontWeight: "600", color: "#2c3e50" }}>
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-secondary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No doctors found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorsPage;
