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
import BillsGrid from "./components/otherPages/bills.jsx";
import Aupdateabout from "./Admin/Aupdateabout.jsx";
import Addabout from "./Admin/Addabout.jsx";
import TransactionFailure from "./components/otherPages/donationfail.jsx";
import Addfaq from "./Admin/Addfaq.jsx";
import Appoint from "./components/appointment.jsx";
import Aupdatefaq from "./Admin/Aupdatefaq.jsx";
import LogoutButton from "./components/logout.jsx";
import Adddoctor from "./Admin/Adddoctor.jsx";
import Addspicialization from "./Admin/Addspicialization.jsx";
import DoctorsPage from "./components/home/doctorsPage.jsx";
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

import SpecializationList from "./Admin/SpecializationList.jsx";
import AppointmentsTableRecep from "./components/otherPages/recepSchedule.jsx";
import SpecializationForm from "./Admin/SpecializationForm.jsx";
//
import Offers from "./Admin/Offers.jsx";
//
//
import Forbidden from "./components/otherPages/errorsPages/Forbidden.jsx";
import Notfound from "./components/otherPages/errorsPages/Notfound.jsx";
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
      <Route path="timeTable" element={<AppointmentsTableRecep />} />
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
      <Route path="bills" element={<BillsGrid />} />
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
      <Route path="doctorsPage" element={<DoctorsPage />} />
      <Route path="appointment/:doctorId" element={<Appoint />} />
      <Route path="UpdateProfile" element={<UpdateProfile />} />
      <Route path="UpdateDoctorProfile" element={<UpdateDoctorProfile />} />
      <Route
        path="UpdateReceptionistProfile"
        element={<UpdateReceptionistProfile />}
      />
      {/* **************************** */}
      <Route path="Forbidden" element={<Forbidden />} />
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
        {/* <Route path="addSpicialization" element={<Addspicialization />} /> */}
        <Route path="HospitalInfo/:hospitalId" element={<Hosinfo />} />
        <Route
          path="/admin/HospitalInfo/:hospitalId/DoctorDetail/:docId"
          element={<DoctorDetail />}
        />
        <Route
          path="/admin/HospitalInfo/:hospitalId/UpdateHospital"
          element={<UpdateHospital />}
        />
        {/*******************************  */}
        <Route path="/admin/Specializations" element={<SpecializationList />} />
        <Route
          path="/admin/Specializations/Add"
          element={<SpecializationForm />}
        />
        <Route
          path="/admin/Specializations/Edit/:id"
          element={<SpecializationForm />}
        />
        {/*******************************  */}
        <Route path="/admin/Offers" element={<Offers />} />
      </Route>
      <Route path="*" element={<Notfound />} />
    </Route>,
  ),
);
function App() {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} limit={2} />

      <RouterProvider router={router} />
    </div>
  );
}

export default App;
