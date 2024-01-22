const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../modules/Admin");
const BCRYPT_SALTS = Number(process.env.BCRYPT_SALTS);

const adminRegister = async (req, res) => {
  const isValid = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().required(),
    password: Joi.string().min(8).required(),
  }).validate(req.body);
  //if we don't give a proper data
  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid Input",
    });
  }

  // If the user is not exists hashing the password for the security purpose using bcrypt
  const hashPassword = await bcrypt.hash(req.body.password, BCRYPT_SALTS);

  // creating a new User object to store it in database
  const userObj = new Admin({
    username: req.body.username,
    password: hashPassword,
  });
  try {
    await userObj.save();
    return res.status(201).send({
      status: 201,
      message: "user registered successfully",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Error while saving user to DB",
      data: err,
    });
  }
};

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  //validating the input
  const inValid = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).validate(req.body);

  if (inValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid username / Password",
      data: inValid.error,
    });
  }
  //finding the user in the database
  let userData;
  try {
    userData = await Admin.findOne({ username });
    if (!userData) {
      return res.status(400).send({
        status: 400,
        message: "No user found please register",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Error while fetching user data",
      data: err,
    });
  }
  //If the user exists comparing the password
  const isPasswordSame = await bcrypt.compare(password, userData.password);
  if (!isPasswordSame) {
    return res.status(400).send({
      status: 400,
      message: "Incorrect password",
    });
  }
  // creating the payload for the user
  const payload = {
    username: userData.username,
    userId: userData._id,
  };
  // creating the token for the user using jsonwebtoken
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return res.status(200).send({
    status: 200,
    message: "User Logged in successfully",
    data: token,
  });
};

module.exports = {
  adminRegister,
  adminLogin,
};
