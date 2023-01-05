const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        unique: true,
    },
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("category", categorySchema);
