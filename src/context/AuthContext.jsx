import { createContext, useContext, useState,useEffect } from "react";

const AuthContext = createContext();
const getStorage = () => {
  return sessionStorage.getItem("token")
    ? sessionStorage
    : localStorage;
};
export function AuthProvider({ children }) {

   const [auth, setAuth] = useState(() => {
    const storage = getStorage();

    return {
      token: storage.getItem("token") || null,
      role: storage.getItem("role") || null,
    };
  });

  const updateAuth = ({ token, role }) => {
        const storage = getStorage();
    if (token) {
      storage.setItem("token", token);
    }

    if (role) {
      storage.setItem("role", role);
    }

    setAuth({
      token,
      role,
    });
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("refreshToken");

    setAuth({
      token: null,
      role: null,
    });
  };

//   let isRefreshing = false;

// async function refreshAccessToken() {
//   const getStorage = () => {
//   return sessionStorage.getItem("refreshToken")
//     ? sessionStorage
//     : localStorage;
// };
//   if (isRefreshing) return;

//   isRefreshing = true;

//   try {
//     const storage = getStorage();

//     const refreshToken = localStorage.getItem("refreshToken");

//     if (!refreshToken) return;

//     const response = await fetch(
//       "https://tumorhospital.runasp.net/api/Auth/Refresh-Token",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           refreshToken,
//         }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Refresh token failed");
//     }

//     const data = await response.json();

//     storage.setItem("token", data.token);
//     storage.setItem("refreshToken", data.refreshToken);

//     setAuth((prev) => ({
//       ...prev,
//       token: data.token,
//     }));
//   } catch (error) {
//     console.error(error);

//     logout();
//   } finally {
//     isRefreshing = false;
//   }
// }

// useEffect(() => {
//   if (!auth.token) return;

//   const intervalId = setInterval(() => {
//     refreshAccessToken();
//   }, 30000);

//   return () => clearInterval(intervalId);
// }, [auth.token]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        updateAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);