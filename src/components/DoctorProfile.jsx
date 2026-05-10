import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Profile.css";
import maleDoc from "../assets/maleDoctor.png";
import femaleDoc from "../assets/femaleDoctor.png";

// ── Auth Helpers ────────────────────────────────────────────────────────
const getToken = () => sessionStorage.getItem("token");
const getUserId = () => sessionStorage.getItem("userId");

// ── Doctor Profile View ─────────────────────────────────────────────────
const DoctorProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = getUserId();
  const token = getToken();
  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `https://tumorhospital.runasp.net/api/Profile/Doctor`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        if (response.status === 403) {
          setError("Access forbidden: Doctor role required.");
          return;
        }
        if (response.status === 404) {
          setError("Doctor profile not found.");
          return;
        }
        if (!response.ok) {
          setError("Failed to load profile.");
          return;
        }
        const data = await response.json();
        setProfile(data);
      } catch {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, token, navigate]);

  //   const splitName = (fullName = "") => {
  //     const parts = fullName.trim().split(" ");
  //     return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
  //   };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-skeleton-avatar" />
          <div className="profile-skeleton-line profile-skeleton-line--wide" />
          <div className="profile-skeleton-line" />
          <div className="profile-skeleton-line profile-skeleton-line--narrow" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-card profile-card--center">
          <div className="profile-error-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="profile-error-title">Unable to load profile</h2>
          <p className="profile-error-msg">{error}</p>
          <button
            className="profile-btn profile-btn--primary"
            onClick={() => navigate("/login")}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  //   const { firstName, lastName } = splitName(profile?.fullName);
  const firstName = profile.firstName;
  const lastName = profile.lastName;
  const fullname = firstName + " " + lastName;

  // const initials = (firstName?.[0] ?? "").toUpperCase() + (lastName?.[0] ?? "").toUpperCase() || "?";

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile?.profilePicturePath ? (
              <img
                src={profile.profilePicturePath}
                alt="Profile"
                className="profile-avatar-img"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <img
                src={
                  profile?.gender === "Male"
                    ? maleDoc
                    : profile?.gender === "Female"
                      ? femaleDoc
                      : maleDoc // default if undefined
                }
                alt="Placeholder"
                className="profile-avatar-img"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            )}
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{fullname || "—"}</h1>
            <span
              className={`profile-badge profile-badge--${(profile?.gender || "").toLowerCase()}`}
            >
              {profile?.gender || "—"}
            </span>
          </div>
        </div>

        <div className="profile-section-label">Personal information</div>
        <div className="profile-grid">
          <div className="profile-field">
            <span className="profile-field-label">First name</span>
            <span className="profile-field-value">
              {firstName || <span className="profile-empty">Not provided</span>}
            </span>
          </div>
          <div className="profile-field">
            <span className="profile-field-label">Last name</span>
            <span className="profile-field-value">
              {lastName || <span className="profile-empty">Not provided</span>}
            </span>
          </div>
          <div className="profile-field profile-field--full">
            <span className="profile-field-label">Email address</span>
            <span className="profile-field-value">
              {profile?.email || (
                <span className="profile-empty">Not provided</span>
              )}
            </span>
          </div>
          <div className="profile-field">
            <span className="profile-field-label">Phone number</span>
            <span className="profile-field-value">
              {profile?.phoneNumber || (
                <span className="profile-empty">Not provided</span>
              )}
            </span>
          </div>
          <div className="profile-field">
            <span className="profile-field-label">Specialization</span>
            <span className="profile-field-value">
              {profile?.specializationName || (
                <span className="profile-empty">Not provided</span>
              )}
            </span>
          </div>
          <div className="profile-field profile-field--full">
            <span className="profile-field-label">Bio</span>
            <span className="profile-field-value">
              {profile?.bio || (
                <span className="profile-empty">Not provided</span>
              )}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="profile-btn profile-btn--primary"
            onClick={() =>
              navigate("/UpdateDoctorProfile", { state: { profile } })
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="16"
              height="16"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Update profile
          </button>
          <button
            className="profile-btn profile-btn--outline"
            onClick={() => navigate("/ChangePassword")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="16"
              height="16"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Change password
          </button>
        </div>
      </div>
    </div>
  );
};
export default DoctorProfile;
