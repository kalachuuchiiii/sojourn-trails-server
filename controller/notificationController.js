const Notification = require('../models/notificationModel.js'); 

const notifyLikePost = async({receiverId, message, parentPostId, targetType, targetTypeId, actor}) => {
  
  let url = '';
  
  switch(targetType){
    case "post": url = `/post/${parentPostId}`;
    break;
    case "comment": url = `/post/${parentPostId}/?highlight=comment?id=${targetTypeId}`; 
    break;
    case "reply": url = `/post/${parentPostId}/?highlight=reply?id=${targetTypeId}`;
    break;
    default: throw new Error("Error liking the post")
  }
  
  try{
    const newNotification = new Notification({receiverId, message, url, parentPostId, targetType, targetTypeId, actor});
    await newNotification.save();
  }catch(e){
    console.log(e)
    throw new Error('Error liking the post')
  }
}

module.exports = {notifyLikePost};