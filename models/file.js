const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename:     { type: String, required: true },
    fileURL:      { type: String, required: true },
    publicId:     { type: String, required: true },
    uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiryTime:   { type: Date, required: true },
    downloadCount:{ type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);