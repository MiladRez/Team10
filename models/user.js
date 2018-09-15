var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var studentSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    student_id: Number,
    username: String,
    password: String,
    isAdmin: {type: Boolean, default: false}
});

studentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Student", studentSchema);