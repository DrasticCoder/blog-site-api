const jwt = require('jsonwebtoken');

const verifyToken = (req,res ,next) => {
       // check if header consist header
       if(req.headers.authorization){
        jwt.verify(req.headers.authorization.split(' ')[1],process.env.SECRET,(err,result)=>{
            if(err){
                console.log(err);
            } else {
                // if token is valid then send response 
                res.setHeader('authorization',result)
                console.log('valid user',result)
            }
        })
    }else{
        // redirect to login page if header is not presend in request
        console.log('unauthorized user redirecting to login page')
        next();
        // res.send('login page')
    } 
}

module.exports = {
    verifyToken
}