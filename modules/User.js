const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  languagePreferences: [
    {
      type: String,
    },
  ],
  progress: {
    proficiencyLevels: {
      //get the initial progress accoding to the language user prefered
      type: Object,
      default: function () {
        const proficiencyLevels = {};
        this.languagePreferences.forEach((lang) => {
          proficiencyLevels[lang] = {
            level: 0,
            score: 0,
          };
        });
        return proficiencyLevels;
      },
    },
    exercisesCompleted: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
        },
        difficulty: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

module.exports = mongoose.model("users", UserSchema);
