const mongoose = require('mongoose'); 

const notificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId, 
        ref: 'user',
        required: true
  },
  message: {
    type: String, 
    enum: ['Liked your post', 'Liked your comment', 'Commented on your post', 'Replied on your comment'],
    required: true, 
  }, 
  actor: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user',
    required: true
  }, 
  parentPostId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'post',
    required: true
  }, 
  url: {
    type: String, 
    required: true
  },
  targetType: {
    type: String,
    enum: ['post','comment','reply'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  read: {
    type: Boolean, 
    default: false
  }, 
  
}, {timestamps:true})

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;