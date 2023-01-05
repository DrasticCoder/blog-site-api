const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    delete: { type: Boolean, default: false },
    category: { type: String, default: "Uncategorized" },
    comments : [{type :mongoose.Schema.Types.ObjectId , ref :'Comment'}],
    isPrivate: { type: Boolean, default: false },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1664575602276-acd073f104c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHwxMXx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
