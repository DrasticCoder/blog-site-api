// import packages
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");

// nodemailer config
const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "deepbansodeofficial4205@gmail.com",
    pass: "zcvznnsolkrvpacs",
  },
  port: 587,
  host: "smtp.gmail.com",
});

// import model
const User = require("../models/user.model");

// import middlwwares
const signToken = require("../middlewares/signToken");

// controller functions
const test = (req, res) => {
  console.log("__req.user__", req.user.id);
  res.send("user testing,,,");
};

// register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // hashing password using bcrypt
  bcrypt.hash(password, 10, async (err, hash) => {
    const newUser = new User({
      name,
      email,
      password: hash,
    });
    // register user successfully
    await newUser
      .save()
      .then(() => {
        // sign JWT token for user
        const tokenData = signToken(newUser);
        console.log(tokenData);
        res.status(200).json(newUser);
      })
      .catch((err) => {
        console.log("user already exist");
      });
  });
};

// send verification mail to user
const sendMailToUser = async(req, res) => {
  const userId = req.user.id;
  const randomInt = Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000;

  const user = await User.findById(userId, (err, foundUser) => {
    const mailTemplate = {
      from: "deepbansodeofficial4205@gmail.com",
      to: foundUser.email,
      subject: "Testing...",
      text: `Hey ${foundUser.name} ,Verify your account by clicking this link`,
      html: `<a href='${req.origin + "/" + randomInt}'> VERIFY </a>`,
    };

     mailTransporter.sendMail(mailTemplate, (err) => {
      if (err) {
        console.log(err);
      } else {
        res.send('mail send')
        console.log("mail send.");
      }
    });
  });
};

// login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  const foundUser = await User.findOne({ email: email });

  if (foundUser) {
    console.log("login func");
    const result = await bcrypt.compare(password, foundUser.password);
    console.log(result, "this is RESULT");
    if (result) {
      // console.log('found User:',foundUser)
      const token = await jwt.sign({ foundUser }, process.env.SECRET, {
        expiresIn: "2h",
      }); //TODO: Increase expire time
      res.status(200).json({ token: "Bearer " + token });
    }
  } else {
    res.status(404).json({ message: "Username or password is incorrect" });
  }
};

// change password
const changePassword = async(next, req, res) => {
  const { oldPassword, newPassword } = req.body;

  const id = req.user.id;

  const user = await User.findById(id);
  if (user) {
    bcrypt.compare(oldPassword, user.password, (error, result) => {
      if (error) {
        console.log(error);
      }
      if (result) {
        bcrypt.hash(newPassword, 10, (err, hash) => {
          if (err) {
            console.log(err);
          } else {
            user.password == hash;
             user.save().then(() => {
              res.status(201).json({ message: "password updated " });
            });
          }
        });
      } else {
        res.status(500).json({ message: "Incorrect password" });
      }
    });
  }
};

module.exports = {
  test,
  register,
  login,
  changePassword,
  sendMailToUser,
};
