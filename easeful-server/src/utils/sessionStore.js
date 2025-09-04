// src/utils/sessionStore.js
const crypto = require('crypto');

function makeSessionStore(collection) {
	return {
		async create(userId, ttlMs) {
			const sid = crypto.randomBytes(32).toString('hex');
			const expiresAt = new Date(Date.now() + ttlMs);
			await collection.insertOne({ sid, userId, expiresAt });
			return sid;
		},
		async get(sid) {
			return collection.findOne({ sid, expiresAt: { $gt: new Date() } });
		},
		async destroy(sid) {
			await collection.deleteOne({ sid });
		},
	};
}

module.exports = { makeSessionStore };
