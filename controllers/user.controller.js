const Joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../modules/User");
const jwt = require("jsonwebtoken");
// const Follow = require("../modules/Follow");
const BCRYPT_SALTS = Number(process.env.BCRYPT_SALTS);

//post register user
const registerUser = async (req, res) => {
  // Data validation
  const isValid = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().email().required(),
    language: Joi.array().required(),
  }).validate(req.body);
  //if we don't give a proper data
  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid Input",
    });
  }
  //checking if the user is already exists
  try {
    // const userExists = await User.find({
    //   $or: [{ email: req.body.email, username: req.body.username }],
    // }); //or is query for the data
    const existUserName = await User.find({ username: req.body.username });
    const existUserEmail = await User.find({ email: req.body.email });

    if (existUserName.length != 0 || existUserEmail.length != 0) {
      return res.status(400).send({
        status: 400,
        message: "Username/Email already exists",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      status: 400,
      message: "Error while checking username and email exists",
      data: error,
    });
  }
  // If the user is not exists hashing the password for the security purpose using bcrypt
  const hashPassword = await bcrypt.hash(req.body.password, BCRYPT_SALTS);

  // creating a new User object to store it in database
  const userObj = new User({
    username: req.body.username,
    password: hashPassword,
    email: req.body.email,
    languagePreferences: req.body.language,
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
    });
  }
};

//post for the login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  //validating the input
  const inValid = Joi.object({
    email: Joi.string().required(),
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
    userData = await User.findOne({ email });
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
    email: userData.email,
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

const getUserData = async (req, res) => {
  const userId = req.locals.userId;

  try {
    const userObj = await User.findById(userId);
    return res.status(200).send({
      status: 200,
      message: "fetched userdata successfully",
      data: userObj,
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch",
    });
  }
};

const updateLanguage = async (req, res) => {
  const { languagePreferences } = req.body;

  const userId = req.locals.userId;
  try {
    const user = await User.findById(userId);

    await User.findByIdAndUpdate(userId, { languagePreferences });

    const updatedProficiencyLevels = {};

    languagePreferences.forEach((lang) => {
      updatedProficiencyLevels[lang] = user.progress.proficiencyLevels[lang] = {
        level: 0,
        score: 0,
      };
    });

    await User.findByIdAndUpdate(userId, {
      "progress.proficiencyLevels": updatedProficiencyLevels,
    });

    return res.status(200).send({
      status: 200,
      message: "Language Updated",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to update Language",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const userData = await User.find();
    return res.status(200).send({
      status: 200,
      message: "successFully fetched all the uses",
      data: userData,
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Failed to Fetch the user data",
    });
  }
};

const ClearScore = async (req, res) => {
  const userId = req.locals.userId;
  const { language } = req.body;
  try {
    const userObj = await User.findById(userId);
    if (!userObj) {
      return res.status(404).json({ error: "User or exercise not found" });
    }
    const currentProficiency =
      userObj.progress.proficiencyLevels[language].level;

    userObj.progress.proficiencyLevels = {
      ...userObj.progress.proficiencyLevels,
      [language]: {
        level: currentProficiency,
        score: 0,
      },
    };
    userObj.progress.exercisesCompleted = [];
    await userObj.save();
    return res.status(200).send({
      status: 200,
      message: "Score reseted",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      error: "failed to Submit the answer",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserData,
  updateLanguage,
  getAllUsers,
  ClearScore,
};
