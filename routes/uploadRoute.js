const AWS = require('aws-sdk');
const uuid = require('uuid').v4;

const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const S3 = new AWS.S3({
	accessKeyId: keys.accessKeyId,
	secretAccessKey: keys.secretAccessKey
});

module.exports = (app) => {
	app.get('/api/upload', requireLogin, (req, res) => {
		const filetype = req.query.filetype;
		const fileExt = filetype.split('/')[1];
		// to make each file upload in each user foler in S3 bucket
		const filename = `${req.user.id}/${uuid()}.${fileExt}`;

		S3.getSignedUrl(
			'putObject',
			{
				Bucket: 's3-my-blog-bucket-220597',
				Key: filename,
				ContentType: filetype
			},
			(error, url) => {
				if (error) {
					console.error(error);
					return res.sendStatus(500);
				}
				res.send({ filename, url });
			}
		);
	});
};
