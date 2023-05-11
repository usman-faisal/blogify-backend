const express = require("express");
require("express-async-errors");
const cors = require("cors");
const app = express();
app.use(cors());
const userRouter = require("./controllers/user");
const mongoose = require("mongoose");
const { MONGODB_URI } = require("./utils/config");
const loginRouter = require("./controllers/login");
const blogRouter = require("./controllers/blog");
const likesRouter = require("./controllers/likes");

app.use(express.json());
const {
  errorHandler,
  tokenExtractor,
  tokenDecoder,
} = require("./utils/middleware");
mongoose.connect(MONGODB_URI).then(() => {
  console.log("connected to mongodb");
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.use(tokenExtractor);
if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}

app.use("/api/login", loginRouter);
app.use("/api/users", userRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/blogs/:id/likes", likesRouter);
app.use(errorHandler);

module.exports = app;
