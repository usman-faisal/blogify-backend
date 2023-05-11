const app = require("./app")
const {PORT} = require("./utils/config")
app.listen(PORT,() => {
    console.log('listening on port',PORT)
})