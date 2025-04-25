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
    return res.status(500).json({
    success: false, 
    message: e.message || 'Internal Server Error'
    });
    
  }
}

module.exports = {uploadPost};
