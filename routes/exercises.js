const express = require("express");
const { isAuth } = require("../middlewares/AuthMiddleware");
const {
  getExercises,
  createExercises,
  submitExercise,
} = require("../controllers/exercises.controller");
const app = express();

app.get("/get-exercises/:language", isAuth, getExercises);

app.post("/create-exercises", createExercises);

app.post("/submit", isAuth, submitExercise);

module.exports = app;
