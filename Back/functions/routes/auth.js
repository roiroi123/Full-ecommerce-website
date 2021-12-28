const User = require("../models/User");
const router = require("express").Router();
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJs.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});
//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong credentials!");

    const hashedPassword = CryptoJs.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const originalPassword = hashedPassword.toString(CryptoJs.enc.Utf8);
    originalPassword !== req.body.password &&
      res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign({
      id: user.id,
      isAdmin: user.isAdmin,
    },process.env.JWT_SEC,
    {expiresIn:"3d"});

    const { password, ...others } = user._doc;
    res.status(200).json({...others,accessToken: accessToken});
  } catch (error) {
    res.status(500).json(error);
  }
});
module.exports = router;
