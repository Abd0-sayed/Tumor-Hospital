import { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

const LogoutButton = () => {
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    if (hasLoggedOut.current) return;

    hasLoggedOut.current = true;

    toast.dismiss();
    toast.success("Logged out successfully!", {
      duration: 2000,
      position: "top-center",
    });

    localStorage.clear();
    sessionStorage.clear();

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }, []);
  return (
    <>
      <Toaster />
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        Logging you out...
      </div>
    </>
  );
};

export default LogoutButton;
