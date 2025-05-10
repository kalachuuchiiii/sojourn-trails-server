const User = require('../models/userModel.js');
const Request = require("../models/requestModel.js");
const Friendship = require("../models/friendshipModel.js");

/**(async function del(){
  try{
   const res = await Request.deleteMany();
   console.log(res)
  }catch(e){
    console.log("delete request", e);
  }
})()**/




exports.removeRequest = async(req, res) => {
  try{
    const options = JSON.parse(req.query.options);
    console.log(options);
    const request = await Request.findOneAndDelete(options).lean();
    return res.status(200).json({
      success: true, 
      request,
      status: "default"
    })
    
    }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    })
    }
  
}


exports.getRelationshipOfUserToAnother = async (req, res) => {
  const { userId, otherUserId } = req.query;

  try {

    const [isFriend, isFollower, isFollowing] = await Promise.all([
      Friendship.exists({ $or: [{ userOne: userId, userTwo: otherUserId }, { userOne: otherUserId, userTwo: userId }] }),
      Request.exists({ sender: otherUserId, recipient: userId }),
      Request.exists({ sender: userId, recipient: otherUserId })
    ])

    const relationshipStatus = isFriend ? "friend" : isFollower ? "follower" : isFollowing ? "following" : "default";

    return res.status(200).json({
      success: true,
      relationshipStatus,
      
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    })
  }
}

exports.getFriendRequests = async (req, res) => {
  const { recipient } = req.params;
  try {

    const [friendRequests, totalFollowers] = await Promise.all([
      Request.find({ recipient }).lean(), 
      Request.find({ recipient }).countDocuments().lean()
      ])
      
    const followerInfos = await Promise.all(friendRequests.map(async(request) => {
      const sender = await User.findById(request.sender).select("-password").lean()
      return { ...sender, requestId: request._id }
    })
    )

    return res.status(200).json({
      success: true,
      totalFollowers,
      followerInfos
    })

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    })
  }
}

exports.sendFriendRequest = async (req, res) => {
  const { recipient, sender } = req.body;
  try {
    const newRequest = new Request({ recipient, sender });
    const info = await newRequest.save();
    return res.status(200).json({
      success: true,
      info,
      status: "following"
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    })
  }
}