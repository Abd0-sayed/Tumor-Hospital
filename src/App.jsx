import "./App.scss";
import DoctorSection from "./components/doctors";
import Landing from "./components/landing";
import Appointment from "./components/form";
import Footer from "./components/footer";
import "bootstrap/dist/css/bootstrap.min.css";
import NavDropdownExample from "./components/navBar";
import { Outlet } from "react-router-dom";
function App() {
  return (
    <>
      <NavDropdownExample />
      <Outlet />
      <Appointment />
      <DoctorSection />
      <Footer />
    </>
  );
}

export default App;
