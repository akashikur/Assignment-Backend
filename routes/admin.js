const express = require("express");
const {
  adminRegister,
  adminLogin,
} = require("../controllers/admin.controller");
const app = express();

app.post("/register", adminRegister);

app.post("/login", adminLogin);

module.exports = app;
