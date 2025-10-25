import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../services/auth";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      saveAuth(token, {}); // You can call /me endpoint to get user info
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
}
