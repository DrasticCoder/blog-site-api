const router = require('express').Router();
const passport = require('passport')

// import controller
const userController = require('../controllers/user.controller');

// import middlewares
const verifyToken = require('../middlewares/verifyToken');

// testing
router.get('/testing',passport.authenticate('jwt', { session: false }),userController.test);


// register user
router.post('/register',userController.register);

// send verification mail
router.get('/send-mail',passport.authenticate('jwt', { session: false }),userController.sendMailToUser);

// login
router.post('/login',userController.login)

// verifying jwt token before every request {except for register}
// router.use(verifyToken.verifyToken)

// change Password
router.post('/change-pass',passport.authenticate('jwt', { session: false }), userController.changePassword);



module.exports = router;