const mongoose = require('mongoose'); 

const commentSchema = new mongoose.Schema({
  toPost: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'post',
    required: true
  }, 
  text: {
    message: {
      type: String, 
      required: true
    },
    mention: {
      type: String, 
      default: null
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user',
      default: null
    }
  }, 
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comment',
    default: null
  },
  hasReplies: {
    type: Boolean, 
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}, {
  timestamps: true
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment