import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email; // passed from register page

  const [token, setOtp] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // ⏱ Timer logic
  useEffect(() => {
    if (timer === 0) {
      setIsResendDisabled(false);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // ❗ If no email, redirect back
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleVerify = async () => {
    if (!token) {
      setMessage("Please enter OTP");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(
        "https://tumorhospital.runasp.net/api/Auth/Confirm-Email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, token }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Invalid OTP");
        console.log(token);
        
      }

      // Optional: login user
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);

      setStatus("success");
      setMessage("Email confirmed successfully");

      setTimeout(() => {
        navigate("/admin");
      }, 2000);

    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  // const handleResend = async () => {
  //   try {
  //     await fetch("https://tumorhospital.runasp.net/api/Auth/Resend-Confirm-Email-Token", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     setTimer(60);
  //     setIsResendDisabled(true);
  //     setMessage("OTP resent successfully");
  //     console.log(message);
  //     console.log(email);
      
      

  //   } catch {
  //     setMessage("Failed to resend OTP");
  //   }
  // };
const handleResend = async () => {
  try {
    const response = await fetch(
      "https://tumorhospital.runasp.net/api/Auth/Resend-Confirm-Email-Token",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to resend OTP");
    }

    setTimer(60);
    setIsResendDisabled(true);
    setMessage("OTP resent successfully");

  } catch (error) {
    setMessage(error.message);
  }
};
  return (
    <div style={styles.container}>
      <h2>Confirm your email</h2>
      <p>Enter the OTP sent to: {email}</p>

      <input
        type="text"
        placeholder="Enter OTP"
        value={token}
        onChange={(e) => setOtp(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleVerify} style={styles.button}>
        Verify
      </button>

      <p>Resend OTP in: {timer}s</p>

      <button
        onClick={handleResend}
        disabled={isResendDisabled}
        style={{
          ...styles.button,
          backgroundColor: isResendDisabled ? "gray" : "#007bff",
        }}
      >
        Resend OTP
      </button>

      {console.log(message)}
    </div>
  );
};

export default ConfirmEmail;

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    width: "200px",
    textAlign: "center",
  },
  button: {
    padding: "10px 20px",
    cursor: "pointer",
  },
};