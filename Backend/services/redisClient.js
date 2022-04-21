var redis = require('redis');

class redisClient {
    constructor() {
        this.client = redis.createClient({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        });
        this.client.on("error", function (error) {
            console.error(error);
        });
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new redisClient();
        }
        return this.instance;
    }
}

module.exports = redisClient.getInstance().client;