const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost:27017/PostApp")

const UserSchema = mongoose.Schema(
    {
        name:String,
        email: String,
        username: String,
        password: String,
        age: String,
        posts: [
            {type: mongoose.Schema. Types.ObjectId, ref:"post"},
        ],
        profilepic: {type: Buffer}
        
    }
);

module.exports = mongoose.model("user", UserSchema)