const mongoose = require('mongoose');
const Comment = require('../models/commentModel.js');
const Post = require('../models/postModel.js');
const { notifyCommentOnPost, removeLikerNotif, notifyLikeComment, notifyReply } = require("../controller/notificationController.js");


const postComment = async (req, res) => {
  const { toPost, text, author, replyTo, isTargetPostHasComments, recipient } = req.body;


  try {
    const newComment = new Comment({ toPost, text, author, replyTo });

    const [postCom, updPostHasComments] = await Promise.all([
      newComment.save(), (toPost && !isTargetPostHasComments) && Post.findByIdAndUpdate(toPost, {
        hasComments: true
      })
    ])
    const notifyNewComment = await notifyCommentOnPost({ recipient, sender: author, targetId: postCom._id, parentPostId: toPost })

    return res.status(200).json({
      success: true,
      postCom,
      notifyNewComment
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    });
  }
}

const postReply = async (req, res) => {
  const { replyTo, notifRecipient, text, author, toPost, isTargetCommentHasReplies } = req.body;
  if (!replyTo || !mongoose.Types.ObjectId.isValid(replyTo)) {
    return res.status(404).json({
      success: true,
      message: 'Comment not found'
    })
  }

  try {

    const newReply = new Comment({ replyTo, text, author, toPost })

    const [newRep, updatedTargetComment] = await Promise.all([
      newReply.save(),
      isTargetCommentHasReplies ? null : Comment.findByIdAndUpdate(replyTo, {
        hasReplies: true
      }, { new: true })
    ])
    const notifReplyResponse = await notifyReply({sender: author, recipient: notifRecipient, targetId: replyTo, replyId: newRep._id,  parentPostId: toPost})

    return res.status(200).json({
      success: true,
      newRep,
      updatedTargetComment,
      notifReplyResponse
    })

  } catch (e) {
    return res.status(500).json({
      success: true,
      message: e.message || 'Internal Server Error'
    })
  }
}

const getRepliesOfComment = async (req, res) => {
 const options = JSON.parse(req.query.options)
 
 const { replyTo, excludeId } = options;
 const page = 0;
  const limit = 7;
  console.log(options, replyTo, excludeId)
 
  try {
    const replies = await Comment.find(options).skip(page * limit).limit(limit).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      replies
    })

  } catch (e) {
    return res.status(500).json({
      success: true,
      message: e.message || 'Internal Server Error'
    })
  }
}

const getCommentsOfPost = async (req, res) => {
  const { postId, page } = req.params;
  const highlightedCommentId = req.params.commentId === "null" ? null : req.params.commentId 
  const authorId = req.params.authorId === "null" ? null : req.params.authorId 

  const limit = 20;
  try {
    const [comments, totalComments] = await
      Promise.all([Comment.find({ author: { $ne: authorId }, _id: { $ne: highlightedCommentId }, toPost: postId, replyTo: null }).skip(page * limit).limit(limit).sort({ createdAt: -1 }).lean(), Comment.find({ toPost: postId, replyTo: null }).countDocuments().lean()])

    return res.status(200).json({
      success: true,
      comments,
      totalComments
    })


  } catch (e) {
    console.log(e)
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    });
  }
}



const likeComment = async (req, res) => {
  const { userId, commentId, notifReceiver, parentPostId, parentComment } = req.body;
  console.log("parent",parentComment )
  const liker = userId;
  if (!liker || !mongoose.Types.ObjectId.isValid(liker)) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  try {
    const likeAndNotify = await Promise.all([Comment.findByIdAndUpdate(commentId, {
      $addToSet: {
        likes: liker
      }
    }, { new: true }),
    notifyLikeComment({sender: liker, parentComment, targetId: parentComment ? parentComment : commentId, replyId: parentComment ? commentId : null, recipient: notifReceiver, parentPostId})
    ])
    
    return res.status(200).json({
      success: true,
      liker
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    });
  }
}

const dislikeComment = async (req, res) => {
  const { userId, commentId, notifReceiver } = req.body;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }
  try {
    const dislikeAndRemoveNotification = await Promise.all([ Comment.findByIdAndUpdate(commentId, {
      $pull: {
        likes: userId
      }
    }, { new: true }), removeLikerNotif({sender: userId, targetId: commentId})])
    return res.status(200).json({
      success: true,
      disliker: userId
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    });
  }
}

const getOneCommentById = async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    return res.status(404).json({
      success: false,
      message: "Comment not found: On getOneCommentById"
    });
  }
  try {
    const comment = await Comment.findById(commentId);
    return res.status(200).json({
      success: true,
      comment
    })
  } catch (e) {
    return res.status(500).json({
      success: true,
      message: e.message || 'Internal Server Error'
    })
  }
}

const getCommentsOfAuthor = async(req, res) => {
  const { authorId, postId, highlightId } = req.params; 
  try{
    const authorComments = await Comment.find({author: authorId, replyTo:null, toPost: postId, _id: {
      $ne: highlightId === "null" ? null : highlightId
    }}); 
    return res.status(200).json({
      success: true, 
      authorComments
    })
  }catch(e){
    console.log(e) 
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}

module.exports = { postComment, postReply, getCommentsOfPost, getRepliesOfComment, likeComment, dislikeComment, getOneCommentById, getCommentsOfAuthor}