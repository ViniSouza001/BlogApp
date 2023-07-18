if(process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: "mongodb+srv://blogapp-proj.tx1wvdy.mongodb.net/"
    }
} else {
    module.exports = {
        mongoURI: "mongodb://0.0.0.0:/blogapp"
    }
}