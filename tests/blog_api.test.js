const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const api = supertest(app);
const helpers = require("../utils/blog_api");
const userHelpers = require("../utils/user_api");
const User = require("../models/user");
const Blog = require("../models/blog");
let testUserId;
let testUserToken = "";
let blogs = [];
const createUserAndLogin = async (user) => {
  const newUser = new User(user);
  await newUser.save();
  const response = await api.post("/api/login").send(user).expect(200);
  return response.body.token;
};

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  const usersPromise = userHelpers.dummyUsers.map((user) =>
    userHelpers.insertUser(user)
  );
  const users = await Promise.all(usersPromise);
  testUserId = users[0].id;
  const {
    body: { token },
  } = await api
    .post("/api/login")
    .send({ username: users[0].username, password: "12345" });
  testUserToken = `Bearer ${token}`;
  const blogsPromise = helpers.initialBlogs.map((blog) => {
    return helpers.insertBlog(blog, testUserId);
  });
  blogs = await Promise.all(blogsPromise);
}, 20000);

describe("when there is initially blogs in db", () => {
  test("there are two blogs", async () => {
    const response = await api.get("/api/blogs").expect(200);
    expect(response.body).toHaveLength(helpers.initialBlogs.length);
  });
});
describe("adding a new blog", () => {
  test("succeeds with valid data", async () => {
    const newBlog = {
      title: "new blog",
      author: "new blog title",
      url: "new blog url",
    };
    const response = await api
      .post("/api/blogs")
      .set("Authorization", testUserToken)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    expect(response.body.title).toBe(newBlog.title);
  });
  test("fails with invalid data", async () => {
    const newBlog = {
      title: "new blog",
      url: "123",
    };
    await api
      .post("/api/blogs")
      .set("Authorization", testUserToken)
      .send(newBlog)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    const blogs = await helpers.blogsInDb();
    expect(blogs).toHaveLength(helpers.initialBlogs.length);
  });
  test("fails with invalid token", async () => {
    const newBlog = {
      title: "new blog",
      url: "1234",
      author: "test",
    };
    await api
      .post("/api/blogs")
      .set("Authorization", "Bearer 123")
      .send(newBlog)
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });
});

describe("updating a blog", () => {
  test("succeeds with valid data", async () => {
    const blogToUpdate = blogs[0];
    const newBlog = {
      author: "new blog",
      url: "new blog url",
      title: "new blog title",
    };
    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", testUserToken)
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(response.body.title).toBe(newBlog.title);
  });
  test("fails if user doesn't own the blog", async () => {
    const newUser = {
      username: "testuser",
      password: "12345",
    };
    const token = await createUserAndLogin(newUser);
    const blogToUpdate = blogs[0];
    const newBlog = {
      author: "new blog",
      url: "new blog url",
      title: "new blog title",
    };
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(401);
  });
});

describe("deleting a blog", () => {
  test("succeeds with valid id", async () => {
    const blogToDelete = blogs[0];
    const blogsBeforeDelete = await helpers.blogsInDb();
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", testUserToken)
      .expect(204);
    const blogsAfterDelete = await helpers.blogsInDb();
    expect(blogsAfterDelete).toHaveLength(blogsBeforeDelete.length - 1);
  });
  test("fails with invalid id", async () => {
    await api
      .delete(`/api/blogs/123`)
      .set("Authorization", testUserToken)
      .expect(400);
  });
  test("fails if user doesn't own the blog", async () => {
    const newUser = {
      username: "testuser",
      password: "12345",
    };
    const token = await createUserAndLogin(newUser);
    const blogToDelete = blogs[0];
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
