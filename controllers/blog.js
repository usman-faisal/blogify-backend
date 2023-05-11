const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const { tokenDecoder, authChecker } = require("../utils/middleware");
const User = require("../models/user");

blogRouter.get("/", async (req, res) => {
  const response = await Blog.find({}).populate("user");
  res.json(response);
});

blogRouter.post("/", tokenDecoder, async (req, res) => {
  const { body } = req;
  const { decodedToken: token } = res.locals;
  const user = await User.findById(token.id);
  const newBlog = new Blog(body);
  newBlog.user = token.id;
  const response = await newBlog.save();
  response.populate("user", { username: 1, id: 1 });
  user.blogs.push(response._id);
  await user.save();
  res.status(201).json(response);
});

blogRouter.delete("/:id", tokenDecoder, authChecker, async (req, res) => {
  const { id } = req.params;
  await Blog.findByIdAndDelete(id);
  const user = await User.findById(res.locals.decodedToken.id);
  user.blogs = user.blogs.filter((blog) => blog.toString() !== id.toString());
  await user.save();
  res.status(204).end();
});

blogRouter.post("/:id", tokenDecoder, async (req, res) => {
  // write api route to add comments to a specific blog post
  const { id } = req.params;
  const { body } = req;
  const blogToComment = await Blog.findById(id);
  blogToComment.comments.push(body.comment);
  const savedBlog = await blogToComment.save();
  await savedBlog.populate("user");
  res.json(savedBlog);
});

blogRouter.put("/:id", tokenDecoder, authChecker, async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const blogToUpdate = await Blog.findOneAndUpdate({ _id: id }, body, {
    new: true,
    runValidators: true,
    context: "query",
  });
  res.json(blogToUpdate);
});
module.exports = blogRouter;
