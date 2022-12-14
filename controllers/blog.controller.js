const express = require("express");

// import model
const Blog = require("../models/blog.model");
const User = require("../models/user.model");
const Image = require("../models/image.model");

// controller functions

// return all public blogs
const getBlogs = async (req, res) => {
  const order = req.query.order;
  const limit = req.query.limit;

  const blogs = await Blog.find({ isPrivate: false, delete: false })
    .sort({ _id: order })
    .limit(limit);
  if (blogs) {
    res.status(200).json(blogs);
  }
};

// add blog
const createBlog = async(req, res) => {
  const authorId = req.user.id;
  const { title, content } = req.body;

  const newBlog = await new Blog({
    title,
    content,
    author: authorId,
  });

  await newBlog
    .save()
    .then(() => {
      res.status(200).json({ data: newBlog });
    })
    .catch((err) => {
      res.status(500).json({ message: "SOmething went wront" });
    });
};

const deleteBlog = async(req, res) => {
  const blogId = req.params.id;
  // todo async await
  
    const blog = await Blog.findById(blogId);
    if (blog.author == req.user.id) {
      blog.delete == true;
      await blog.save().then(() => {
        console.log("blog deleted sucessfully.");
      });
    }
  
};

const updateBlog = async(req, res) => {
  const { content } = req.body;
  const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (blog.author == req.user.id) {
      blog.content == content;
      await blog.save().then(() => console.log("content updated"));
    }
  
};

// upload img
const uploadImg =  async (req, res) => {
    const { originalname, filename, path } = req.file
    await Image.create({
        originalName: originalname,
        fileName: filename,
        path
    })
    res.status(201).json({
        message: 'File uploaded successfully'
    })

}

// get blogs from specific user
const getUserBlog = async (req, res) => {
  const userId = req.user.id;

  const blogs = await User.findById(userId).populate("Blogs");
  if (!blogs) {
    res.status(404).json({ message: "Blogs not found" });
  } else {
    res.status(200).json(blogs);
  }
};

// Search local:3000/serach?user=adsfkladjf&blog=jasdf
const search = async (req, res) => {
  let results = [];
  const user = req.query.user;
  const blog = req.query.blog;

  if (blog) {
    const blogs = await Blog.find({ isPrivate: false, delete: false });
    const data = Blog.aggregate([
      { $match: { isPrivate: false, delete: false } }
    ]);
    blogs.forEach((e) => {
      if (e.title.search(blog) >= 1) {
        results.push(e);
      }
    });
  }

  if (user) {
    const users = await User.find({});
    users.forEach((e) => {
      if (e.name.search(user) >= 1) {
        results.push(e);
      }
    });
  }
  res.status(200).json(results);
};

module.exports = {
  getBlogs,
  createBlog,
  deleteBlog,
  updateBlog,
  getUserBlog,
  search,
  uploadImg
};
