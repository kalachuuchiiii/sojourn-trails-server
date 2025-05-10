const mongoose = require('mongoose'); 

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId, 
        ref: 'user',
        required: true
  },
  senders: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    required: true
  }],
  parentPostId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'post',
    required: true
  }, 
  targetType: {
    type: String,
    enum: ['post','comment','reply'],
    required: true
  },
  message: {
    type: String,
    enum: ['Liked your post','Liked your comment','Commented on your post', 'Replied to your comment', 'Liked your reply'],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  replyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comment',
    default: null
  },
  read: {
    type: Boolean, 
    default: false
  }, 
  
}, {timestamps:true})

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;