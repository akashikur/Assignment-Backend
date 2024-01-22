const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");

const adminRoute = require("./routes/admin");
const userRoutes = require("./routes/user");

const exercisesRoutes = require("./routes/exercises");

const app = express();
app.use(cors());
const PORT = process.env.PORT;

app.use(express.json());

app.use("/user", userRoutes);

app.use("/exercises", exercisesRoutes);

app.use("/admin", adminRoute);

app.listen(PORT, () => {
  console.log("server is connected to :", PORT);
});
