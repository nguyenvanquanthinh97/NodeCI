const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrid = Keygrip([ keys.cookieKey ]);

module.exports = (user) => {
	const sessionObject = {
		passport: {
			user: String(user._id)
		}
	};

	const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

	const sign = keygrid.sign('session=' + session);

	return { session, sign };
};
