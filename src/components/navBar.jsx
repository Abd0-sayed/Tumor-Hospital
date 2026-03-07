import Nav from "react-bootstrap/Nav";
import "./componentsStyle/navBar.scss";
import { MdOutlineLocalPhone } from "react-icons/md";
import { LuClock4 } from "react-icons/lu";
import { IoLocationSharp } from "react-icons/io5";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
function NavDropdownExample() {
  return (
    <>
      <Container>
        <header>
          <h1 className="myLogo">MED</h1>
          <ul>
            <li>
              <MdOutlineLocalPhone />
              <div>
                <p>EMERGENCY</p>
                <code>123456789</code>
              </div>
            </li>
            <li>
              <LuClock4 />
              <div>
                <p>WORK HOUR</p>
                <code>09:00 - 20:00</code>
              </div>
            </li>
            <li>
              <IoLocationSharp />
              <div>
                <p>LOCATION</p>
                <code>Some Place</code>
              </div>
            </li>
          </ul>
        </header>
      </Container>

      <Navbar expand="lg" className="navbar navbar-dark">
        <Container>
          <h1 className="myLogo" id="shrink" style={{ color: "white" }}>
            MED
          </h1>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav>
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavDropdownExample;
