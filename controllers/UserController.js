const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bycrypt = require('bcrypt');
const axios = require('axios');
const cheerio = require('cheerio');
const News = require('../models/News');

const authMiddleware = (req, res, next) => {

    const token = req.header('authorization');

    if (!token) {
        return res.status(401).json({ msg: 'Authorization denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};


const SignUp = async (req, res) => {
    try {
        const { name, email, password, } = req.body;

        const salt = await bycrypt.genSalt();
        const passwordHash = await bycrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: passwordHash,
        });

        const user = await newUser.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const LoginIn = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bycrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.ACCESS_KEY);
        delete user.password;
        res.status(200).json({ token });

    } catch (error) {

        res.status(500).json({ error: error.message });

    }
}


const syncData = async (req, res) => {

    try {

        for (let page = 1; page <= 3; page++) {
            const url = `https://news.ycombinator.com/?p=${page}`;
            const response = await axios.get(url);
            const html = response.data;

            const $ = cheerio.load(html);
            const promises = [];

            $('.athing').each(async (index, element) => {
                const $element = $(element);

                const rank = $element.find('.rank').text().trim();
                const title = $element.find('.title a').text().trim();
                const newsUrl = $element.find('.title a').attr('href');
                const site = $element.find('.sitestr').text().trim();

                const score = $element.next().find('.score').text().trim();
                const user = $element.next().find('.hnuser').text().trim();
                const age = $element.next().find('.age a').text().trim();
                const commentsText = $element.next().find('a:contains("comments")').text().trim().split(' ')[0];
                const comments = parseInt(commentsText, 10);

                const existingNews = await News.findOne({ url: newsUrl });

                if (existingNews) {
                    existingNews.score = score;
                    existingNews.comments = comments;
                    await existingNews.save();
                } else {
                    const news = new News({
                        rank,
                        title,
                        url: newsUrl,
                        site,
                        score,
                        user,
                        age,
                        comments,
                    });

                    promises.push(news.save());
                }
            });

            await Promise.all(promises);
        }

        res.send('Data Scraped and Updated Successfully');

    } catch (error) {
        res.send(error)
    }
}

const getAllNews = async (req, res) => {
    try {
        const news = await News.find().sort({ rank: 1 });
        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const markRead = async (req, res) => {
    const id = req.user.id;
    const newsId = req.params.id;

    try {

        const user = await User.findById(id);
        user.read_news.push(newsId);
        await user.save();
        res.status(200).json({ msg: 'News marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const markDelete = async (req, res) => { 
    const id = req.user.id;
    const newsId = req.params.id;

    try {
        const user = await User.findById(id);
        user.deleted_news.push(newsId);
        await user.save();
        res.status(200).json({ msg: 'News marked as deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const profile = async (req, res) => {
    const id = req.user.id;
    try {
        const user = await User.findById(id).select('-password');
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getUsersNews = async (req, res) => {

    try {
        const user = await User.findById(req.user.id);
        const news = await News.find({ _id: { $nin: user.deleted_news } }).sort({ rank: 1 });
        res.status(200).json(news);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    SignUp,
    LoginIn,
    authMiddleware,
    syncData,
    getAllNews,
    markRead,
    markDelete,
    profile,
    getUsersNews
}