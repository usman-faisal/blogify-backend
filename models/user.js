const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 5,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minLength: 5,
    required: true,
  },
  likedBlogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
});
userSchema.plugin(uniqueValidator);
userSchema.set("strictQuery", true);
userSchema.set("toJSON", {
  transform: (document, recievedObject) => {
    recievedObject.id = recievedObject._id;
    delete recievedObject.password;
    delete recievedObject._id;
    delete recievedObject.__v;
  },
});

module.exports = mongoose.model("User", userSchema);
