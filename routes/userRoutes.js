const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Route for creating a new user
router.post("/addUser", userController.createUser);

// Route for getting a specific user by ID
router.get("/:id", userController.getUserById);

// Route for getting all users
router.get("/", userController.getAllUsers);

// Route for getting the number of users
router.get("/users/count", userController.countUsers);

// Route for updating a user profile by ID
router.put("/users/update/:id", userController.updateUserProfile);

// Route for deleting a user by ID
router.delete("/users/:id", userController.deleteUser);

// Route for changing the password of a useer  by ID
router.put("/:id/password", userController.changePassword);

// Define the route for resetting the password
router.post("/reset-password", userController.resetPassword);

// Route for getting the number of users per day
// Middleware to increment view count for all routes
router.use(userController.incrementViewCount);

// Route to get the view count
router.get("/views", userController.getViewCount);
module.exports = router;
