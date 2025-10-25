import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    number: { type: String, required: true }, // phone number
    relationship: { type: String, default: "" },
    email: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", ContactSchema);