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
        User.findOne({id:payload.foundUser._id},(err,user)=>{
            if(user)return done(null,user);
            else{
                return done(null,false)
            }
            // console.log(payload)
        })

        return payload
    }))
}