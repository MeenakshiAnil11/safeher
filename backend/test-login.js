// backend/test-login.js
// Quick test script to check login endpoint

import dotenv from "dotenv";
dotenv.config();

const testLogin = async () => {
  const email = "admin@example.com";
  const password = "test123"; // Replace with actual password
  
  console.log("🧪 Testing login endpoint...");
  console.log("Email:", email);
  console.log("Password:", password ? "***" : "missing");
  console.log("\n");

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();
    
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log("\n✅ Login successful!");
    } else {
      console.log("\n❌ Login failed");
      if (data.message) {
        console.log("Error message:", data.message);
      }
      if (data.errors) {
        console.log("Validation errors:", data.errors);
      }
    }
  } catch (err) {
    console.error("❌ Request failed:", err.message);
    console.error("Make sure the backend server is running on port 5000");
  }
};

testLogin();
