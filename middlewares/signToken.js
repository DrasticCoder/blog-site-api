const jwt = require('jsonwebtoken');


function signJWT(payload){
    // sign token
    jwt.sign(
        payload,
        'secret',
        { expiresIn: 30 },
        (err, token) => {
          return({
                success: true,
                message: 'Login Successfully!',
                token: 'Bearer ' + token,
                data: payload
            })
        }
    )
}

module.exports = signJWT;

