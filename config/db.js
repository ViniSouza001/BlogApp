if(process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: "mongodb+srv://viniciussouza130705:#Mgcube593722@blogapp-proj.tx1wvdy.mongodb.net/?retryWrites=true&w=majority"
    }
} else {
    module.exports = {
        mongoURI: "mongodb://0.0.0.0:/blogapp"
    }
}