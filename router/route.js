const express = require('express');
const router = express.Router();

const { 
    SignUp, 
    LoginIn,
    authMiddleware,
    syncData,
    getAllNews,
    markRead,
    markDelete,
    profile,
    getUsersNews,
} = require('../controllers/UserController');


// User Routes
router.post('/signup', SignUp);
router.post('/login', LoginIn);
router.get('/profile', authMiddleware, profile);
router.get('/profile/news', authMiddleware, getUsersNews);

router.get('/sync',syncData)
router.get('/news', authMiddleware, getAllNews)
router.post('/news/read/:id',authMiddleware , markRead)
router.post('/news/delete/:id', authMiddleware, markDelete)

module.exports = router;