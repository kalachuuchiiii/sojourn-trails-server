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
  rate: {
    type: Number, 
    default: 1
  }
}, {
  timeStamps: true
})

const Post = mongoose.model('Post', postSchema);

module.exports = { Post };