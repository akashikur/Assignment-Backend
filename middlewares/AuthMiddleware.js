const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  const token = req.headers["quiz"];
  let verified;
  try {
    verified = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "JWT not provided Pleace login ",
      data: error,
    });
  }
  if (verified) {
    req.locals = verified;
    next();
  } else {
    return res.status(400).send({
      status: 400,
      message: "not Authenticated.please login ",
    });
  }
};
module.exports = { isAuth };
