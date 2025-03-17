// frontend/src/redis/redisStore.ts
import session from 'express-session';
import redisClient from './client.redis';
import { logger } from '../utils';

export class RedisStore extends session.Store {
	constructor() {
		super();
	}

	async get(sid: string, callback: (err: any, session?: session.SessionData | null) => void) {
		try {
			const data = await redisClient.get(`sess:${sid}`);
			if (!data) {
				return callback(null, null);
			}
			return callback(null, JSON.parse(data));
		} catch (err) {
			logger.error('Failed to get session:', err);
			return callback(err);
		}
	}

	async set(sid: string, session: session.SessionData, callback: (err?: any) => void) {
		try {
			await redisClient.set(`sess:${sid}`, JSON.stringify(session), {
				EX: 24 * 60 * 60, // 1 day in seconds
			});
			return callback(null);
		} catch (err) {
			logger.error('Failed to set session:', err);
			return callback(err);
		}
	}

	async destroy(sid: string, callback: (err?: any) => void) {
		try {
			await redisClient.del(`sess:${sid}`);
			return callback(null);
		} catch (err) {
			logger.error('Failed to destroy session:', err);
			return callback(err);
		}
	}
}

export default RedisStore;