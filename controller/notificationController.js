const Notification = require('../models/notificationModel.js');
const mongoose = require('mongoose');

const notifyLikePost = async ({ recipient, parentPostId, targetType = "post", targetId, sender }) => {

  try {
    console.log(recipient)
    const notif = await Notification.findOne({ recipient, targetId, parentPostId, message: "Liked your post" });
    if (notif) {
      notif.senders.push(sender);
      const notification = await notif.save();
      return notification
    }

    const newNotif = new Notification({
      recipient,
      targetId,
      targetType,
      parentPostId,
      senders: [sender],
      message: "Liked your post"
    });
    const savedNotif = newNotif.save();
    return savedNotif;
  } catch (e) {
    console.log(e)
    throw new Error("Error liking the post")
  }
}

const getNotificationsOfUser = async (req, res) => {
  const { userId, page } = req.params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    })
  }
  try {
    console.log(userId)
    const limit = 12;
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).skip(page * limit).limit(limit).lean();

    return res.status(200).json({
      success: true,
      notifications
    })

  } catch (e) {
    return res.status(500).json({
      success: true,
      message: e.message || 'Internal Server Error'
    })
  }
}

const removeLikePostNotification = async ({ parentPostId, targetId, sender, recipient }) => {
  try {
    const notif = await Notification.findOne({
      parentPostId, targetId, senders: sender, recipient, message: "Liked your post"
    })
    
    if (notif) {
      if (notif.senders.length > 0) {
        const removeAsSender = await Notification.findOneAndUpdate({
          parentPostId, targetId, senders: sender, recipient, message: "Liked your post"
        }, {
          $pull: { senders: sender }
      }, { new: true })
      }
      return removeAsSender;
    }
    
    const removedNotif = await Notification.DeleteOne({
          parentPostId, targetId, senders: sender, recipient, message: "Liked your post"
        })
        return removedNotif;
    
  } catch (e) {
    console.log(e)
    throw new Error("Error disliking on the post")

  }
}

const notifyCommentOnPost = async ({ targetId, sender, recipient, parentPostId, targetType = "comment" }) => {
  if (recipient === sender) {
    return null;
  }

  try {
    const newNotification = new Notification({ targetId, senders: [sender], recipient, parentPostId, targetType, message: "Commented on your post" });
    const doc = await newNotification.save();
    return doc;
  } catch (e) {
    console.log(e)
    throw new Error("Error commenting on the post")
  }
}

const notifyLikeComment = async ({ targetId, targetType = "comment", sender, recipient, parentPostId, parentComment, replyId }) => {

  if (recipient === sender) {
    return;
  }
  const message = parentComment ? "Liked your reply" : "Liked your comment"

  const notif = await Notification.findOne({ recipient, targetId, parentPostId, message});
  if (notif) {
    notif.senders.push(sender);
    const notification = await notif.save();
    return notification
  }
  
  
  const reply = parentComment ? replyId : null;

  try {
    const newNotification = new Notification({ targetId, recipient, senders: [sender], targetType, parentPostId, replyId: reply, message })

    const notified = await newNotification.save();
    return notified;
  } catch (e) {
    throw new Error(e);
  }
}

const removeLikerNotif = async ({ sender, targetId }) => {
  try {
    const notif = await Notification.findOne({ senders: sender, targetId });
    if (notif.senders.length > 1) {
      const removedSender = await Notification.findOneAndUpdate({ senders: sender, targetId }, { $pull: { senders: sender } }, { new: true })
      return removedSender;
    }

    const removedNotif = await Notification.deleteOne({ senders: sender, targetId });
    return removedNotif;

  } catch (e) {
    console.log(e)
    throw new Error(e);
  }
}

const notifyReply = async ({ recipient, targetId, sender, parentPostId, replyId }) => {
  if(recipient === sender){
    return;
  }
  try {
    const newNotif = new Notification({ recipient, targetId, senders: [sender], parentPostId, message: "Replied to your comment", targetType: "reply", replyId });
    const response = await newNotif.save();
    console.log(response);
    return response;
  } catch (e) {
    console.log(e)
    throw new Error(e)
  }
}

module.exports = { notifyLikePost, getNotificationsOfUser, removeLikePostNotification, notifyLikeComment, notifyCommentOnPost, removeLikerNotif, notifyReply };