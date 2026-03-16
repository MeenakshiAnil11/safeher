
import axios from "axios";

const testLogin = async () => {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      email: "test@example.com",
      password: "Password123!"
    });
    console.log("Login Success:", response.data);
  } catch (error) {
    if (error.response) {
      console.log("Login Failed:", error.response.status, error.response.data);
    } else {
      console.log("Error:", error.message);
    }
  }
};

testLogin();
