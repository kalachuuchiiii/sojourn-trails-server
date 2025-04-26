const { Post } = require("../models/postModel.js"); 
const { uploadFiles } = require('./cloudinary.js');

const uploadPost = async(req, res) => {
  const { files, postDesc, postOf } = req.body?.format;
  
  
  try{
    const fileUrls = await uploadFiles(files); 
    
    const newPost = new Post({
      postOf,
      fileUrls, 
      postDesc
    })
    await newPost.save(); 
    return res.status(200).json({
      success: true, 
      message: 'Uploaded successfully'
    })
    
  }catch(e){
    console.log('post', e)
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
    const allPosts = await Post.find({}).skip(page * limit).limit(limit).lean();
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



module.exports = {uploadPost, getAllPosts};
