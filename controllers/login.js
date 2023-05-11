const loginRouter = require("express").Router();
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const {SECRET} = require("../utils/config")

loginRouter.post("/",async(req,res) => {
    const {username,password} = req.body;
    const user = await User.findOne({username: username})
    if(!user || password !== user.password) {
        return res.status(401).json({error: "incorrect username or password"});
    }
    const userForToken = {
        username: user.username,
        id: user._id,
    }
    console.log(userForToken);
    const token = jwt.sign(userForToken,"SECRET");
    console.log(token);
    res.json({token,username: user.username});
})

module.exports = loginRouter;
