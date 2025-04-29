const router = require('express').Router(); 
const User = require('../models/userModel.js');
const { sendEmailVerification, register,
login, checkSession, logout, getUserById } = require('../controller/userController.js'); 
const { uploadPost, getAllPosts, likePost, dislikePost, getPostById } = require("../controller/postController.js");
const { postComment, getRepliesOfComment, postReply, getCommentsOfPost, likeComment, dislikeComment } = require('../controller/commentController.js');
const { compareEmailVerificationCode } = require('../middlewares/userMiddlewares.js');

router.post('/send-otp', sendEmailVerification);
router.post('/verify-otp', compareEmailVerificationCode, register);
router.post('/login', login);
router.post('/session', checkSession);
router.post('/logout', logout);
router.get('/get-user-by-id/:id', getUserById);

router.post('/upload-post', uploadPost);
router.get('/get-posts/:page', getAllPosts);
router.post('/like/:postId', likePost);
router.post('/dislike/:postId', dislikePost);
router.get('/get-post/:postId', getPostById);

router.post('/post-comment', postComment);
router.post('/post-reply', postReply);
router.get('/get-comments-of-post/:postId/:page', getCommentsOfPost);
router.get('/get-replies-of-comment/:commentId', getRepliesOfComment);
router.post('/like-comment', likeComment);
router.post('/dislike-comment', dislikeComment);
module.exports = { router };