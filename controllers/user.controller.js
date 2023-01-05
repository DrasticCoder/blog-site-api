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
  const Url = `${req.protocol}://${req.get(
    "host"
  )}/user/verify/password/${123}`;
  
  res.send(Url);
  // res.json({user:req.user});
  // console.log(req.user,'USER')
  // console.log("__req.user__", req.get("host"), req.originalUrl);
  // let randomString = "web3sf04nd4r4";
  // res.send(`${req.protocol}://${req.get("host")}/user/verify/${randomString}`);
};

// register
const register = async (req, res) => {
  const { name, email } = req.body;

  // check if user already exist
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.json({ message: "User already exist" });
    return;
  }

  const newUser = User.create({
    name,
    email
  })

  const Url = `${req.protocol}://${req.get(
    "host"
  )}/user/verify/password/${(await newUser).id}`;
  

  const mailTemplate = {
    from: "deepbansodeofficial4205@gmail.com",
    to: email,
    subject: "Alpha Blogs",
    text: `Hey ${name} ,Verify your account by setting up password`,
    html: `
    <form action='${Url}' method="post">
    <input type="password" name="password" placeholder="Enter your password">
    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
</form>`
  };

  mailTransporter.sendMail(mailTemplate, (err) => {
    if (err) {
      console.log("error:", err);
    } else {
      res.send("mail send");
      console.log(`mail send to ${email}.`);
    }
  });
};

const verifyUserByPassword = async (req,res) => {
  const {id} = req.params;
  const {password} = req.body;

  // hashing password using bcrypt
  bcrypt.hash(password, 10, async (err, hash) => {
    if(err){
      console.log(err);
    }else{
      const updatedUser = await User.findByIdAndUpdate(id,{password:hash},{new:true})
      if(updatedUser){
        console.log(updatedUser)
        res.send('Account verification successful, Kindly return to our website.');
      } else{
        res.status(404).json({message:'User not found'});
      }
    }
  })

}

const forgetPassword1 = async (req,res) => {
  const {email} = req.body;

  const foundUser = await User.findOne({email});
  if(foundUser){
    const Url = `${req.protocol}://${req.get(
    "host"
  )}/user/change/password/${foundUser.id}`;

    const mailTemplate = {
      from: "deepbansodeofficial4205@gmail.com",
      to: email,
      subject: "Alpha Blogs",
      text: `Hey ${foundUser.name} , reset your password `,
      html: `
      <form action='${Url}' method="post">
      <label for="password">password:</label>
      <input type="password" name="password" id="password" placeholder="Enter your password">
      <button type="submit">Submit</button>
  </form>`
    };
  
    mailTransporter.sendMail(mailTemplate, (err) => {
      if (err) {
        console.log("error:", err);
      } else {
        res.send("mail send");
        console.log(`mail send to ${email}.`);
      }
    });
  }else{
    res.json({message:'Account not found with this email!'})
  }
}

const forgetPassword2 = (req,res) => {
  const {id} = req.params;
  const {password} = req.body;

  // hashing password using bcrypt
  bcrypt.hash(password, 10, async (err, hash) => {
    if(err){
      console.log(err);
    }else{
      const updatedUser = await User.findByIdAndUpdate(id,{password:hash},{new:true})
      if(updatedUser){
        console.log(updatedUser)
        res.send('Password updated successfully, Kindly return to our website.');
      } else{
        res.status(404).json({message:'User not found'});
      }
    }
  })
}

// send verification mail to user
const sendMailToUser = async (req, res) => {
  const userId = req.user.id;
  console.log(userId,'req.user.id')
  const randomStr =
    Math.floor(Math.random() * (100000000 - 1000000 + 1)) + 1000000;
  const verifyUrl = `${req.protocol}://${req.get(
    "host"
  )}/user/verify/${randomStr}`;
  const vUser = await User.findById(userId);
  const mailTemplate = {
    from: "deepbansodeofficial4205@gmail.com",
    to: vUser.email,
    subject: "Testing...",
    text: `Hey ${vUser.name} ,Verify your account by clicking this link`,
    html: `<a href='${verifyUrl}'> VERIFY </a>`,
  };

  mailTransporter.sendMail(mailTemplate, (err) => {
    if (err) {
      console.log("error:", err);
    } else {
      res.send("mail send");
      console.log(`mail send to ${vUser.email}.`);
    }
  });

  vUser.vCode == randomStr;
  vUser.save();
};

// verify user
const verifyUser = async (req, res) => {
  const verificationCode = req.params.id;
  const user = await User.findById(req.user.id);

  if (verificationCode == user.vCode) {
    user.isVerified == true;
    user.save();

    res.status(200).json({ message: "User verified successfully." });
  } else {
    res.status(500).json({ message: "Oops! something went wrong." });
  }
};

// login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  const foundUser = await User.findOne({ email: email });

  if (foundUser) {
    bcrypt.compare(password, foundUser.password, (err, result) => {
      if (result) {
        const token = jwt.sign(
          {
            id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            password: foundUser.password,
            isVerified: foundUser.isVerified,
            Blogs: foundUser.Blogs,
          },
          process.env.SECRET,
          {
            expiresIn: "2h",
          }
        ); //TODO: Increase expire time
        res.status(200).json({ token: token, message : 'login successful'});
      } else {
        res.status(404).json({message:'Invalid Creadentials'})
      }
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// change password
const changePassword = async (next, req, res) => {
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
            user.save()
              res.status(201).json({ message: "password updated " });
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
  verifyUserByPassword,
  forgetPassword1,
  forgetPassword2
};
