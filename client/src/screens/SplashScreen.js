import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import splashAnimation from "../assets/splash.json"; // Download a Lottie JSON and put it here
import "./SplashScreen.css"; // Optional CSS for styling

const SplashScreen = () => {
  const navigate = useNavigate();

  // Auto-navigate to Login after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <Lottie animationData={splashAnimation} loop={false} className="lottie" />

      <h1 className="title">Woman’s App</h1>
      <p className="tagline">Your Health & Safety Companion</p>

      <div className="buttons">
        <button className="btn login" onClick={() => navigate("/login")}>
          Login
        </button>
        <button className="btn register" onClick={() => navigate("/register")}>
          Register
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
