const app = require("../app");
const supertest= require("supertest");
const mongoose = require("mongoose");
const api = supertest(app);
const helpers = require("../utils/user_api")
const User = require("../models/user")

let testUserId;
beforeEach(async () => {
    await User.deleteMany({});
    const usersPromise =
        helpers.dummyUsers.map((user) => helpers.insertUser(user))
    const users = await Promise.all(usersPromise)
    testUserId = users[0].id;
})
describe("when there is initially some users in db", () => {
    test("two users",async () => {
        const response = await api.get(`/api/users`).expect(200);
        const usernames = response.body.map(user => user.username);
        expect(usernames).toContain(helpers.dummyUsers[0].username);
        expect(response.body).toHaveLength(helpers.dummyUsers.length);
    })
    test("getting information of a single user",async() => {
        const userToGet = await helpers.userInDb(testUserId);
        const response = await api.get(`/api/users/${testUserId}`).expect(200);
        expect(userToGet.username).toBe(response.body.username);
    })
    test("getting information of a single user fails if invalid id",async() => {
        await helpers.deleteUser(testUserId);
        const response = await api.get(`/api/users/${testUserId}`).expect(400);
    })
})

describe("adding a new user", () => {
    test("succeeds with valid data",async () => {
        const allUsersBefore = await helpers.usersInDb();
        const newUser = {
            username: "newUser",
            password: "valid"
        }
        await api.post("/api/users").send(newUser).expect(201).expect("Content-Type",/application\/json/);
        const allUsersAfter = await helpers.usersInDb();
        expect(allUsersAfter).toHaveLength(allUsersBefore.length + 1);
    })
    test("fails with valid data",async () => {
        const allUsersBefore = await helpers.usersInDb();
        // invalid password length.
        const newUser = {
            username: "newUser",
            password: "val"
        }
        await api.post("/api/users").send(newUser).expect(400).expect("Content-Type",/application\/json/);
        const allUsersAfter = await helpers.usersInDb();
        expect(allUsersAfter).toHaveLength(allUsersBefore.length);
    })
    test("fails if username is taken",async() => {
        const newUser = {
            username: "usmanshamsi",
            password: "1231231",
        }
        await api.post("/api/users").send(newUser).expect(400).expect("Content-Type",/application\/json/);
    })
})

afterAll(() => {
    mongoose.connection.close();
})