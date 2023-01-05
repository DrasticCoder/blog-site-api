const router = require('express').Router();
const passport =require('passport');

// import controller
const blogController = require('../controllers/blog.controller');

// get all public posts :id specifies filter & sort queries
// http://localhost:9000/blogs/search?order=desc&limit=1&skip=3
router.get('/blogs/:id',blogController.getBlogs);


// create new blog
const multer = require('multer')
const upload = multer({ dest: 'public/uploads/' })
router.post('/compose',upload.single('file'),passport.authenticate('jwt', { session: false }),blogController.createBlog);

// update blog
router.post('/update/:id',passport.authenticate('jwt', { session: false }),blogController.updateBlog);

// delete blog
router.delete('/delete/:id',passport.authenticate('jwt', { session: false }),blogController.deleteBlog);

// return all blogs by specific user
router.get('/user-blogs/:id',blogController.getUserBlog);

// return single blog by id
router.get('/blog/:id',blogController.getSingleBlog);

// return img
router.get('/uploads/:fileName',blogController.getImg);

// add comment
router.post('/comment/:id',passport.authenticate('jwt', { session: false }),blogController.addComment);

// upload img
// multer
// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
// router.post('/img',upload.single('file'),passport.authenticate('jwt', { session: false }),blogController.uploadImg);

// search by user's name or blog
router.get('/search/:id',blogController.search);


module.exports = router;