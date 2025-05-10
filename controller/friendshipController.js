const mongoose = require("mongoose");
const Friendship = require("../models/friendshipModel.js");
const Request = require("../models/requestModel.js");
const User = require("../models/userModel.js");

exports.getNonFollowers = async (req, res) => {
  const { userId } = req.params;
  try {

    const friendList = await Friendship.find({ $or: [{ userOne: userId }, { userTwo: userId }] }).lean();
    const friendsId = friendList.map((friend) => {
      return friend.userOne === userId ? friend.userTwo : friend.userOne;
    })
    const people = await User.find({ _id: { $nin: [...friendsId, userId] } }).select("-password").limit(20).lean()
    return res.status(200).json({
      success: true,
      people
    })

  } catch (e) {
    console.log("getNonFollowers", e)
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    });
  }
}

exports.followBack = async (req, res) => {
  try {
    const { userOne, userTwo } = req.body;
    const newFriendship = new Friendship({ userOne, userTwo });
    const info = await Promise.all([
      Request.findOneAndDelete({ $or: [{ sender: userOne, recipient: userTwo }, { sender: userTwo, recipient: userOne }] }),
      newFriendship.save()
    ])
    return res.status(200).json({
      success: true,
      info,
      status: "friend"
    })
  } catch (e) {
    console.log("followBack", e)
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    });
  }
}

exports.unfriend = async (req, res) => {
  try {
    const { userOne, userTwo } = req.query;
    const info = await Friendship.findOneAndDelete({
      $or: [{ userOne, userTwo }, { userOne: userTwo, userTwo: userOne }]
    })
    return res.status(200).json({
      success: true,
      info,
      status: "default"
    })

  } catch (e) {
    console.log("unfollow", e)
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    });
  }
}