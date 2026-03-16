
import axios from "axios";

const testNormalizationBug = async () => {
  try {
    const email = "test.user.with.dots@gmail.com";
    const password = "Password123!";

    console.log("--- Registering ---");
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name: "Dot User",
        email: email,
        password: password,
        phone: "1234567890",
        dateOfBirth: "1990-01-01"
      });
      console.log("Registration Success");
    } catch (err) {
      console.log("Registration Failed (maybe already exists):", err.response?.data?.message || err.message);
    }

    console.log("--- Logging in ---");
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: email,
        password: password
      });
      console.log("Login Success:", response.data.user.email);
    } catch (err) {
      console.log("Login Failed:", err.response?.status, err.response?.data);
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
};

testNormalizationBug();
