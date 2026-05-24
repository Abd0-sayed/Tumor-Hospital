import { useState, useEffect } from "react";
import NeedsGrid from "../components/otherPages/needs.jsx";
import "./style/needs.scss";
import VolunteerExp from "./volunteerShow.jsx";
import { toast } from "react-toastify";

const getToken = () =>{
  localStorage.getItem("token") || sessionStorage.getItem("token");
}

const NeedManagement = () => {
  const token= getToken();
  // --- States ---
  const [showModal, setShowModal] = useState(null); // 'add', 'edit', or null
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Forces NeedsGrid to re-mount/re-fetch

  const initialFormState = {
    id: "",
    Title: "",
    Image: null,
    CharityCategory: "",
    NeedAmount: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Fetch Categories ---
  useEffect(() => {
    fetch("https://tumorhospital.runasp.net/api/Need/Categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => {
        console.error("Category fetch failed:", err);
        toast.error("Failed to load categories.");
      });
  }, []);

  // --- UI Handlers ---
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const closeModal = () => {
    setShowModal(null);
    setFormData(initialFormState);
  };

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // --- API Actions ---

  // Removes a need based on ID
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this need?")) return;

    try {
      const res = await fetch(
        `https://tumorhospital.runasp.net/api/Need/${id}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        toast.success("Deleted successfully!", {
          position: "bottom-right",
          theme: "colored",
        });
        triggerRefresh();
      } else {
        toast.error("Delete failed. Check permissions.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("A network error occurred while deleting.");
    }
  };

  // CREATE/UPDATE: Uses FormData for Multipart Image Support
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isEdit = showModal === "edit";
    const payload = new FormData();

    // Required for .NET model binding on PUT requests
    if (isEdit) payload.append("Id", formData.id);

    payload.append("Title", formData.Title);
    payload.append("CharityCategory", formData.CharityCategory);
    payload.append("NeedAmount", formData.NeedAmount);
    payload.append("Image", formData.Image);

    const url = isEdit
      ? `https://tumorhospital.runasp.net/api/Need/${formData.id}`
      : "https://tumorhospital.runasp.net/api/Need";

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: payload,
      });

      if (res.ok) {
        toast.success(`Need ${isEdit ? "updated" : "created"} successfully!`, {
          position: "bottom-center",
          autoClose: 3000,
          theme: "colored",
        });
        closeModal();
        triggerRefresh();
      } else {
        const errorText = await res.text();
        console.error("Server Error:", errorText);
        toast.error(`Error: ${res.status}. Please check your inputs.`);
      }
    } catch (err) {
      console.error("Network Error:", err);
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-populates the form with existing card data
  const handleEditClick = (need) => {
    setFormData({
      id: need.id,
      Title: need.title,
      CharityCategory: need.charityCategory,
      NeedAmount: need.needAmount,
      Image: null,
    });
    setShowModal("edit");
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-header">
        <button className="add-new-btn" onClick={() => setShowModal("add")}>
          Add New Need
        </button>
        <VolunteerExp />
      </div>

      <NeedsGrid
        key={refreshKey}
        mode="admin"
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      {showModal && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{showModal === "edit" ? "Edit" : "Create"} Hospital Need</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="Title"
                placeholder="Title"
                required
                value={formData.Title}
                onChange={handleInputChange}
              />

              <select
                name="CharityCategory"
                required
                value={formData.CharityCategory}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="NeedAmount"
                placeholder="Amount Required"
                required
                value={formData.NeedAmount}
                onChange={handleInputChange}
              />

              <div className="file-input-wrapper">
                <label>
                  Image:{" "}
                  {showModal === "edit" && (
                    <span className="hint">(Leave empty to keep current)</span>
                  )}
                </label>
                <input
                  type="file"
                  name="Image"
                  accept="image/*"
                  required={showModal === "add"}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="confirm-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Processing..."
                    : showModal === "edit"
                      ? "Update"
                      : "Create"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeedManagement;
