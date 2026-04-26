const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const test = "fg";
const app = express();
connectDB();

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Must be EXACT match (no trailing slash)
  credentials: true // <--- Required for cookies
}));
app.use(express.json());
app.use(cookieParser());

//Routes
app.get("/", (req, res) => res.send("Express on Vercel"));

app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/forms', require('./routes/formRoutes'));

app.use('/api/submissions', require('./routes/submissionRoutes'));

app.use('/api/emails', require('./routes/emailRouts'));



const PORT = process.env.PORT || 5000;

if (require.main === module) {
	app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
}

// REQUIRED for Vercel / serverless
module.exports = app;