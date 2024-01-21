const express = require("express");
const {
  registerUser,
  loginUser,
  getUserData,
  updateLanguage,
  getAllUsers,
  ClearScore,
} = require("../controllers/user.controller");
const { isAuth } = require("../middlewares/AuthMiddleware");

const app = express();

app.post("/register", registerUser);

app.post("/login", loginUser);

app.get("/get-user", isAuth, getUserData);

app.put("/updateLanguage", isAuth, updateLanguage);

app.get("/get-all-user", isAuth, getAllUsers);

app.put("/clear-user", isAuth, ClearScore);

module.exports = app;
