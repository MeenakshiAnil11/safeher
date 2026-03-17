import dotenv from "dotenv";
import connectDB from "../config/db.js";
import SafetyPlace from "../models/SafetyPlace.js";

dotenv.config();

const safetyPlaces = [
  // Police
  {
    name: "MG Road Police Station",
    category: "police",
    address: "Mahatma Gandhi Road, Bengaluru",
    coordinates: { lat: 12.9747, lng: 77.6072 },
    phone: "+91-80-2294-2400",
  },
  {
    name: "Koramangala Police Station",
    category: "police",
    address: "80 Feet Road, Koramangala, Bengaluru",
    coordinates: { lat: 12.9352, lng: 77.6245 },
    phone: "+91-80-2294-2500",
  },
  {
    name: "Indiranagar Police Station",
    category: "police",
    address: "100 Feet Road, Indiranagar, Bengaluru",
    coordinates: { lat: 12.9782, lng: 77.6408 },
    phone: "+91-80-2294-2600",
  },

  // Hospitals
  {
    name: "St. John's Medical College Hospital",
    category: "hospital",
    address: "Sarjapur Road, Bengaluru",
    coordinates: { lat: 12.9341, lng: 77.6195 },
    phone: "+91-80-2206-5000",
  },
  {
    name: "Manipal Hospital - Old Airport Road",
    category: "hospital",
    address: "Old Airport Road, Bengaluru",
    coordinates: { lat: 12.9585, lng: 77.6480 },
    phone: "+91-80-2502-4444",
  },
  {
    name: "Fortis Hospital - Bannerghatta Road",
    category: "hospital",
    address: "Bannerghatta Main Road, Bengaluru",
    coordinates: { lat: 12.8932, lng: 77.5970 },
    phone: "+91-80-6621-4444",
  },

  // Safe cafes
  {
    name: "Third Wave Coffee - Indiranagar",
    category: "cafe",
    address: "100 Feet Road, Indiranagar, Bengaluru",
    coordinates: { lat: 12.9713, lng: 77.6412 },
    isSafeCafe: true,
  },
  {
    name: "Starbucks - MG Road",
    category: "cafe",
    address: "Mahatma Gandhi Road, Bengaluru",
    coordinates: { lat: 12.9755, lng: 77.6088 },
    isSafeCafe: true,
  },
  {
    name: "Cafe Coffee Day - Koramangala",
    category: "cafe",
    address: "Koramangala 5th Block, Bengaluru",
    coordinates: { lat: 12.9347, lng: 77.6229 },
    isSafeCafe: true,
  },
];

async function seedSafetyPlaces() {
  try {
    await connectDB();
    console.log("Connected to database");

    let created = 0;
    let updated = 0;

    for (const place of safetyPlaces) {
      const existing = await SafetyPlace.findOne({
        name: place.name,
        category: place.category,
      });

      if (existing) {
        await SafetyPlace.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...place,
              active: true,
            },
          }
        );
        updated += 1;
      } else {
        await SafetyPlace.create({
          ...place,
          active: true,
        });
        created += 1;
      }
    }

    console.log(`Safety places seeded. Created: ${created}, Updated: ${updated}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed safety places:", error);
    process.exit(1);
  }
}

seedSafetyPlaces();
