const mongoose = require('mongoose'); 


const postSchema = new mongoose.Schema({
  postOf: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    index: true,
    required: true
  }, 
  postDesc: {
    type: String,
    index: true, 
    required: true
  },
  viewers: {
    type: String,
    default: 'FRIENDS'
  },
  fileUrls: [
    {
      type: {
        type: String
      }, 
      file: {
        type: String
      }
    }
    ],
    hasComments: {
      type: Boolean, 
      default: false
    }, 
  likes: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user'
  }], 
  rate: {
    type: Number, 
    default: 1
  }
}, {
  timestamps: true
})

const Post = mongoose.model('Post', postSchema);

module.exports =  Post 