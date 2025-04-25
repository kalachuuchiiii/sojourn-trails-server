const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function uploadFiles(files) {

const urls = files.map(({file, type}) => {
  
  return new Promise(async(resolve, reject) => {
    
    try{
      const res = await cloudinary.uploader.upload(file, { resource_type: type, folder: type });
      
      const vidTransform = [{
        fetch_format: 'auto', quality: 'auto', video_codec: 'auto'
      }]
      const imageTransform = [{
        fetch_format: 'auto', quality: 'auto', flags: 'strip_profile'
      }]
      const url = await cloudinary.url(res.public_id, {
         resource_type: type,
        transformation: type === 'image' ? imageTransform : vidTransform
      })
      resolve(url);
    }catch(e){
      console.log(e); 
      reject(e);
    }
    
    
  })
})

return Promise.all(urls).then((files) => {
  return files;
})
}

module.exports = { uploadFiles };