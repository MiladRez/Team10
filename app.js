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

//moved to USER.JS file
// var studentSchema = new mongoose.Schema({
//     first_name: String,
//     last_name: String,
//     student_id: Number,
//     username: String,
//     password: String
// });

// var Student = mongoose.model("Student", studentSchema);

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

//WORKS
// app.post("/student_login", function(req, res) {
//     var studentUsername = req.body.username;
//     var studentPassword = req.body.password;
    
//     Student.findOne({username: studentUsername, password: studentPassword}, function(err, foundStudent) {
//         if (err){
//             console.log("Error!");
//         } else {
//             console.log("=======================");
//             console.log(foundStudent.first_name + " " + foundStudent.last_name + " logged in.");
//             console.log("=======================");
//             res.redirect("/schedule/" + foundStudent._id);
//         }
//     });
// });

app.get("/signup", function(req, res) {
    res.render("signup");
});

app.post("/signup", function(req, res){
    // var studentFirstName = req.body.firstname;
    // var studentLastName = req.body.lastname;
    // var studentNumber = req.body.studentnum;
    // var studentUsername = req.body.username;
    // var studentPassword = req.body.password;
    // var adminPassword = req.body.admin_password;
    
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

//WORKS
// app.post("/add_student", function(req, res) {
//     var studentFirstName = req.body.firstname;
//     var studentLastName = req.body.lastname;
//     var studentNumber = req.body.studentnum;
    
//     var studentUsername = req.body.username;
//     var studentPassword = req.body.password;
    
//     Student.create({
//         first_name: studentFirstName,
//         last_name: studentLastName,
//         student_id: studentNumber,
//         username: studentUsername,
//         password: studentPassword
//     }, function(err, student){
//         if(err){
//             console.log("ERROR!");
//         } else {
//             console.log("=======================");
//             console.log("Added Student");
//             console.log("=======================");
//             console.log(student);
//         }
//     });
//     res.redirect("/home");
// });

app.get("/schedule/:id", function(req, res){
    Student.findById(req.params.id, function(err, foundStudent){
        if (err){
            console.log("ERROR!");
        } else {
            res.render("schedule", {student: foundStudent});
        }
    });
});

//DOESNT QUITE WORK
// app.get("/schedule/:username", function(req, res){
//     var student_username = req.body.username;
    
//     Student.find({username: student_username}, function(err, foundStudent){
//         if(err){
//             console.log("Error!");
//         } else {
//             res.render("schedule", {student: foundStudent});
//         }
//     });
// });

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