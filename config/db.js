if(process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: "mongodb+srv://vinisouza:hamster007@cluster0.sqc5ntr.mongodb.net/?retryWrites=true&w=majority"
    }
} else {
    module.exports = {
        mongoURI: "mongodb://0.0.0.0:/blogapp"
    }
}