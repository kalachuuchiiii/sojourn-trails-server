const Post  = require("../models/postModel.js");
const Notification = require("../models/notificationModel.js");
const Comment = require("../models/commentModel.js")
const { uploadFiles } = require('./cloudinary.js');
const { notifyLikePost, removeLikerNotif } = require('../controller/notificationController.js')

const mongoose = require('mongoose');

const uploadPost = async(req, res) => {
  const { files, postDesc, postOf, rate} = req.body?.format;
  
  
  try{
    const fileUrls = await uploadFiles(files); 
    
    const newPost = new Post({
      postOf,
      fileUrls, 
      postDesc,
      rate
    })
    await newPost.save(); 
    return res.status(201).json({
      success: true, 
      message: 'Uploaded successfully'
    })
    
  }catch(e){
    
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
    
  }
}

const getAllPosts = async(req, res) => {
  const { page } = req.params; 
  const limit = 20;  
  
  try{
    const [allPosts, totalPosts] = await Promise.all([ Post.find({}).sort({createdAt:-1}).skip(page * limit).limit(limit).lean(), Post.find({}).countDocuments() ]) 
    return res.status(200).json({
      success: true, 
      totalPosts,
      allPosts
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}


const likePost = async(req, res) => {
  const { postId } = req.params; 
  const { likerId, recipient } = req.body; 
  
  if(!postId){
    return res.status(404).json({
      success: false, 
      message: 'Post not found'
    })
  }
  try{
   const likeAndNotify = await Promise.all([
      Post.findByIdAndUpdate(postId, {
      $addToSet: {
        likes: likerId
      }
    }, {
      new: true
    }).lean(), recipient !== likerId &&  notifyLikePost({sender:likerId, targetId: postId, parentPostId: postId, recipient })])
    
    return res.status(200).json({
      success: true,
      likeAndNotify
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}

const dislikePost = async(req, res) => {
  const { postId } = req.params; 
  const { likerId, recipient } = req.body; 
  
  try{
    const dislikePostAndRemoveNotification = await Promise.all([Post.findByIdAndUpdate(postId, {
      $pull: {
        likes: likerId
      }
    }, {
      new: true
    }).lean(), removeLikerNotif({ sender: likerId, targetId: postId})])
    
    return res.status(200).json({
      success: true, 
       dislikePostAndRemoveNotification
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}

const getPostById = async(req, res) => {
  const { postId } = req.params; 
  if(!postId || !mongoose.Types.ObjectId.isValid(postId)){
    return res.status(404).json({
      success: false, 
      message: 'Post not found'
    })
  }
  try{
    const post = await Post.findById(postId).lean(); 
    return res.status(200).json({
      success: true,
      post
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}

const getPostsOfUser = async(req, res) => {
  const { userId, page } = req.params; 
  if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
    return res.status(404).json({
      success: false, 
      message: "User not found"
    })
  }
  try{
    const limit = 10
    const [posts, totalPosts] = await Promise.all([Post.find({postOf: userId}).sort({createdAt: -1}).skip(page * limit).limit(limit).lean(), Post.find({postOf: userId}).countDocuments().lean() ])
    return res.status(200).json({
      success: true, 
      posts,
      totalPosts
    })
  }catch(e){
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
  }
}

const deletePostById = async(req, res) => {
  const { postId } = req.params; 
  try{
    
    const [deletedPost, deletedNotif, deletedComment] = await Promise.all([ Post.findByIdAndDelete(postId), 
    Notification.deleteMany({ parentPostId: postId }), 
    Comment.deleteMany({ toPost: postId})
    ])
    
    
    return res.status(200).json({
      success: true, 
      deletedPost,
      deletedComment,
      deletedNotif
    })
    
    }catch(e){
    return res.status(500).json({
    success: true, 
    message: e.message || 'Internal Server Error'
    })
    }
}




module.exports = {uploadPost, getAllPosts, likePost, dislikePost, getPostById, getPostsOfUser, deletePostById};
