// backend/test-meenakshi-login.js
// Test the actual login flow for meenakshianil33@gmail.com

import dotenv from "dotenv";
dotenv.config();

const testLogin = async () => {
  const email = "meenakshianil33@gmail.com";
  const password = "Meenakshi123";
  
  console.log("🧪 Testing login API endpoint...");
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password ? "***" : "missing"}\n`);

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
    
    console.log("📊 Response Status:", response.status);
    console.log("📊 Response Data:", JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log("\n✅ Login SUCCESSFUL!");
      console.log(`   Token: ${data.token ? "Received" : "Missing"}`);
      console.log(`   User: ${data.user?.name} (${data.user?.email})`);
      console.log(`   Role: ${data.user?.role}`);
    } else {
      console.log("\n❌ Login FAILED");
      if (data.message) {
        console.log(`   Error: ${data.message}`);
      }
      if (data.hint) {
        console.log(`   Hint: ${data.hint}`);
      }
      if (data.errors) {
        console.log(`   Validation errors:`, data.errors);
      }
    }
  } catch (err) {
    console.error("❌ Request failed:", err.message);
    console.error("💡 Make sure the backend server is running on port 5000");
    console.error("   Run: cd backend && npm start");
  }
};

testLogin();
