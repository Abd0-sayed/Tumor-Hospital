import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./adminSideBar.jsx";
import { MdMenu } from "react-icons/md";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div
      className="admin-layout-wrapper"
      style={{ display: "flex", minHeight: "100vh" }}
    >
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s ease",
          padding: "2rem",
          position: "relative",
        }}
      >
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              top: "10px",
              left: "10px",
              zIndex: 999,
              background: "#1a2b4b",
              color: "white",
              border: "none",
              padding: "5px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <MdMenu size={26} />
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
