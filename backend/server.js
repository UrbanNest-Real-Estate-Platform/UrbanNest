const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes");
const propertyRoutes = require("./routes/propertyRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const offerRoutes = require("./routes/offerRoutes.js");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true //Allows cookies and authentication information to be sent.
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/offers", offerRoutes);

app.use('/api/admin',adminRoutes);


app.get("/api", (req, res) => {
    res.status(200).json({
        success:true,
        message : "UrbanNest API is Running"
    })
});

const PORT = process.env.PORT || 3120;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});