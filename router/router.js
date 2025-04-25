const router = require('express').Router(); 
const User = require('../models/userModel.js');
const { sendEmailVerification, register,
login, checkSession, logout } = require('../controller/userController.js'); 
const { uploadPost } = require("../controller/postController.js");
const { compareEmailVerificationCode } = require('../middlewares/userMiddlewares.js');

router.post('/send-otp', sendEmailVerification);
router.post('/verify-otp', compareEmailVerificationCode, register);
router.post('/login', login);
router.post('/session', checkSession);
router.post('/logout', logout);

router.post('/upload-post', uploadPost);

module.exports = { router };