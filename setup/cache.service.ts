/* eslint-disable prefer-rest-params */
import debug from "debug";
import RedisService from "./db/redis.services";
import { promisify } from "util";

const redisClient = RedisService.getRedis();
const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisSetAsync = promisify(redisClient.set).bind(redisClient);
const redisMgetAsync = promisify(redisClient.mget).bind(redisClient);

const log: debug.IDebugger = debug("app:cache-service");

// keep redis connection alive
setInterval(function () {
	redisClient.set("ping", "pong");
}, 1000 * 10); // every 10 min

class CacheService {
	async clearCache(hashKey: string[]) {
		await hashKey.map((hash) => {
			redisClient.del(hash);

			log(`You cleared cache Value:: ${hash}`);
		});

		return true;
	}

	async setCache(key: string, value: any, time?: number | undefined) {
		if (time) {
			redisClient.set(key, value, "EX", time);
		} else {
			redisClient.set(key, value);
		}
		log(`You SET cache Value ${{ key, value }}`);
	}

	async setCacheAsync(key: string, value: any, time?: number | undefined) {
		if (time) {
			await redisSetAsync(key, value, "EX", time)
		} else {
			await redisSetAsync(key, value)
		}
		log(`You SET cache Value ${{ key, value }}`);
	}

	async getCacheAsync(key: string) {
		const val = await redisGetAsync(key);

		log(`You GET cache Value::`, val);
		return val;
	}

	async flushCache() {
		redisClient.flushall(() => {
			log("flushed cache");
		});
	}

	async promiseRetrieveMultipleCacheAsync(keys: string[]) {
		const items = await Promise.all(keys.map(async (key) => ({
      key,
      value: await redisGetAsync(key),
    })));

		log(`You GET Multiple Cache Promise.all Value ${{ items }}`);

		return items
	}

	async mgetRetrieveMultipleCacheAsync(keys: string[]) {
		const items = await redisMgetAsync(keys);

    // Combine keys and values into an array of objects
    const result = keys.map((key, index) => ({ key, value: items[index] }));
		log(`You GET mget Multiple Cache Value::`, result);

		return result
	}
}
export default new CacheService();
