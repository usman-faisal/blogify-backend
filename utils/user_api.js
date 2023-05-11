const User = require("../models/user")

const dummyUsers = [
    {
        username: "usmanshamsi",
        password: "12345",
    },
    {
        username: "umarshamsi",
        password: "01234"
    }
]

const usersInDb = async() => {
    const response = await User.find({});
    return response;
}

const userInDb = async(id) => {
    const response = await User.findById(id);
    return response;
}

const deleteUser = async(id) => {
    await User.findByIdAndDelete(id)
}

const insertUser = async(user) => {
    const newUser = new User(user);
    await newUser.save();
    return newUser;
}



module.exports = {
    dummyUsers,
    usersInDb,
    userInDb,
    insertUser,
    deleteUser,
}