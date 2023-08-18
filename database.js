const { Sequelize } = require("sequelize");

// Create a new Sequelize instance and pass in the connection details
const sequelize = new Sequelize("geoportals", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
  logging: false, // Disable logging if not needed
});

module.exports = sequelize;
