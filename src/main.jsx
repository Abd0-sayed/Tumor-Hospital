import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// // 
// const originalFetch = window.fetch;

// window.fetch = async (...args) => {
//   const response = await originalFetch(...args);

//   if (response.status === 401) {
//     // Clear auth data
//     localStorage.removeItem("token");
//     sessionStorage.removeItem("token");

//     // Redirect to login
//     window.location.href = "/login";
//   }

//   return response;
// };
// // 

let isRedirecting = false;

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const response = await originalFetch(...args);

  if (response.status === 401 && !isRedirecting) {
    isRedirecting = true;

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    window.location.replace("/login");
  }

  return response;
};



createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
    <App />
    </AuthProvider>
  </StrictMode>,
);
