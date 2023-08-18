const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
// Import the authentication routes
const signInRoutes = require("./routes/signInRoutes");

const port = 5000;

const { Sequelize } = require("sequelize");

// Create a new Sequelize instance and pass in the connection details
const sequelize = new Sequelize("geoportals", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
  logging: false, // Disable logging if not needed
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Enable CORS
app.use(cors({ origin: "http://localhost:3000" }));

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Use the authentication routes
app.use("/api", signInRoutes);

app.use("/api", userRoutes);

// Add middleware and routes here

app.get("/", (req, res) => {
  res.send("Hello world!");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
