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

describe("logging in a user",() => {
    test("succeeds if user exists and password correct",async() =>{
        const userToLogin = await helpers.userInDb(testUserId);
        const payLoad = {
            username: "usmanshamsi",
            password: "12345"
        }
        const response = await api.post("/api/login").send(payLoad).expect(200);
        expect(userToLogin.username).toBe(response.body.username);
        expect(response.body.token).toBeDefined();
    })

    test("fails with error code 401",async() => {
        const payLoad = {
            username: "usmanshamsi",
            password: "125"
        }
        const response = await api.post("/api/login").send(payLoad).expect(401);
        expect(response.body.error).toBeDefined();
    })
})




afterAll(() => {
    mongoose.connection.close();
})