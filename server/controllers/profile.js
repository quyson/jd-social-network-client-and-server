const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

const getUserProfile = async (req, res) => {
  try {
    const [user, posts] = await Promise.all([
      User.findById(req.user.id, [
        "username",
        "first_name",
        "last_name",
        "bio",
        "dob",
        "private",
        "friendList",
      ]),
      Post.find({ directedTo: req.user.id }).populate({
        path: "user",
        select: "first_name last_name username",
      }),
    ]);

    const postIds = posts.map((post) => post._id);

    const comments = await Comment.find({ post: { $in: postIds } }).populate({
      path: "user",
      select: "first_name last_name username createdAt",
    });

    const postsWithComments = posts.map((post) => {
      const postComments = comments.filter((comment) =>
        comment.post.equals(post._id)
      );
      return { ...post.toObject(), comments: postComments };
    });

    res.send({
      success: true,
      resultUser: user,
      resultPost: postsWithComments,
    });
  } catch (error) {
    next(error);
  }
};

const getOthersPage = async (req, res) => {
  try {
    const [user, posts] = await Promise.all([
      User.findById(req.params.id, [
        "username",
        "first_name",
        "last_name",
        "bio",
        "dob",
        "private",
        "friendList",
        "friendRequests",
      ]),
      Post.find({ directedTo: req.params.id }).populate({
        path: "user",
        select: "first_name last_name username",
      }),
    ]);
    if (user.id === req.user.id) {
      res.send({
        success: true,
        sameUser: true,
      });
    }
    if (user.friendList.includes(req.user.id)) {
      const postIds = posts.map((post) => post._id);
      const comments = await Comment.find({ post: { $in: postIds } }).populate({
        path: "user",
        select: "first_name last_name username createdAt",
      });
      const postsWithComments = posts.map((post) => {
        const postComments = comments.filter((comment) =>
          comment.post.equals(post._id)
        );
        return { ...post.toObject(), comments: postComments };
      });
      res.send({
        success: true,
        resultUser: user,
        resultPost: postsWithComments,
        access: true,
        friends: true,
      });
    } else {
      if (user.private && user.friendRequests.includes(req.user.id)) {
        res.send({
          success: true,
          access: false,
          friendRequestSent: true,
          resultUser: {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            bio: user.bio,
          },
        });
      } else if (user.private && !user.friendRequests.includes(req.user.id)) {
        res.send({
          success: true,
          access: false,
          friendRequestSent: false,
          resultUser: {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            bio: user.bio,
          },
        });
      } else {
        const postIds = posts.map((post) => post._id);
        const comments = await Comment.find({
          post: { $in: postIds },
        }).populate({
          path: "user",
          select: "first_name last_name username createdAt",
        });
        const postsWithComments = posts.map((post) => {
          const postComments = comments.filter((comment) =>
            comment.post.equals(post._id)
          );
          return { ...post.toObject(), comments: postComments };
        });
        res.send({
          success: true,
          resultUser: user,
          resultPost: postsWithComments,
          access: false,
          friends: false,
        });
      }
    }
  } catch (error) {
    return next(error);
  }
};

const unfriend = async (req, res) => {
  try {
    const [user, otherUser] = await Promise.all([
      User.findByIdAndUpdate(
        req.user.id,
        {
          $pull: {
            friendList: req.params.id,
          },
        },
        { new: true }
      ),
      User.findByIdAndUpdate(
        req.params.id,
        { $pull: { friendList: req.user.id } },
        { new: true }
      ),
    ]);
    res.send({
      success: true,
      message: "Successfully Unfriended",
    });
  } catch {
    next(error);
  }
};

const changeProfilePicture = async (req, res) => {
  const editPath = req.file.path.slice(16);
  await sharp(req.file.path).resize(800, 600).toFile(req.file.path);
  User.findOneAndUpdate(
    { _id: req.user.id },
    { $set: { profilePicture: editPath } }
  )
    .then((response) => {
      res.send({
        success: true,
        message: "Successfully changed profile picture",
      });
    })
    .catch((error) => console.log(error));
};

module.exports = {
  getUserProfile,
  getOthersPage,
  unfriend,
  changeProfilePicture,
};
