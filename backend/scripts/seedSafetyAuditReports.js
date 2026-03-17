import dotenv from "dotenv";
import connectDB from "../config/db.js";
import SafetyAuditReport from "../models/SafetyAuditReport.js";

dotenv.config();

const safetyAuditReports = [
  {
    title: "MG Road Night Visibility Audit",
    latitude: 12.9758,
    longitude: 77.6069,
    radiusMeters: 700,
    safetyRating: 52,
    source: "community",
    isActive: true,
  },
  {
    title: "Koramangala Main Junction Safety Audit",
    latitude: 12.9355,
    longitude: 77.6248,
    radiusMeters: 650,
    safetyRating: 61,
    source: "community",
    isActive: true,
  },
  {
    title: "Indiranagar Late-Hour Footfall Audit",
    latitude: 12.9784,
    longitude: 77.6402,
    radiusMeters: 600,
    safetyRating: 68,
    source: "community",
    isActive: true,
  },
  {
    title: "Silk Board Underpass Safety Audit",
    latitude: 12.9175,
    longitude: 77.6231,
    radiusMeters: 800,
    safetyRating: 43,
    source: "community",
    isActive: true,
  },
  {
    title: "Majestic Bus Stand Perimeter Audit",
    latitude: 12.9767,
    longitude: 77.5728,
    radiusMeters: 900,
    safetyRating: 49,
    source: "community",
    isActive: true,
  },
  {
    title: "Whitefield Transit Corridor Audit",
    latitude: 12.9694,
    longitude: 77.7499,
    radiusMeters: 850,
    safetyRating: 58,
    source: "community",
    isActive: true,
  },
];

async function seedSafetyAuditReports() {
  try {
    await connectDB();
    console.log("Connected to database");

    let created = 0;
    let updated = 0;

    for (const report of safetyAuditReports) {
      const existing = await SafetyAuditReport.findOne({
        title: report.title,
      });

      if (existing) {
        await SafetyAuditReport.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...report,
            },
          }
        );
        updated += 1;
      } else {
        await SafetyAuditReport.create(report);
        created += 1;
      }
    }

    console.log(`Safety audit reports seeded. Created: ${created}, Updated: ${updated}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed safety audit reports:", error);
    process.exit(1);
  }
}

seedSafetyAuditReports();
