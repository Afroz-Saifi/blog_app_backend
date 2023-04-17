const express = require("express");
const { User } = require("../models/user.model");
const { Blog } = require("../models/blogs.model");
const { Blacklist } = require("../models/blacklist");
const { authentication } = require("../middleware/authentication");
const { authorization } = require("../middleware/authorization");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const user_data = new User(req.body);
    await user_data.save();
    return res.status(201).json({
      success: {
        status: 201,
        msg: "user registered successfully",
      },
    });
  } catch (err) {
    return res.status(400).json({
      error: {
        status: "400 Bad request",
        msg: err,
      },
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user_checker = await User.findOne({ email });
    if (!user_checker) {
      return res.status(400).json({
        eror: {
          status: "400 Bad request",
          msg: "no user with this email",
        },
      });
    }
    const pass_check = bcrypt.compareSync(password, user_checker.password);
    if (!pass_check) {
      return res.status(400).json({
        eror: {
          status: "400 Bad request",
          msg: "incorect password",
        },
      });
    }
    const payload = { email, role: user_checker.role };
    const access_token = jwt.sign(payload, process.env.access_token, {
      expiresIn: "1m",
    });
    const refresh_token = jwt.sign(payload, process.env.refresh_token, {
      expiresIn: "3m",
    });
    res.cookie("access_token", access_token);
    res.cookie("refresh_token", refresh_token);
    return res.status(200).json({
      success: {
        status: "200 OK",
        msg: "user login success",
        access_token,
        refresh_token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: {
        staus: "500 server error",
        error: err,
      },
    });
  }
});

router.post("/blog/post", authentication, async (req, res) => {
  try {
    const blog_data = new Blog(req.body);
    await blog_data.save();
    return res.status(201).json({
      created: {
        status: "201 Created",
        msg: "blog posted successfully",
        blog: blog_data,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: {
        status: "500 server error",
        msg: "not able to post",
        error: err,
      },
    });
  }
});

router.get("/all_blogs", authentication, async (req, res) => {
  try {
    // const author_email = req.user.email;
    // const data = await Blog.find({ author_email });
    const data = await Blog.find();
    if (data.length == 0) {
      return res.status(404).json({ msg: "no blogs yet" });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ error });
  }
});

router.get("/my_blog/:id", authentication, async (req, res) => {
  try {
    const author_email = req.user.email;
    const { id } = req.params;
    const data = await Blog.findOne({ _id: id, author_email });
    if (!data) {
      return res.status(404).json({ msg: "you are not authorized" });
    }
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(404).json({ error });
  }
});

router.patch("/my_blog/update/:id", authentication, async (req, res) => {
  try {
    const author_email = req.user.email;
    const { id } = req.params;
    const updated = await Blog.findOneAndUpdate(
      { _id: id, author_email },
      req.body
    );
    if (!updated) {
      return res.status(400).json({ err: "you are not authoeized" });
    }
    return res.status(201).json({
      msg: "blog updated",
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

router.delete("/my_blog/delete/:id", authentication, async (req, res) => {
  try {
    const author_email = req.user.email;
    const { id } = req.params;
    const deleted = await Blog.findOneAndDelete({ _id: id, author_email });
    if (!deleted) {
      return res.status(400).json({ err: "blog not available" });
    }
    return res.status(201).json({
      msg: "blog delete",
      blog: deleted,
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

router.delete(
  "/delte_any_blog/:id",
  authentication,
  authorization(["Moderator"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Blog.findOneAndDelete({ _id: id });
      if (!deleted) {
        return res.status(400).json({ err: "blog not available" });
      }
      return res.status(201).json({
        msg: "blog delete",
        blog: deleted,
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
);

router.get("/refresh_token", (req, res) => {
  try {
    const { refresh_token } = req.cookies;
    const decoded = jwt.verify(refresh_token, process.env.refresh_token);
    if (!decoded) {
      return res.status(400).json({ err: "please login" });
    }
    const { email, role } = decoded;
    const payload = { email, role };
    const user = { email, role };
    const access_token = jwt.sign(payload, process.env.access_token, {
      expiresIn: "1m",
    });
    res.cookie("access_token", access_token);
    return res.status(200).json({ msg: "new token has updated", access_token });
  } catch (error) {
    return res.status(404).json({ msg: "please login" });
  }
});

router.get("/logout", authentication, async (req, res) => {
  try {
    const { access_token, refresh_token } = req.cookies;
    const black_list = new Blacklist({ access_token, refresh_token });
    await black_list.save();
    return res.status(200).json({ msg: "logout success" });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

module.exports = { router };
