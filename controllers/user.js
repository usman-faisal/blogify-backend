const userRouter = require("express").Router();
const User = require("../models/user");

userRouter.get("/", async (req, res) => {
  const response = await User.find({}).populate("blogs").populate("likedBlogs");
  res.json(response);
});

userRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    res.status(400).json({ error: "malfunctioned id" });
  }
  res.json(user);
});

userRouter.post("/", async (req, res) => {
  const { body } = req;
  const user = new User(body);
  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

module.exports = userRouter;
