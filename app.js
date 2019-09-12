var express               = require("express"),
    app                   = express(),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    Student               = require("./models/user"),
    LocalStrategy         = require("passport-local");

mongoose.connect('mongodb://localhost:27017/team10_app', { useNewUrlParser: true }); 

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "real madrid",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Student.authenticate()));
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {failureRedirect: "/login"}), function(req, res){
    var studentUsername = req.body.username;
    
    Student.findOne({username: studentUsername}, function(err, foundStudent) {
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

app.get("/logout", function(req, res){
    req.logout();
    console.log("=======================");
    console.log("Student has logged out.");
    console.log("=======================");
    res.redirect("/login");
});

app.get("/signup", function(req, res) {
    res.render("signup");
});

app.post("/signup", function(req, res){
    
    var newStudent = new Student({
        first_name: req.body.firstname,
        last_name: req.body.lastname,
        student_id: req.body.studentnum,
        username: req.body.username});
    
    if(req.body.admin_password === "teacheracc"){
        newStudent.isAdmin = true;
    }
    
    Student.register(newStudent, req.body.password, function(err, user){
        if (err){
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, function(){
            console.log("=======================");
            console.log("Added Student");
            console.log("=======================");
            console.log(user);
            if (user.isAdmin){
                res.redirect("/home");
            } else {
                res.redirect("/");
            }
            
        });
    });
});

app.get("/schedule/:id", function(req, res){
    Student.findById(req.params.id, function(err, foundStudent){
        if (err){
            console.log("ERROR!");
        } else {
            res.render("schedule", {student: foundStudent});
        }
    });
});

app.get("/remove/:id", function(req, res){
    var student_id = req.params.id;
    Student.remove({_id: student_id}, function(err, removedStudent){
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

app.get("/home", function(req, res) {
    Student.find({}, function(err, students){
        if (err){
            console.log("ERROR");
        } else {
            res.render("home", {students: students});
        }
    });
});

app.get("*", function(req, res) {
    res.send("ERROR 404!");
});

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

// function isAdmin(req, res, next){
//     if (req.body.isAdmin) {
//         res.redirect("/home");
//     } else {
//         res.redirect("/");
//     }
// }

app.listen(process.env.PORT, process.env.IP, function () {
    console.log("The Team 10 server has started!");
});
