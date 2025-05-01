const mongoose = require('mongoose'); 
const { Comment } = require('../models/commentModel.js');
const { Post } = require('../models/postModel.js');

const postComment = async(req, res) => {
  const { toPost, text, author, replyTo, isTargetPostHasComments } = req.body; 


  try{
    const newComment = new Comment({toPost, text, author, replyTo}); 
    
    const [postCom, updPostHasComments] = await Promise.all([
      newComment.save(), (toPost && !isTargetPostHasComments) && Post.findByIdAndUpdate(toPost, {
        hasComments: true
      })
      ])
  
    return res.status(200).json({
      success: true,
      postCom
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}

const postReply = async(req, res) => {
  const { replyTo, text, author, toPost, isTargetCommentHasReplies } = req.body; 
  if(!replyTo || !mongoose.Types.ObjectId.isValid(replyTo)){
    return res.status(404).json({
      success: true, 
      message: 'Comment not found'
    })
  }
  
  try{
    
    const newReply = new Comment({replyTo, text, author, toPost})
    
    const [newRep, updatedTargetComment] = await Promise.all([
      newReply.save(), 
      isTargetCommentHasReplies ? null : Comment.findByIdAndUpdate(replyTo, {
        hasReplies: true
      }, {new: true})
      ])
      
      return res.status(200).json({
        success: true, 
        newRep,
        updatedTargetComment
      })
    
    }catch(e){
    return res.status(500).json({
    success: true, 
    message: e.message || 'Internal Server Error'
    })
    }
}

const getRepliesOfComment = async(req, res) => {
  const { commentId } = req.params; 
  const { toPost, page } = req.query;
  const limit = 7;
  if(!toPost || !commentId || !mongoose.Types.ObjectId.isValid(commentId)){
    return res.status(404).json({
      success: false, 
      message: 'Comment not found'
    })
  }
  try{
    const replies = await Comment.find({ toPost, replyTo: commentId }).skip(page * limit).limit(limit).sort({createdAt: -1}).lean();
    return res.status(200).json({
      success: true, 
      replies
    })
    
    }catch(e){
    return res.status(500).json({
    success: true, 
    message: e.message || 'Internal Server Error'
    })
    }
}

const getCommentsOfPost = async(req, res) => {
  const {postId, page} = req.params;  
  const limit = 20;
  try{
    const [comments, totalComments] = await Promise.all([ Comment.find({toPost: postId, replyTo: null}).skip(page * limit).limit(limit).sort({createdAt:-1}).lean(), Comment.find({toPost: postId, replyTo: null}).countDocuments().lean()])
    return res.status(200).json({
      success: true, 
      comments,
      totalComments
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}



const likeComment = async(req, res) => {
  const { userId, commentId } = req.body; 
  if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
    return res.status(404).json({
      success: false, 
      message: 'User not found'
    })
  }
  try{
   const likedComment = await Comment.findByIdAndUpdate(commentId, {
      $addToSet: {
        likes: userId
      }
    }, {new: true})
    return res.status(200).json({
      success: true, 
      likedComment
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}

const dislikeComment = async(req, res) => {
  const { userId, commentId } = req.body; 
  if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
    return res.status(404).json({
      success: false, 
      message: 'User not found'
    })
  }
  try{
   const dislikedComment = await Comment.findByIdAndUpdate(commentId, {
      $pull: {
        likes: userId
      }
    }, {new: true})
    return res.status(200).json({
      success: true, 
      dislikedComment
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}




module.exports = { postComment, postReply, getCommentsOfPost, getRepliesOfComment, likeComment, dislikeComment }