import "./App.scss";
import Landing from "./components/landing";
import Appointment from "./components/form";
import "bootstrap/dist/css/bootstrap.min.css";
import NavDropdownExample from "./components/navBar";
function App() {
  return (
    <>
      <NavDropdownExample />
      <Landing />
      <Appointment />
    </>
  );
}

export default App;
