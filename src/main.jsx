import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Landing from "./components/landing.jsx";
import About from "./components/About.jsx";


const routes = createBrowserRouter([
    { path: '/', element: <App />, children: [
        { path: '/', element: <Landing /> },
        { path: '/about', element: <About/> },
       
       ] }
    
]);
 
createRoot(document.getElementById("root")).render(
        <RouterProvider router={routes} />
);
