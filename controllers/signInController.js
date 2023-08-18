const bcrypt = require("bcrypt");
const User = require("../models").User;

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Email does not exist
      res.status(401).json({ message: "Email does not exist" });
    } else if (!bcrypt.compareSync(password, user.password)) {
      // Incorrect password
      res.status(401).json({ message: "Incorrect password" });
    } else {
      // Sign-in successful
      // You can generate a token or session here and send it back to the client
      res.status(200).json({ message: "Sign-in successful", user: user });
    }
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
