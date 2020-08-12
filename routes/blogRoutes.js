const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const { json } = require('body-parser');

const Blog = mongoose.model('Blog');

module.exports = (app) => {
	app.get('/api/blogs/:id', requireLogin, async (req, res) => {
		const blog = await Blog.findOne({
			_user: req.user.id,
			_id: req.params.id
		});

		res.send(blog);
	});

	app.get('/api/blogs', requireLogin, async (req, res) => {
		const redis = require('redis');
		const redisUrl = 'redis://127.0.0.1:6379';
		const client = redis.createClient(redisUrl, { password: process.env.REDIS_PASSWORD });
		const { promisify } = require('util');
		// Wrap client.get function to return a Promise instead of running callback
		client.get = promisify(client.get);

		// Do we have any cached data in redis related to this query
		const cachedBlogs = await client.get(req.user.id);

		// If yes, we will immediately respond to the request immediately and return
		if (cachedBlogs) {
			console.log('CACHED REDIS SERVER SERVE');
			return res.send(JSON.parse(cachedBlogs));
		}

		// If no, we will query data from mongodb and add query results to redis
		console.log('MONGODB SERVER SERVE');
		const blogs = await Blog.find({ _user: req.user.id });
		res.send(blogs);
		client.set(req.user.id, JSON.stringify(blogs));
	});

	app.post('/api/blogs', requireLogin, async (req, res) => {
		const { title, content } = req.body;

		const blog = new Blog({
			title,
			content,
			_user: req.user.id
		});

		try {
			await blog.save();
			res.send(blog);
		} catch (err) {
			res.send(400, err);
		}
	});
};
