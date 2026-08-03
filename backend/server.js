const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes.js");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("UrbanNest Backend Running");
});

const PORT = process.env.PORT || 3120;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});