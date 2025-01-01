const express = require("express")
const app = express()
const fs = require('fs');
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('connect-flash')
const userModel = require("./models/user")
const postModel = require("./models/posts")
const cookieParser = require("cookie-parser")
const upload = require('./utils/multer')
const crypto = require('crypto')
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(session({secret: "shhh", resave: false, saveUninitialized: true}));
app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('login');
    res.locals.error_msg = req.flash('error');
    next();
  });
app.get("/", function(req, res)
{
    res.render("index");
})

app.get("/profile", isLoggedIn, async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("posts");
        if (!user) {
            return res.status(404).send("User not found");
        }
        const allPosts = await postModel.find().populate('user').exec();
        const otherPosts = allPosts.filter(post => post.user && post.user._id.toString() !== user._id.toString());
        const imageBase64 = user.profilepic ? user.profilepic.toString('base64') : null;
        res.render("Home", {
            user,
            otherPosts,
            success_msg: req.flash("success_msg"),
            imageBase64
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


app.get("/like/:id", isLoggedIn, async (req, res) => {
    try {
        let post = await postModel.findOne({ _id: req.params.id.trim() }).populate("user");
        const userIdIndex = post.likes.indexOf(req.user.userid);
        if (userIdIndex === -1) {
            post.likes.push(req.user.userid);
        } else {
            post.likes.splice(userIdIndex, 1);
        }
        await post.save();
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



app.get("/edit/:id", isLoggedIn, async (req, res) => {
    try {
        let post = await postModel.findOne({ _id: req.params.id.trim() });
        res.render("edit", {post})
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post("/update/:id", isLoggedIn, async (req, res) => {
        await postModel.findOneAndUpdate({ _id: req.params.id.trim()},{content: req.body.content });
        res.redirect("/profile");
   
});
app.get("/login", (req, res)=>{
    res.render("login", {  error_msg: req.flash("error_msg")});
})


app.post("/login", async(req, res)=>
{
    let{email, password} = req.body;
    let user = await userModel.findOne({email})
    if(!user) return res.status(500).send("Something went wrong!");

    bcrypt.compare(password, user.password, function(err, result)
    {
        if(result)
        {
            let token = jwt.sign({email: email, userid: user._id}, "shhhh");
            res.cookie('token', token)
            req.flash("success_msg", "Login successful!");
            res.status(200).redirect("/profile");
            
        }
        else
        {
            req.flash("error_msg", "Login unsuccessful. Please try again.");
            res.redirect("/login")
        }
    })
})

app.get("/logout", (req, res)=>{
    res.cookie("token", "");
    res.redirect("login")
})

function isLoggedIn(req, res, next){
    if(req.cookies.token === "") res.send("You need to log in first")
    else{
        let data = jwt.verify(req.cookies.token, "shhhh");
        req.user = data;
        next();
        }
        
}
app.post("/register", upload.single('image'), async function(req, res)
{
    let{email, password, username, name, age, posts} = req.body;
    let user = await userModel.findOne({email});
    if(user) return res.status(500).send("User Already Register");
    bcrypt.genSalt(10, function(err, salt)
{
    bcrypt.hash(password, salt, async function(err, hash)
{
    if (req.file) {
        profilepic = req.file.buffer; 
    } else {
        const defaultImagePath = path.join(__dirname, 'public', 'data', 'images.jpg');
        profilepic = fs.readFileSync(defaultImagePath); // Read default image
    }
    let user = await userModel.create({
        username, 
        email,
        password: hash,
        age,
        name, 
        profilepic
    });
    let token = jwt.sign({email: email, userid: user._id}, "shhhh");
    res.cookie('token', token)
    res.redirect("/login")
})
})
})
app.listen(3000)

app.post("/post", isLoggedIn, async (req, res)=>
{
    let {content} = req.body;
    let user = await userModel.findOne({email: req.user.email});
    let post = await postModel.create(
        {
            user: user._id,
            content
        }
    );
    console.log(post)
    await user.posts.push(post._id);
    await user.save();
    res.redirect("/profile")
});


app.get('/', function(req, res)
{
    res.render("Upload")
})

app.post('/file', upload.single('image'), function(req, res)
{
    console.log(req.file);
})