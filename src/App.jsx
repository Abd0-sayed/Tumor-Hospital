import "./App.scss";
import RootLayout from "./components/layOut/rootLayout.jsx";
import NeedsGrid from "./components/otherPages/needs.jsx";
import NeedManagement from "./Admin/needs.jsx";
import AccordionSection from "./components/faqs";
import Home from "./components/home/Home.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import AboutPage from "./components/About.jsx";
//
import "./auth/styles/Auth.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Admin from './admin/Admin.jsx'
import Addreciptionist from './admin/Addreciptionist.jsx'
import Addhospital from './admin/Addhospital.jsx'
import Aupdateabout from './admin/Aupdateabout.jsx'
import Addabout from './admin/Addabout.jsx'
import Addfaq from './admin/Addfaq.jsx'
import Adddoctor from './admin/Adddoctor.jsx'
import Addspicialization from './admin/Addspicialization.jsx'

import ConfirmEmail from './auth/ConfirmEmail.jsx'
import Login from './auth/Login.jsx'
import Register from './auth/Register.jsx'
import Forgotpass from './auth/ForgotPassword.jsx'
import Resetpass from './auth/ResetPassword.jsx'
import Doctor from './auth/Doctor.jsx'
import Patient from './auth/Patient.jsx'

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
      <Route path="admin/donations" element={<NeedManagement />} />   
         {/* ***************************************** */}
      <Route path="admin" element= {<Admin/>} />
      <Route path="Register" element= {<Register/>} />
      <Route path="ConfirmEmail" element= {<ConfirmEmail/>} />
      <Route path="Login" element= {<Login/>} />
      <Route path="ForgotPassword" element= {<Forgotpass/>} />
      <Route path="ResetPassword" element= {<Resetpass/>} />
      <Route path="doctor" element= {<Doctor/>} />
      <Route path="patient" element= {<Patient/>} />
      <Route path="admin/editAbout/:aboutid" element= {<Aupdateabout/>} />
      <Route path="admin/addAbout" element= {<Addabout/>} />
      <Route path="admin/addFaq" element= {<Addfaq/>} />
      <Route path="admin/addDoctor" element= {<Adddoctor/>} />
      <Route path="admin/addRecipionist" element= {<Addreciptionist/>} />
      <Route path="admin/addhospital" element= {<Addhospital/>} />
      <Route path="admin/addSpicialization" element= {<Addspicialization/>} />
      
     
    </Route>,
  ),
);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
