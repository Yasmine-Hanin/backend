const bcrypt = require("bcrypt");
const User = require("../models").User;
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Controller action for creating a new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, role, country, phoneNumber, email, password } =
      req.body;

    // Check if the user is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      firstName,
      lastName,
      role,
      country,
      phoneNumber,
      email,
      password: hashedPassword, // Store the hashed password
    });

    res.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Controller action for getting a specific user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};

// Controller action for getting all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
};

// Controller action for count number of users
exports.countUsers = async (req, res) => {
  try {
    const userCount = await User.count();
    res.json({ count: userCount });
  } catch (error) {
    console.error("Error counting users:", error);
    res.status(500).json({ error: "Failed to count users" });
  }
};

// Controller function for deleting user profile
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the user by ID
    const user = await User.findByPk(id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller function for updating user profile
exports.updateUserProfile = async (req, res) => {
  const { id } = req.params; // User ID from request parameters
  const { firstName, lastName, role, country, phoneNumber, email, password } =
    req.body; // Updated user profile data

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user profile data using Sequelize's update method
    await User.update(
      {
        firstName,
        lastName,
        role,
        country,
        phoneNumber,
        email,
        password,
      },
      {
        where: { id },
      }
    );

    return res
      .status(200)
      .json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller function for changing user password
exports.changePassword = async (req, res) => {
  const { id } = req.params;
  const { password, passwordConfirmation } = req.body;

  try {
    // Validate password and confirmation
    if (password !== passwordConfirmation) {
      return res
        .status(400)
        .json({ error: "Password and confirmation do not match." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the user by ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the user's password with the hashed value
    user.password = hashedPassword;

    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while changing the password." });
  }
};

// Generate a new password
const generateNewPassword = () => {
  const length = 10;
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = crypto.randomBytes(length);
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % characters.length;
    password += characters.charAt(randomIndex);
  }

  return password;
};

// Function to send the password reset email
const sendPasswordResetEmail = (email, newPassword) => {
  return new Promise((resolve, reject) => {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "YourEmailServiceProvider", // e.g., Gmail, Yahoo, etc.
      auth: {
        user: "aya.nadim15@gmail.com",
        pass: "your-email-password",
      },
    });

    // Compose the email message
    const mailOptions = {
      from: "aya.nadim15@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `Your new password is: ${newPassword}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

// Function to update the user's password in the database
const updatePasswordInDatabase = async (userId, newPassword) => {
  try {
    // Find the user by their ID in the database
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Update the user's password
    user.password = newPassword;

    // Save the updated user object
    await user.save();

    // Return a success message or updated user object if needed
    return user;
  } catch (error) {
    throw error;
  }
};

// Controller function for reset user password
exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in your user database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a new password or a password reset token
    const newPassword = generateNewPassword();
    // Store the user's current ID
    const userId = user.id;
    // Update the user password in the database
    await updatePasswordInDatabase(userId, newPassword);

    // Send password reset email
    sendPasswordResetEmail(email, newPassword);

    // Return success response
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.countUsersPerDay = async (req, res) => {
//   try {
//     const userCount = await User.count({
//       attributes: [[Sequelize.fn("date", Sequelize.col("createdAt")), "day"]],
//       group: [Sequelize.fn("date", Sequelize.col("createdAt"))],
//     });

//     res.json({ count: userCount });
//   } catch (error) {
//     res.status(500).json({ error: "An error occurred" });
//   }
// };

let viewCount = 0;

exports.incrementViewCount = (req, res, next) => {
  viewCount++;
  next();
};

exports.getViewCount = (req, res) => {
  res.json({ count: viewCount });
};
