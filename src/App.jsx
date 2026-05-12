import "./App.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RootLayout from "./components/layOut/rootLayout.jsx";
import NeedsGrid from "./components/otherPages/needs.jsx";
import NeedManagement from "./Admin/needs.jsx";
import AccordionSection from "./components/faqs";
import Home from "./components/home/Home.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import AboutPage from "./components/About.jsx";
//
import "./auth/styles/Password.scss";
import Admin from "./Admin/Admin.jsx";
import Addreciptionist from "./Admin/Addreciptionist.jsx";
import Addhospital from "./Admin/Addhospital.jsx";
import Aupdateabout from "./Admin/Aupdateabout.jsx";
import Addabout from "./Admin/Addabout.jsx";
import TransactionFailure from "./components/otherPages/donationfail.jsx";
import Addfaq from "./Admin/Addfaq.jsx";
import Aupdatefaq from "./Admin/Aupdatefaq.jsx";
import LogoutButton from "./components/logout.jsx";
import Adddoctor from "./Admin/Adddoctor.jsx";
import Addspicialization from "./Admin/Addspicialization.jsx";
import AdminLayout from "./Admin/adminLayout.jsx";

import ConfirmEmail from "./auth/ConfirmEmail.jsx";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import Forgotpass from "./auth/ForgotPassword.jsx";
import Resetpass from "./auth/ResetPassword.jsx";
import Doctor from "./auth/Doctor.jsx";
import Patient from "./auth/Patient.jsx";
import TransactionSuccess from "./components/otherPages/donationSucc.jsx";
//
import ChangeInactivePassword from "../src/components/ChangeInactivePassword.jsx";
import PatientProfile from "../src/components/PatientProfile.jsx";
import UpdateProfile from "../src/components/UpdateProfile.jsx";
import ChangePassword from "../src/components/ChangePassword.jsx";
import DoctorProfile from "../src/components/DoctorProfile.jsx";
import Reciptionprofile from "../src/components/Reciptionprofile.jsx";
import UpdateDoctorProfile from "../src/components/UpdateDoctorProfile.jsx";
import UpdateReceptionistProfile from "../src/components/UpdateReceptionistProfile.jsx";

//
import Hosinfo from "./components/otherPages/hosinfo/HospitalInfo.jsx";
import DoctorDetail from "./components/otherPages/hosinfo/DoctorDetail.jsx";
import UpdateHospital from "./components/otherPages/hosinfo/UpdateHospital.jsx";

//
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="faq" element={<AccordionSection />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="donations" element={<NeedsGrid />} />
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="logout" element={<LogoutButton />} />
      <Route path="confirmEmail" element={<ConfirmEmail />} />
      <Route path="resetpassword" element={<Resetpass />} />
      <Route path="forgotpassword" element={<Forgotpass />} />
      <Route path="doctor" element={<Doctor />} />
      <Route path="donations/successful" element={<TransactionSuccess />} />
      <Route path="donations/fail" element={<TransactionFailure />} />
      <Route path="patient" element={<Patient />} />
      <Route path="DoctorProfile" element={<DoctorProfile />} />
      <Route path="ReceptionistProfile" element={<Reciptionprofile />} />
      <Route path="PatientProfile" element={<PatientProfile />} />
      <Route path="ChangePassword" element={<ChangePassword />} />
      <Route
        path="ChangeInactivePassword"
        element={<ChangeInactivePassword />}
      />
      <Route path="UpdateProfile" element={<UpdateProfile />} />
      <Route path="UpdateDoctorProfile" element={<UpdateDoctorProfile />} />
      <Route
        path="UpdateReceptionistProfile"
        element={<UpdateReceptionistProfile />}
      />
      {/* ***************************************** */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Admin />} />
        <Route path="donations" element={<NeedManagement />} />
        <Route path="editAbout/:aboutid" element={<Aupdateabout />} />
        <Route path="addAbout" element={<Addabout />} />
        <Route path="addFaq" element={<Addfaq />} />
        <Route path="/admin/editFaq/:faqid" element={<Aupdatefaq />} />
        <Route path="addDoctor" element={<Adddoctor />} />
        <Route path="addRecipionist" element={<Addreciptionist />} />
        <Route path="addhospital" element={<Addhospital />} />
        <Route path="addSpicialization" element={<Addspicialization />} />
        <Route path="HospitalInfo/:hospitalId" element={<Hosinfo />} />
        <Route
          path="/admin/HospitalInfo/:hospitalId/DoctorDetail/:docId"
          element={<DoctorDetail />}
        />
        <Route
          path="/admin/HospitalInfo/:hospitalId/UpdateHospital"
          element={<UpdateHospital />}
        />
      </Route>
    </Route>,
  ),
);
function App() {
  return (
    <div>
      <RouterProvider router={router} />
      <ToastContainer />
    </div>
  );
}

export default App;
