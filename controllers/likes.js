const likesRouter = require("express").Router({ mergeParams: true });
const Blog = require("../models/blog");
const User = require("../models/user");
const { tokenDecoder } = require("../utils/middleware");

likesRouter.post("/", tokenDecoder, async (req, res) => {
  const { id } = req.params;
  const { decodedToken } = res.locals;
  const blogToUpdate = await Blog.findOne({ _id: id });
  const user = await User.findById(decodedToken.id);
  if (blogToUpdate.likedUsers.includes(decodedToken.id)) {
    blogToUpdate.likes--;
    blogToUpdate.likedUsers = blogToUpdate.likedUsers.filter(
      (user) => user != decodedToken.id
    );
    user.likedBlogs = user.likedBlogs.filter((blog) => blog != id);
  } else {
    blogToUpdate.likes++;
    user.likedBlogs.push(id);
    blogToUpdate.likedUsers.push(decodedToken.id);
  }
  const updatedUser = await user.save();
  console.log(updatedUser);
  const updatedBlog = await blogToUpdate.save();
  res.json(updatedBlog);
});

module.exports = likesRouter;
