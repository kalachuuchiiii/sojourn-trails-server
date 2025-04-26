const mongoose = require('mongoose'); 


const postSchema = new mongoose.Schema({
  postOf: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true
  }, 
  postDesc: {
    type: String, 
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
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user'
  }]
}, {
  timeStamps: true
})

const Post = mongoose.model('Post', postSchema);

module.exports = { Post };