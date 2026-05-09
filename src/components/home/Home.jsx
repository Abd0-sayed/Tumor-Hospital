import AboutPage from "../About.jsx";
import Landing from "./landing.jsx";
import DoctorSection from "./doctors.jsx";

const Home = () => {
  return (
    <div>
      <Landing />
      <AboutPage />
      <DoctorSection />
    </div>
  );
};

export default Home;
