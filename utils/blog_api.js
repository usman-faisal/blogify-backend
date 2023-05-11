const Blog = require("../models/blog")

const initialBlogs = [
    {
        title: "test1",
        author: "author",
        url: "example.com"
    },
    {
        title: "test2",
        author: "author2",
        url: "w.com"
    }
]

const blogsInDb = async() =>{
    const response = await Blog.find({});
    return response
}

const blogInDb = async(id) => {
    const response = await Blog.findById(id);
    return response;
}

const insertBlog = async(blog,userId) => {
    const newBlog = new Blog({
        ...blog,
        user: userId
    });
    const response = await newBlog.save();
    return response;
}

module.exports = {
    initialBlogs,
    insertBlog,
    blogInDb,
    blogsInDb
}