import { useState, useEffect } from "react";
import "././pagesStyle/needs.scss";
import PageLoad from "../pageLoad";

const NeedCard = ({ need, mode, onEdit, onDelete, onDonate }) => {
  const { id, title, imagePath, charityCategory, isCompleted } = need;

  return (
    <div className="need-card">
      <div className="image-container">
        <img src={imagePath} alt={title} />
        <span className="category-tag">{charityCategory}</span>
      </div>
      <h3>{title}</h3>

      <div className="actions">
        {mode === "admin" ? (
          <>
            <button className="edit-btn" onClick={() => onEdit(need)}>
              Edit
            </button>
            <button className="delete-btn" onClick={() => onDelete(id)}>
              Delete
            </button>
          </>
        ) : (
          <button
            className={`donate-btn ${isCompleted ? "completed" : ""}`}
            disabled={isCompleted}
            onClick={() => onDonate(id)}
          >
            {isCompleted ? "Completed" : "Donate Now"}
          </button>
        )}
      </div>
    </div>
  );
};

const NeedsGrid = ({ mode, onEdit, onDelete }) => {
  const [needsData, setNeedsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [url, setUrl] = useState("");

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState(null);
  const [formData, setFormData] = useState({
    volunteerName: "",
    email: "",
    phone: "",
    amountDonated: "",
  });
  let urlid;

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
      amountDonated: Number(formData.amountDonated), // Fixed key mismatch
    };
    sessionStorage.setItem("amount", formData.amountDonated);

    fetch("https://tumorhospital.runasp.net/api/Donation/Donate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setShowModal(false);
        setFormData({
          volunteerName: "",
          email: "",
          phone: "",
          amountDonated: "",
        });
        setUrl(data.paymentUrl);
        urlid = url.split("/")[4];
        sessionStorage.setItem("invID", urlid);
        window.open(url, "_blank");
      });
  };

  fetch(
    "https://tumorhospital.runasp.net/api/Payment/fawaterak/webhooks/success",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(urlid),
    },
  );

  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Need/Categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
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

  if (!needsData) return <PageLoad />;

  return (
    <div className="donation-wrapper">
      <div className="filter-bar">
        <button
          className={activeCategory === "All" ? "active" : ""}
          onClick={() => {
            setActiveCategory("All");
            setCurrentPage(1);
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={activeCategory === cat ? "active" : ""}
            onClick={() => {
              setActiveCategory(cat);
              setCurrentPage(1);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {showModal && activeNeed && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
                name="amountDonated"
                placeholder="Donation Amount"
                required
                onChange={handleInputChange}
              />
              <div className="modal-actions">
                <button type="submit" className="confirm-btn">
                  Confirm
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
                <strong>Collected:</strong> ${activeNeed.collectedAmount}
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
        {needsData.data.map((need) => (
          <NeedCard
            key={need.id}
            need={need}
            mode={mode}
            onEdit={() => onEdit(need)}
            onDelete={onDelete}
            onDonate={openDonationModal}
          />
        ))}
      </div>
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
          className="arrow"
        >
          &#8592;
        </button>
        <span className="page-info">
          Page {needsData.pageNumber} of {needsData.totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={
            currentPage === needsData.totalPages || needsData.totalPages === 0
          }
          className="arrow"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default NeedsGrid;
