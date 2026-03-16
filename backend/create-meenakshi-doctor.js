import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";
import Doctor from "./models/Doctor.js";

const createDoctor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    const email = "meenakshianil1234@gmail.com";
    const password = "Meenakshidoc@123";
    const name = "Dr. Meenakshi Anil";

    console.log("🔨 Creating doctor account...");
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: doctor\n`);

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log("⚠️  User already exists. Updating...");
      user.name = name;
      user.password = password;
      user.role = "doctor";
      user.isActive = true;
      await user.save();
      console.log("✅ User updated successfully");
    } else {
      user = await User.create({
        name: name,
        email: email.toLowerCase(),
        password: password,
        phone: "9876543210",
        dateOfBirth: new Date("1985-05-15"),
        role: "doctor",
        isActive: true,
      });
      console.log("✅ User created successfully");
    }

    // Verify password works
    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      console.log("✅ Password verification: SUCCESS\n");
    } else {
      console.log("❌ Password verification: FAILED\n");
    }

    // Check if doctor profile already exists
    let doctor = await Doctor.findOne({ user: user._id });
    
    if (doctor) {
      console.log("⚠️  Doctor profile already exists. Updating...");
      doctor.specialization = "Gynecology";
      doctor.consultationFee = 500;
      doctor.experience = 10;
      doctor.bio = "Experienced gynecologist with expertise in women's health and reproductive care.";
      doctor.languages = ["English", "Hindi", "Malayalam"];
      doctor.location = {
        city: "Mumbai",
        state: "Maharashtra",
        country: "India"
      };
      doctor.rating = {
        average: 4.8,
        count: 125
      };
      doctor.status = "approved";
      doctor.approvedAt = new Date();
      doctor.availability = {
        timeSlots: [
          { day: "Monday", startTime: "09:00", endTime: "17:00" },
          { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
          { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
          { day: "Thursday", startTime: "09:00", endTime: "17:00" },
          { day: "Friday", startTime: "09:00", endTime: "17:00" },
        ]
      };
      doctor.qualifications = [
        {
          degree: "MBBS",
          institution: "Medical College",
          year: 2010
        },
        {
          degree: "MD - Gynecology",
          institution: "Medical University",
          year: 2014
        }
      ];
      await doctor.save();
      console.log("✅ Doctor profile updated successfully");
    } else {
      doctor = await Doctor.create({
        user: user._id,
        specialization: "Gynecology",
        consultationFee: 500,
        experience: 10,
        bio: "Experienced gynecologist with expertise in women's health and reproductive care.",
        languages: ["English", "Hindi", "Malayalam"],
        location: {
          city: "Mumbai",
          state: "Maharashtra",
          country: "India"
        },
        rating: {
          average: 4.8,
          count: 125
        },
        status: "approved",
        approvedAt: new Date(),
        availability: {
          timeSlots: [
            { day: "Monday", startTime: "09:00", endTime: "17:00" },
            { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
            { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
            { day: "Thursday", startTime: "09:00", endTime: "17:00" },
            { day: "Friday", startTime: "09:00", endTime: "17:00" },
          ]
        },
        qualifications: [
          {
            degree: "MBBS",
            institution: "Medical College",
            year: 2010
          },
          {
            degree: "MD - Gynecology",
            institution: "Medical University",
            year: 2014
          }
        ]
      });
      console.log("✅ Doctor profile created successfully");
    }

    // Populate and display doctor info
    await doctor.populate("user", "name email phone");
    console.log("\n📊 Doctor Profile Summary:");
    console.log(`   Name: ${doctor.user.name}`);
    console.log(`   Email: ${doctor.user.email}`);
    console.log(`   Specialization: ${doctor.specialization}`);
    console.log(`   Consultation Fee: ₹${doctor.consultationFee}`);
    console.log(`   Rating: ${doctor.rating.average} (${doctor.rating.count} reviews)`);
    console.log(`   Experience: ${doctor.experience} years`);
    console.log(`   Status: ${doctor.status}`);
    console.log(`   Languages: ${doctor.languages.join(", ")}`);
    console.log(`   Location: ${doctor.location.city}, ${doctor.location.state}`);

    await mongoose.connection.close();
    console.log("\n✅ Done! Doctor account is ready.");
    console.log(`\n✅ Login credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        console.error(`   - ${key}: ${err.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

createDoctor();
