// import packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

// initializing express app
const app = express();

// cors
app.use(cors());

// static
// app.use(express.static(__dirname + 'public/uploads'))

// passport
const passport = require('passport')
app.use(passport.initialize())

require('./auth/passport')(passport);

// body parser
app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

mongoose.set('strictQuery',true)

// connect to db
mongoose.connect('mongodb+srv://test:test@test.p2fum9f.mongodb.net/?retryWrites=true&w=majority')
 .then(()=>{
    console.log('connected to db');
 })


// import routers
const userRouter = require('./routers/user.router');
// const commentRouter = require('./routers/comment.router');
const blogRouter = require('./routers/blog.router');


app.use('/',blogRouter);
app.use('/user',userRouter);
// app.use('/comment',commentRouter);


const port = process.env.PORT || 9000;
app.listen(port,()=>{
    console.log('server is up and running on port :',port);
})




