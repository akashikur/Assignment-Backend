const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URL)
  .then((res) => {
    console.log("MONGODB CONNECTED");
  })
  .catch((err) => {
    console.log(err);
  });
