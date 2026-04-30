import Appointment from "./form";
import Landing from "./landing.jsx";
import DoctorSection from "./doctors.jsx";

const Home = () => {
  return (
    <div>
      <Landing />
      <Appointment />
      <DoctorSection />
    </div>
  );
};

export default Home;
