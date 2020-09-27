var express               = require("express"),
    app                   = express(),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    Student               = require("./models/user"),
    LocalStrategy         = require("passport-local");

require("dotenv").config()

mongoose.connect('mongodb://localhost:27017/team10_app', { useNewUrlParser: true, useUnifiedTopology: true }); 

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Student.authenticate()));
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", isNotLoggedIn, (req, res) => {
    res.render("login");
});

app.post("/login", isNotLoggedIn, passport.authenticate("local", {failureRedirect: "/login"}), (req, res) => {
    var studentUsername = req.body.username;
    
    Student.findOne({username: studentUsername}, (err, foundStudent) => {
        if(foundStudent.isAdmin){
            res.redirect("/home");
        } else {
            if (err){
                console.log("Error!");
            } else {
                console.log("=======================");
                console.log(foundStudent.first_name + " " + foundStudent.last_name + " logged in.");
                console.log("=======================");
                res.redirect("/schedule/" + foundStudent._id);
            }
        }
    });
});

app.get("/logout", (req, res) => {
    req.logout();
    console.log("=======================");
    console.log("Student has logged out.");
    console.log("=======================");
    res.redirect("/login");
});

app.get("/signup", isNotLoggedIn, (req, res) => {
    res.render("signup");
});

app.post("/signup", isNotLoggedIn, (req, res) => {
    
    var newStudent = new Student({
        first_name: req.body.firstname,
        last_name: req.body.lastname,
        student_id: req.body.studentnum,
        username: req.body.username});
    
    if(req.body.admin_password === process.env.ADMIN_PASSWORD){
        newStudent.isAdmin = true;
    }
    
    Student.register(newStudent, req.body.password, (err, user) => {
        if (err){
            console.log(err);
            return res.render("signup");
        }
        
        console.log("=======================");
        console.log("Added Student");
        console.log("=======================");
        console.log(user);
        res.redirect("/login")            
    });
});

app.get("/schedule/:id", isLoggedIn, (req, res) => {
    Student.findById(req.params.id, (err, foundStudent) => {
        if (err){
            console.log("ERROR!");
        } else {
            res.render("schedule", {student: foundStudent});
        }
    });
});

app.get("/remove/:id", isLoggedIn, (req, res) => {
    var student_id = req.params.id;
    Student.remove({_id: student_id}, (err, removedStudent) => {
        if (err){
            console.log("ERROR!");
        } else {
            console.log("=======================");
            console.log("Removed Student");
            console.log("=======================");
            console.log(removedStudent);
            res.redirect("/home");
        }
    });
});

app.get("/home", isLoggedIn, (req, res) => {
    Student.find({}, (err, students) => {
        if (err){
            console.log("ERROR");
        } else {
            res.render("home", {students: students});
        }
    });
});

app.get("*", (req, res) => {
    res.send("ERROR 404!");
});

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function isNotLoggedIn(req, res, next) {
    if (req. isAuthenticated()) {
        req.logout()
        return res.redirect("/")
    }
    next()
}

app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("The Team 10 server has started!");
});
