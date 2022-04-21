var queueService = require('./queueService');
var redisClient = require("./redisClient");

class statisticsService {
    constructor() {
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new statisticsService();
            this.instance.initService();
        }
        return this.instance;
    }

    initService() {
        if (this.recordDataScheduler) {
            clearInterval(this.addDataScheduler);
        }
        this.resetData();
        this.recordDataScheduler = setInterval(() => this.recordData(), process.env.RECORD_INTERVAL * 1000);
    }

    recordData() {
        redisClient.llen('queue', function (err, reply) {
            if (err) {
                return;
            }

            let now = new Date();
            redisClient
                .multi()
                .ltrim('statistics', process.env.MAX_STATISTICSITEMS * -1, -1)
                .rpush('statistics', JSON.stringify({
                    date: now.toString(),
                    serviceStatus: queueService.serviceStatus,
                    inQueueItems: reply
                }))
                .exec();
        });
    }

    resetData() {
        redisClient.del('statistics');
    }
}

module.exports = statisticsService.getInstance().client;