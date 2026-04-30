import { useState, useEffect } from "react";
import "././pagesStyle/needs.scss";
import PageLoad from "../pageLoad";

const DonationPage = () => {
  const [needsData, setNeedsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState([]);

  //form
  const [showModal, setShowModal] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState(null);
  const [formData, setFormData] = useState({
    volunteerName: "",
    email: "",
    phone: "",
    amountDonated: "",
  });
  const activeNeed = needsData?.data.find((n) => n.id === selectedNeedId);
  const openDonationModal = (id) => {
    setSelectedNeedId(id);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitDonation = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      charityNeedId: selectedNeedId,
      amountDonated: Number(formData.amount),
    };

    fetch("https://tumorhospital.runasp.net/api/Donation/Donate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((res) => {
      if (res.ok) {
        alert("Thank you for your donation!");
        setShowModal(false);
        setFormData({
          volunteerName: "",
          email: "",
          phone: "",
          amountDonated: "",
        });
      }
    });
  };

  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Need/Categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
      });
  }, []);

  useEffect(() => {
    const categoryParam =
      activeCategory === "All" ? "" : `&category=${activeCategory}`;

    fetch(
      `https://tumorhospital.runasp.net/api/Needs?pageNumber=${currentPage}${categoryParam}`,
    )
      .then((res) => res.json())
      .then((data) => setNeedsData(data));
  }, [currentPage, activeCategory]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  if (needsData) {
    return (
      <div className="donation-wrapper">
        <div className="filter-bar">
          <button
            className={activeCategory === "All" ? "active" : ""}
            onClick={() => handleCategoryChange("All")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "active" : ""}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {showModal && (
          <div className="overlay">
            <div className="modal">
              <h2>Complete Your Donation</h2>
              <form onSubmit={submitDonation}>
                <input
                  type="text"
                  name="volunteerName"
                  placeholder="Full Name"
                  required
                  onChange={handleInputChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                  onChange={handleInputChange}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="amount"
                  placeholder="Donation Amount"
                  required
                  onChange={handleInputChange}
                />

                <div className="modal-actions">
                  <button type="submit" className="confirm-btn">
                    Confirm Donation
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              <div className="need-summary">
                <p>
                  <strong>Goal:</strong> ${activeNeed.needAmount}
                </p>
                <p>
                  <strong>Collected so far:</strong> $
                  {activeNeed.collectedAmount}
                </p>
                <p className="remaining">
                  <strong>Remaining:</strong> $
                  {activeNeed.needAmount - activeNeed.collectedAmount}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="needs-grid">
          {needsData?.data.map(
            ({ id, title, imagePath, charityCategory, isCompleted }) => (
              <div key={id} className="need-card">
                <div className="image-container">
                  <img src={imagePath} alt={title} />
                  <span className="category-tag">{charityCategory}</span>
                </div>
                <h3>{title}</h3>

                {!isCompleted ? (
                  <button
                    className="donate-btn"
                    onClick={() => openDonationModal(id)}
                  >
                    Donate Now
                  </button>
                ) : (
                  <button className="donate-btn completed">Completed</button>
                )}
              </div>
            ),
          )}
        </div>

        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className="arrow"
          >
            &#8592;
          </button>

          <span className="page-info">
            Page {needsData?.pageNumber} of {needsData?.totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={
              currentPage === needsData?.totalPages || needsData.totalPages == 0
            }
            className="arrow"
          >
            &#8594;
          </button>
        </div>
      </div>
    );
  } else {
    return <PageLoad />;
  }
};

export default DonationPage;
