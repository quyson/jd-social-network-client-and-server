const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

const getPost = async (req, res) => {
  try {
    const [post, comments] = await Promise.all([
      Post.findById(req.params.id).populate("user"),
      Comment.find({ post: req.params.id }).populate("user"),
    ]);
    res.send({
      post: post,
      comments: comments,
    });
  } catch (error) {
    next(error);
  }
};

const likePost = (req, res) => {
  Post.findById(req.params.id)
    .then((result) => {
      if (result.likeList.includes(req.user.id)) {
        return;
      }
      const updatedLikes = result.likes + 1;
      result.likeList.push(req.user.id);
      result.likes = updatedLikes;
      result
        .save()
        .then((result) => {
          res.send({
            success: true,
            likes: result.likes,
          });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getPost, likePost };