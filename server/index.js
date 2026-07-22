require("dotenv").config({quiet: true});
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');
const { routersHandler } = require("./utils/routesHandler");
const app = express();
connectDB();

const mongoose = require("mongoose");
mongoose.connection.once("open", async () => {
  const Form = require("./models/FormModel");
  await Form.syncIndexes();
});

if(process.env.NODE_ENV === "development") {
  process.env.CORS_ORIGINS = "http://localhost:5173,http://localhost:5000,http://localhost:3000,https://www.ieeesha.org";
}

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // console.log("-> Incoming Origin:", origin); 
    // console.log("-> Allowed Origins Array:", allowedOrigins);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    // console.error("CORS Blocked Origin:", origin);
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