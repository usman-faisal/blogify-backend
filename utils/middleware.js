const jwt = require("jsonwebtoken");
const { SECRET } = require("./config");
const Blog = require("../models/blog");
const errorHandler = (err, req, res, next) => {
  console.log(err.name);
  console.log(err.message);
  if (err.name === "ValidationError" || err.name === "CastError") {
    res.status(400).json({ error: err.message });
  }
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ error: err.message });
  }
  next();
};

const tokenExtractor = (req, res, next) => {
  const token = req.get("Authorization");
  if (!token) return next();
  res.locals.token = token.slice(7, -1);
  next();
};
const tokenDecoder = (req, res, next) => {
  const { token } = res.locals;
  const decodedToken = jwt.decode(token, "SECRET");
  if (!decodedToken) return res.status(401).json({ error: "Unauthorized" });
  res.locals.decodedToken = decodedToken;
  return next();
};

const authChecker = async (req, res, next) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  const { decodedToken } = res.locals;
  console.log(blog.user.toString());
  console.log(decodedToken.id);
  console.log(blog.user.toString() == decodedToken.id);
  if (blog.user.toString() === decodedToken.id) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

module.exports = {
  errorHandler,
  tokenExtractor,
  tokenDecoder,
  authChecker,
};
