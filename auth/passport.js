require('dotenv').config();

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const mongoose = require('mongoose')

const User = require('../models/user.model')

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

module.exports = passport => {
    passport.use(new JwtStrategy(opts, (payload,done) => {
        User.findOne({_id:payload.id},(err,user)=>{
            if(user){
                console.log("THIS IS PAYLOAD",payload)
                // passport.serializeUser(function(user, done) {
                //     done(null, user);
                // });
                
                // passport.deserializeUser(function(obj, done) {
                //     done(null, obj);
                // });
                return done(null,user);
            }
            else{
                return done(null,false)
            }
        })

        return payload
    }
    ))
}