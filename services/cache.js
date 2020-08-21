const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');
const keys = require('../config/keys');

const exec = mongoose.Query.prototype.exec;
const client = redis.createClient(keys.redisUrl, { password: process.env.REDIS_PASSWORD });
client.hget = promisify(client.hget);

mongoose.Query.prototype.cache = function(options = {}) {
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || '');
	return this;
};

mongoose.Query.prototype.exec = async function() {
	if (!this.useCache) {
		// console.log('DO NOT USE CACHE');
		return exec.apply(this, arguments);
	}

	// console.log('USE CACHE');
	const key = JSON.stringify(Object.assign({}, this.getFilter(), { collection: this.mongooseCollection.name }));

	// See if we have a value for 'key' in redis
	const cacheValue = await client.hget(this.hashKey, key);

	// If we do, return that
	if (cacheValue) {
		// console.log('Serve from redis', this.mongooseCollection.name);
		const value = JSON.parse(cacheValue);

		// Check to see if value get from redis is Array or not
		// If yes return an array of Model instances
		if (Array.isArray(value)) {
			return value.map((doc) => new this.model(doc));
		}

		// If no return an instance of Model
		const doc = new this.model(value);
		return doc;
	}

	// console.log('Serve from mongodb', this.mongooseCollection.name);
	// Otherwise, issue the query and store the results in redis
	const result = await exec.apply(this, arguments);

	client.hset(this.hashKey, key, JSON.stringify(result));

	client.expire(this.hashKey, 10);

	return result;
};

const clearCache = function(hashKey) {
	client.del(JSON.stringify(hashKey || ''));
};

module.exports = {
	clearCache
};
