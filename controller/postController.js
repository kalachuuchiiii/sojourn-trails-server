const { Post } = require("../models/postModel.js"); 
const { uploadFiles } = require('./cloudinary.js');
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
    const allPosts = await Post.find({}).sort({createdAt:-1}).skip(page * limit).limit(limit).lean();
    return res.status(200).json({
      success: true, 
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
  const { likerId } = req.body; 
  
  if(!postId){
    return res.status(404).json({
      success: false, 
      message: 'Post not found'
    })
  }
  try{
    const likePostRes = await Post.findByIdAndUpdate(postId, {
      $addToSet: {
        likes: likerId
      }
    }, {
      new: true
    }).lean();
    return res.status(200).json({
      success: true, 
      likePostRes
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
  const { likerId } = req.body; 
  
  try{
    const dislikePostRes = await Post.findByIdAndUpdate(postId, {
      $pull: {
        likes: likerId
      }
    }, {
      new: true
    }).lean()
    return res.status(200).json({
      success: true, 
       dislikePostRes
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

module.exports = {uploadPost, getAllPosts, likePost, dislikePost, getPostById};
