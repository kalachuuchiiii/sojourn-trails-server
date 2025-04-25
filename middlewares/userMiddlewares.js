const redis = require('../redisCli/redis.js');
const User = require('../models/userModel.js');


const compareEmailVerificationCode = async(req, res, next) => {
  const {code, email} = req.body; 
  
  try{
    const correctCode = await redis.get(`otp:${email}`);
    
    console.log(correctCode, code)
    if(correctCode === code){
        await redis.del('otp')
        next();
    }else {
      return res.status(400).json({
        success: false, 
        message: 'Incorrect Code'
      })
    }
  }catch(e){
    console.log(e)
    return res.status(500).json({
      success: false, 
      message: `${e.message}`
    })
  }
}

module.exports = {compareEmailVerificationCode};