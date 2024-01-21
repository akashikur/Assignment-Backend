const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
  language: {
    type: String,
    required: true,
  }, // Language of the exercise
  difficulty: {
    type: Number,
    required: true,
  }, // Difficulty level (1-5)
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correctOption: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("exercises", ExerciseSchema);
