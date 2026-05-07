import "./style/adminSideBar.scss";
import { NavLink } from "react-router-dom";
import {
  MdBarChart,
  MdEventNote,
  MdGroup,
  MdAttachMoney,
  MdAssignmentInd,
  MdAddCircle,
  MdVaccines,
  MdBusiness,
  MdEditNote,
  MdLogout,
  MdClose,
} from "react-icons/md";

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="header-top">
          <h3 className="brand-text">MEDAI</h3>
          <button
            className="close-btn"
            onClick={toggleSidebar}
            title="Hide Sidebar"
          >
            <MdClose />
          </button>
        </div>
        <p className="sub-header">ADMIN DASHBOARD</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to=""
          end
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <MdBarChart className="nav-icon" /> Dashboard Overview
        </NavLink>

        <NavLink
          to="addAbout"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <MdEventNote className="nav-icon" /> Add About
        </NavLink>

        <NavLink
          to="addRecipionist"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <MdGroup className="nav-icon" /> Add Recipionist
        </NavLink>

        <NavLink
          to="doctor-schedules"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <MdAssignmentInd className="nav-icon" /> Doctor Schedules
        </NavLink>

        <NavLink
          to="addDoctor"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <MdAddCircle className="nav-icon" /> Add New Doctor
        </NavLink>

        <NavLink
          to="addSpicialization"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <MdVaccines className="nav-icon" /> Manage Specializations
        </NavLink>

        <NavLink
          to="Addhospital"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <MdBusiness className="nav-icon" /> Add Hospital
        </NavLink>

        <NavLink
          to="addFaq"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <MdEditNote className="nav-icon" /> Content (FAQ/About)
        </NavLink>

        <NavLink
          to="donations"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <MdAttachMoney className="nav-icon" /> Manage Donations
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <MdLogout className="nav-icon" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
