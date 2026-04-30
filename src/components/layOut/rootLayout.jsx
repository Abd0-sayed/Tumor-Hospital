import Footer from "./footer.jsx";
import NavDropdownExample from "./navBar.jsx";
import { Outlet } from "react-router-dom";
import "./footer.scss";

const rootLayout = () => {
  return (
    <div className="app-wrapper">
      <NavDropdownExample />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default rootLayout;
