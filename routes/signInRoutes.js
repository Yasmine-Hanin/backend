const express = require("express");
const router = express.Router();
const signInController = require("../controllers/signInController");

// Route for handling sign-in
router.post("/signIn", signInController.signIn);

module.exports = router;
