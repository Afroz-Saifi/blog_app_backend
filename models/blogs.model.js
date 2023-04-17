const mongoose = require("mongoose");

const blog_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author_email: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
    default: Date(),
  },
});

const Blog = mongoose.model("blog", blog_schema);

module.exports = { Blog };
