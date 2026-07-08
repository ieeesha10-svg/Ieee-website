const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');
const { routersHandler } = require("./utils/routesHandler");
require("dotenv").config({quiet: true});
const app = express();
connectDB();

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000,https://www.ieeesha.org")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

routersHandler(app);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
	app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
}

// REQUIRED for Vercel / serverless
module.exports = app;