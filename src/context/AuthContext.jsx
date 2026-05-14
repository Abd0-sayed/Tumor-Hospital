import { createContext, useContext, useState } from "react";

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

    setAuth({
      token: null,
      role: null,
    });
  };

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