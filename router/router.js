const router = require('express').Router(); 
const User = require('../models/userModel.js');
const { sendEmailVerification, register,
login, checkSession, logout, getUserById } = require('../controller/userController.js'); 
const { uploadPost, getAllPosts, likePost, dislikePost, getPostById, getPostsOfUser } = require("../controller/postController.js");
const { getNotificationsOfUser } = require("../controller/notificationController.js");
const { postComment, getRepliesOfComment, postReply, getCommentsOfPost, likeComment, dislikeComment, getCommentsOfAuthor, getOneCommentById } = require('../controller/commentController.js');
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
router.get('/get-posts-of-user/:userId/:page', getPostsOfUser);

router.post('/post-comment', postComment);
router.get('/get-one-comment-by-id/:commentId', getOneCommentById);
router.post('/post-reply', postReply);
router.get('/get-comments-of-post/exclude-from=:authorId/post=:postId/page=:page/comment=:commentId/reply=:replyId/', getCommentsOfPost);
router.get('/get-replies-of-comment/:commentId', getRepliesOfComment);
router.get('/get-comments-of-author/author=:authorId/post=:postId', getCommentsOfAuthor);
router.post('/like-comment', likeComment);
router.post('/dislike-comment', dislikeComment);


router.get('/get-notifications-of-user/:userId/:page', getNotificationsOfUser);
module.exports = { router };