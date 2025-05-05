const Notification = require('../models/notificationModel.js'); 
const mongoose = require('mongoose');

const notifyLikePost = async({receiverId, message, parentPostId, targetType, targetId, actor}) => {
  
  const url = `/post/${targetId || parentPostId}`;
  
  try{
    const newNotification = new Notification({receiverId, message, url, parentPostId, targetType, targetId, actor});
    await newNotification.save();
  }catch(e){
    console.log(e)
    throw new Error("Error liking the post")
  }
}

const getNotificationsOfUser = async(req, res) => {
  const { userId, page } = req.params; 
  if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
    return res.status(404).json({
      success: false, 
      message: "User not found"
    })
  }
  try{
    const limit = 12;
    const notifications = await Notification.find({receiverId: userId}).sort({createdAt:-1}).skip(page * limit).limit(limit).lean(); 
    
    return res.status(200).json({
      success: true, 
      notifications
    })
    
    }catch(e){
    return res.status(500).json({
    success: true, 
    message: e.message || 'Internal Server Error'
    })
    }
}

const removeLikePostNotification = async({parentPostId, targetId, actor, receiverId}) => {
  try{
    
    const del = await Notification.deleteOne({
      parentPostId, targetId, actor, receiverId
    })
    return del;
    }catch(e){
      console.log(e)
      throw new Error("Error disliking on the post")
    
    }
}

const notifyCommentOnPost = async({targetId, actor, receiverId, parentPostId })=> {
  if(receiverId === actor){
    return null;
  }
  
  const targetType = "comment";
  const url = `/post/${parentPostId}/?highlight=comment&_id=${targetId}`;
  const message = "Commented on your post";
  
  
  try{
    const newNotification = new Notification({targetId, actor, receiverId, parentPostId, targetType, message, url}); 
    const doc = await newNotification.save();
    return doc;
  }catch(e){
    console.log(e)
    throw new Error("Error commenting on the post")
  }
}

module.exports = {notifyLikePost, getNotificationsOfUser, removeLikePostNotification, notifyCommentOnPost};