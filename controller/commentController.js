const mongoose = require('mongoose'); 
const { Comment } = require('../models/commentModel.js');
const { Post } = require('../models/postModel.js');

const postComment = async(req, res) => {
  const { toPost, text, author, isCommentToReplyHasReplies, replyTo, isPostToCommentHasComments } = req.body; 


  try{
    const newComment = new Comment({toPost, text, author, replyTo}); 
    
    const [postCom, updComToRepHasReplies, updPostHasComments] = await Promise.all([
      newComment.save(), (replyTo && !isCommentToReplyHasReplies) && Comment.findByIdAndUpdate(replyTo, {
        hasReplies: true
      }), (toPost && !isPostToCommentHasComments) && Post.findByIdAndUpdate(toPost, {
        hasComments: true
      })
      ])
  
    return res.status(200).json({
      success: true
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}

const getCommentsOfPost = async(req, res) => {
  const {postId, page} = req.params;  
  const limit = 20;
  try{
    const comments = await Comment.find({toPost: postId}).skip(page * limit).limit(limit)
    return res.status(200).json({
      success: true, 
      comments
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}

// (async function rem(){
//   try{
//    const h =  await Comment.deleteMany({});
//    console.log(h)
//   }catch(e){
//     console.log(e)
//   }
// })()

module.exports = { postComment, getCommentsOfPost }