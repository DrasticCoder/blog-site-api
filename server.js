// import packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();


// initializing express app
const app = express();

// multer
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// passport
const passport = require('passport')
app.use(passport.initialize())

require('./auth/passport')(passport);

// body parser
app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

// connect to db
mongoose.connect('mongodb+srv://test:test@test.p2fum9f.mongodb.net/?retryWrites=true&w=majority')
 .then(()=>{
    console.log('connected to db');
 })

 mongoose.set('strictQuery',true)

// import routers
const userRouter = require('./routers/user.router');
// const commentRouter = require('./routers/comment.router');
const blogRouter = require('./routers/blog.router');


app.use('/',blogRouter);
app.use('/user',userRouter);
// app.use('/comment',commentRouter);


const port = process.env.port || 9000;
app.listen(port,()=>{
    console.log('server is up and running on port :',port);
})




