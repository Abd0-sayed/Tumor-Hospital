import "./App.scss";
import RootLayout from "./components/layOut/rootLayout.jsx";
import NeedsGrid from "./components/otherPages/needs.jsx";
import NeedManagement from "./Admin/needs.jsx";
import AccordionSection from "./components/faqs";
import Home from "./components/home/Home.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import AboutPage from "./components/About.jsx";
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
    </Route>,
  ),
);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
