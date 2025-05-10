const { sendEmail } = require('../email/sendEmail.js')
const User = require('../models/userModel.js');
const Comment = require('../models/commentModel.js');
const Notification = require("../models/notificationModel.js");
const Post = require('../models/postModel.js');
const redis = require('../redisCli/redis.js')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**(async function de(){
  try{
    const deleted = await Promise.all([
      Notification.deleteMany(),
      Comment.deleteMany(), 
      Post.deleteMany(),
      User.deleteMany()
      ])
      console.log(deleted)
  }catch(e){
    console.log(e)
  }
})()**/


exports.sendEmailVerification = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();


  const username = req.body.username.trim();

  const code = Math.floor(100000 + Math.random() * 999999);

  const subject = 'Email Verification';
  const html = `
 <div class = "text-align: center">
 <p>Thank you for registering on Sojourn Trails! Please use the following code to verify your account:</p> 
<h1> <strong>${code}</strong></h1>
 <footer>
 You're receiving this email from Sojourn Trails. If you did not request this code, please disregard this email. Your code will expire in 5 Minutes.
 </footer>
 <p>Best regards,
The Sojourn Trails' Developer
</p>
 </div>
 `
  try {


    const [emailResponse, redisResponse, userWithThisEmail, userWithThisUsername] = await Promise.all([
      sendEmail({ to: email, subject, html }),
      redis.set(`otp:${email}`, code, { EX: 300 }),
      User.findOne({ email }).select("-password").lean(),
      One({ username }).select("-password").lean()
    ])

    if (userWithThisUsername !== null) {
      return res.status(409).json({
        success: false,
        message: 'This username is already used',
        conflict: 'USERNAME'
      })
    }

    if (userWithThisEmail !== null) {
      return res.status(409).json({
        success: false,
        message: 'This email is already used',
        conflict: 'EMAIL'

      })
    }



    return res.status(200).json({
      success: true,
      message: `The code was sent on ${email} Check your inbox to verify`,
      emailResponse,
      redisResponse
    })

  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: e.message
    })
  }
}

exports.register = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const userAcc = new User({ username, password, email });
    const response = await userAcc.save();
    return res.status(200).json({
      success: true,
      message: 'Verified Successfully!',
      response
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      success: false,
      message: e.message,
    })
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(404).json({
      success: false,
      message: 'Please fill up all the required fields'
    })
  }
  try {
    const user = await User.findOne({
      username: username.toLowerCase().trim()
    }).select('-__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Incorrect username or password'
      })
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect username or password'
      })
    }
    const prevIdToken = req.cookies?.idToken;

    res.clearCookie('idToken', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      secure: process.env.NODE_ENV === 'production',
    })
    const userToken = await jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '30d' })

    const idToken = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    })
    const thirtyDays = (((60 * 60) * 24) * 30)
    //cache userdata
    //store sessionToken
    res.cookie('idToken', idToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: thirtyDays * 1000
    })
    return res.status(200).json({
      success: true,
      message: 'Successfully logged in',
      authenticated: true,
      user
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      authenticated: false,
      message: e.message || 'Internal Server Error'
    })
  }
}

exports.checkSession = async (req, res) => {
  try {
    const idToken = req.cookies?.idToken;
    if (!idToken) {
      return res.status(404).json({
        success: true,
        message: 'No session found',
        authenticated: false
      })
    }
    //id of the user in curr session
    const { _id } = await jwt.verify(idToken, process.env.JWT_SECRET);
    //cached user data of the curr session 
    const userInfo = await User.findById(_id).select("-password").lean()

    return res.status(200).json({
      success: true,
      authenticated: true,
      userInfo
    })

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.response.data.message || 'Internal Server Error'
    })
  }
}

exports.logout = async (req, res) => {
  const { _id } = req.body;
  if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      success: false,
      message: 'Error processing your request.',
      loggedOut: false
    })
  }

  try {

    const cookieRes = res.clearCookie('idToken', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      loggedOut: true
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error',
      loggedOut: false
    })
  }
}

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const userInfo = await User.findById(id).select("-password -__v").lean();
    return res.status(200).json({
      success: true,
      userInfo
    })


  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || 'Internal Server Error'
    })
  }
}