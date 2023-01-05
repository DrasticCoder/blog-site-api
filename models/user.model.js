// ToDo : ADD USER_INFO IN SCHEMA
// user_info : {}

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {type : String , require:true},
    email : {type :String , require:true, unique : true},
    password : {type:String },
    about : {type: String},
    profile_pic : {type:String},
    isVerified : {type:Boolean , default : false},
    vCode : {type:String},
    isPrivate : {type:Boolean , default : false},
    deleted : {type:Boolean , default : false},
    Blogs : [{type:mongoose.Schema.Types.ObjectId,ref:'Blog'}]
}
,{timestamps:true}
)

module.exports = mongoose.model('User',userSchema);
