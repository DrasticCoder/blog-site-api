const express = require("express");

// import model
const Blog = require("../models/blog.model");
const User = require("../models/user.model");
const Image = require("../models/image.model");
const Comment = require("../models/comment.model");
const Category = require("../models/category.model");

const fs = require("fs");

// controller functions

// return all public blogs
const getBlogs = async (req, res) => {
  // pagination
  const page = parseInt(req.query.page) || 1;
  const blogsPerPage = parseInt(req.query.limit) || 4;
  const order = req.query.order || "desc";
  const skip = (page - 1) * blogsPerPage;

  const blogs = await Blog.find({ isPrivate: false, delete: false })
    .sort({ _id: order })
    .limit(blogsPerPage)
    .skip(skip);

  // count total blogs and no of pages
  const totalBlogs = await Blog.countDocuments({
    isPrivate: false,
    delete: false,
  });
  const totalPages = Math.ceil(totalBlogs / blogsPerPage);
  const currentPage = page;

  if (blogs) {
    // console.log(blogs);
    res.status(200).json({ blogs, totalBlogs, totalPages, currentPage });
  }
};

// add blog
const createBlog = async (req, res) => {
  const authorId = req.user.id;
  const { title, content, category } = req.body;

  const blogExist = await Blog.findOne({ title });
  if (blogExist) {
    res.json({ message: "Blog already exist with same title!" });
    return;
  }

  const newBlog = await Blog.create({
    title,
    content,
    author: authorId,
  });

  // check if category exist or not (if exist then push blogId in category else create new category and push blogId in it)
  const categoryExist = await Category.findOne({ name: category });
  if (categoryExist) {
    categoryExist.blogs.push(newBlog.id);
    await categoryExist.save();

    newBlog.category = categoryExist.id;
    await newBlog.save();
  } else {
    const newCategory = await Category.create({
      name: category,
      blogs: newBlog.id,
    });

    newBlog.category = newCategory.id;
    await newBlog.save();
  }

  const user = await User.findById(authorId);
  user.Blogs.push(newBlog.id);
  await user.save();

  // console.log(req.file);
  // upload image
  const { originalname, filename, path } = req.file;
  const newImage = await Image.create({
    originalName: originalname,
    blogId: newBlog.id,
    fileName: `${filename}-${originalname}`,
    path,
  });

  newBlog.image = newImage.fileName;
  await newBlog.save();
  res.status(200).json({ data: newBlog, message: "Blog created sucessfully" });
};

const getSingleBlog = async (req, res) => {
  const { id } = req.params;

  const foundBlog = await Blog.findById(id).populate("author");
  if (foundBlog) {
    res.send(foundBlog);
  }
};

// return img[WIP]
const getImg = (req, res) => {
  const { fileName } = req.params;

  res.sendFile(fileName, { root: "./public/uploads" });
};

const deleteBlog = async (req, res) => {
  const blogId = req.params.id;
  // todo async await

  const blog = await Blog.findById(blogId);
  if (blog.author == req.user.id) {
    blog.delete == true;
    await blog.save();
    console.log("blog deleted sucessfully.");
  }
};

const updateBlog = async (req, res) => {
  const { content } = req.body;
  const blogId = req.params.id;

  const blog = await Blog.findById(blogId);
  if (blog.author == req.user.id) {
    blog.content == content;
    await blog.save();
    console.log("content updated");
  }
};

// upload img
const uploadImg = async (req, res) => {
  const { originalname, filename, path } = req.file;
  await Image.create({
    originalName: originalname,
    fileName: filename,
    path,
  });
  res.status(201).json({
    message: "File uploaded successfully",
  });
};

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
  const { input } = req.query;
  let results = [];

  const blogs = await Blog.aggregate([
    // { $project: { title: 1 } },
    {
      $match: {
        isPrivate: false,
        delete: false,
        title: {
          $regex: input.toString(),
          $options: "i",
        },
      },
    },
  ]);

  const users = await User.aggregate([
    // { $project: { name: 1 } },
    {
      $match: {
        email: {
          $regex: input.toString(),
          $options: "i",
        },
      },
    },
  ]);

  if (users) {
    results = results.concat(users);
  }
  if (blogs) {
    results = results.concat(blogs);
  }

  // console.log(results);
  res.status(200).json(results);
};

// add comment
const addComment = async (req, res) => {
  const { comment } = req.body;
  const blogId = req.params.id;
  const userId = req.user.id;

  const blog = await Blog.findById(blogId);
  if (blog) {
    const newComment = await Comment.create({
      content: comment,
      author: userId,
      blog: blogId,
    });

    blog.comments.push(newComment._id);
    await blog.save();
    res.status(200).json({ message: "Comment added" });
  } else {
    res.status(404).json({ message: "Blog not found" });
  }
};

// delete comment
const deleteComment = async (req, res) => {
  const commentId = req.params.id;
  const blogId = req.params.blogId;
  const userId = req.user.id;

  const comment = await Comment.findById(commentId);
  if (comment) {
    if (comment.author == userId) {
      await comment.remove();
      res.status(200).json({ message: "Comment deleted" });
    } else {
      res.status(401).json({ message: "You are not authorized" });
    }
  } else {
    res.status(404).json({ message: "Comment not found" });
  }
};

// update comment
const updateComment = async (req, res) => {
  const commentId = req.params.id;
  const blogId = req.params.blogId;
  const userId = req.user.id;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);
  if (comment) {
    if (comment.author == userId) {
      comment.content = content;
      await comment.save();
      res.status(200).json({ message: "Comment updated" });
    } else {
      res.status(401).json({ message: "You are not authorized" });
    }
  } else {
    res.status(404).json({ message: "Comment not found" });
  }
};

module.exports = {
  getBlogs,
  createBlog,
  deleteBlog,
  updateBlog,
  getUserBlog,
  search,
  uploadImg,
  getImg,
  getSingleBlog,
  addComment,
};
