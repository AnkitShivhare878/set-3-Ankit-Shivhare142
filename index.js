
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");


const authRoutes = require("./routes/auth.routes");
const fileRoutes = require("./routes/file.routes");


console.log("DEBUG: MONGO_URI =", process.env.MONGO_URI);

const app = express();


app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => res.send(" The FileShare Backend is running!"));
app.use("/", authRoutes);
app.use("/", fileRoutes);

const PORT = process.env.PORT || 4000;


(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" Failed to connect DB:", err.message);
    process.exit(1);
  }
})();
