const crypto = require("crypto");
var redisClient = require("./redisClient");

class queueService {
    constructor() {
        this.serviceStatus = true;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new queueService();
        }
        return this.instance;
    }

    importConfigs(activeConfigs) {
        this.activeConfigs = activeConfigs;
        this.startDigestScheduler();
        this.startClearScheduler();
    }

    startDigestScheduler() {
        if (this.digestScheduler) {
            clearInterval(this.digestScheduler);
        }
        if (this.activeConfigs['digestItems'] > 0 && this.activeConfigs['digestInterval'] > 0) {
            this.digestScheduler = setInterval(() => this.digestQueueItems(), this.activeConfigs['digestInterval'] * 1000);
        }
    }

    async digestQueueItems(digestItems = null) {
        let activeConfigs = this.activeConfigs;
        await redisClient
            .multi()
            .lrange('queue', 0, digestItems ? digestItems - 1 : activeConfigs['digestItems'] - 1)
            .ltrim('queue', digestItems ? digestItems - 1 : activeConfigs['digestItems'], -1)
            .exec(function (err, replies) {
                replies[0].forEach(e1 => {
                    redisClient
                        .multi()
                        .hset(e1, 'status', 'finishQueue')
                        .hsetnx(e1, 'vcode', crypto.randomBytes(16).toString('hex'))
                        .expire(e1, activeConfigs['timeoutFinishQueue'])
                        .exec();
                })
            });
    }

    startClearScheduler() {
        if (this.clearScheduler) {
            clearInterval(this.clearScheduler);
        }
        if (this.activeConfigs['autoClearInterval'] > 0) {
            this.clearScheduler = setInterval(() => this.clearExpiredItems(), this.activeConfigs['autoClearInterval'] * 1000);
        }
    }

    async clearExpiredItems() {
        await redisClient
            .multi()
            .keys('*')
            .lrange('queue', 0, -1)
            .exec(function (err, replies) {
                let activeItems = replies[0].filter(e1 => ['queue', 'statistics'].includes(e1) === false);
                let expiredItems = replies[1].filter(e1 => activeItems.includes(e1) === false);
                expiredItems.forEach(e1 => redisClient.lrem('queue', 0, e1));
            });
    }
}

module.exports = queueService.getInstance();