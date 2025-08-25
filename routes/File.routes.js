const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { sendMail } = require("../config/mailer");
const File = require("../models/file.js");
const auth = require("../middleware/auth");


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname || ""));
  }
});
const upload = multer({ storage });

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
 
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
      folder: "fileshare"
    });

    fs.unlink(file.path, () => {});

    const expiryTime = new Date(Date.now() + 60 * 60 * 1000);

    const doc = await File.create({
      filename: file.originalname,
      fileURL: result.secure_url,
      publicId: result.public_id,
      uploadedBy: req.user.id,
      expiryTime
    });

    const downloadLink = `${process.env.BASE_URL}/download/${doc._id}`;

    const userEmail = req.body.email;
    const to = userEmail || undefined;

    if (to) {
      await sendMail({
        to,
        subject: "Your file download link",
        html: `
          <p>Your file <b>${doc.filename}</b> is ready.</p>
          <p>This link expires at <b>${doc.expiryTime.toISOString()}</b>.</p>
          <p><a href="${downloadLink}" target="_blank">Download File</a></p>
        `
      });
    }

    return res.status(201).json({
      message: "File uploaded",
      id: doc._id,
      filename: doc.filename,
      fileURL: doc.fileURL,
      expiryTime: doc.expiryTime,
      downloadLink,
      emailedTo: to || null
    });
  } catch (err) {
    
    if (file?.path) fs.unlink(file.path, () => {});
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
});


router.get("/download/:id", async (req, res) => {
  try {
    const doc = await File.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Link not found" });

 
    if (new Date() > new Date(doc.expiryTime)) {
      return res.status(410).json({ message: "Link expired" });
    }

  
    doc.downloadCount += 1;
    await doc.save();

    return res.json({
      message: "Valid link",
      fileURL: doc.fileURL,
      filename: doc.filename,
      downloadCount: doc.downloadCount,
      expiresAt: doc.expiryTime
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
