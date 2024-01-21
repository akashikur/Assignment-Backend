const { calculateScore } = require("../functions/calculateScore");
const Exercises = require("../modules/exercises");
const User = require("../modules/User");

const getExercises = async (req, res) => {
  const userId = req.locals.userId;
  const { language } = req.params;

  try {
    const userObj = await User.findById(userId);
    const userProficiency = userObj.progress.proficiencyLevels[language].level;

    const minDifficulty = Math.max(1, userProficiency - 1);
    const maxDifficulty = Math.min(5, userProficiency + 1);

    try {
      const exercise = await Exercises.aggregate([
        {
          $match: {
            language,
            difficulty: { $gte: minDifficulty, $lte: maxDifficulty },
            _id: {
              $nin: userObj.progress.exercisesCompleted.map(
                (completed) => completed.exerciseId
              ),
            },
          },
        },
        { $sample: { size: 1 } },
      ]);

      if (!exercise) {
        return res.status(200).send({
          status: 200,
          message: "No available exercises found",
          data: [],
        });
      }

      return res.status(200).send({
        status: 200,
        message: "Fetched exercises successfully",
        data: exercise,
      });
    } catch (error) {
      return res.status(400).send({
        status: 400,
        message: "Failed to fetch the exercises",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "User don't exists",
    });
  }
};

const createExercises = async (req, res) => {
  const { language, difficulty, question, options, correctOption } = req.body;

  if (!language || !difficulty || !question || !options || !correctOption) {
    return res.status(400).send({
      status: 400,
      error: "Incomplete exercise data",
    });
  }
  try {
    const newExercise = new Exercises({
      language,
      difficulty,
      question,
      options,
      correctOption,
    });
    await newExercise.save();
    return res.status(200).send({
      status: 200,
      message: "successfully saved",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      error: "failed to save",
    });
  }
};

const submitExercise = async (req, res) => {
  const userId = req.locals.userId;
  const { exerciseId, selectedOption } = req.body;
  try {
    const userObj = await User.findById(userId);
    const exercise = await Exercises.findById(exerciseId);
    if (!userObj || !exercise) {
      return res.status(404).json({ error: "User or exercise not found" });
    }
    if (!exercise.options.includes(selectedOption)) {
      return res.status(400).json({ error: "Invalid selected option" });
    }
    const isCorrect = selectedOption === exercise.correctOption;
    const language = exercise.language;
    if (isCorrect) {
      const currentProficiency =
        userObj.progress.proficiencyLevels[language].level;
      const score = userObj.progress.proficiencyLevels[language].score;

      userObj.progress.proficiencyLevels = {
        ...userObj.progress.proficiencyLevels,
        [language]: {
          level:
            currentProficiency < 5
              ? currentProficiency + 1
              : currentProficiency,
          score: score + calculateScore(exercise.difficulty),
        },
      };

      userObj.progress.exercisesCompleted.push({
        exerciseId: exerciseId,
        difficulty: exercise.difficulty,
        status: true,
      });
    } else {
      const currentProficiency =
        userObj.progress.proficiencyLevels[exercise.language].level;
      const score = userObj.progress.proficiencyLevels[exercise.language].score;

      userObj.progress.proficiencyLevels = {
        ...userObj.progress.proficiencyLevels,
        [language]: {
          level:
            currentProficiency > 0
              ? currentProficiency - 1
              : currentProficiency,
          score: score,
        },
      };

      userObj.progress.exercisesCompleted.push({
        exerciseId: exerciseId,
        difficulty: exercise.difficulty,
        status: false,
      });
    }
    await userObj.save();
    return res.status(200).send({
      status: 200,
      message: "answer Submited",
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      error: "failed to Submit the answer",
    });
  }
};

module.exports = { getExercises, createExercises, submitExercise };
