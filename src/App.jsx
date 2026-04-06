import "./App.scss";
import DoctorSection from "./components/doctors";
import AccordionSection from "./components/faqs";
import Appointment from "./components/form";
import Footer from "./components/footer";
import "bootstrap/dist/css/bootstrap.min.css";
import Landing from "./components/landing.jsx";
import NavDropdownExample from "./components/navBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <NavDropdownExample />
            <Landing />
            <Appointment />
            <DoctorSection />
            <Footer />
          </>
        }
      />

      <Route path="/faq" element={<AccordionSection />} />
    </Routes>
  );
}

export default App;
