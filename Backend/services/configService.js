const defaultConfigs = require("../constants/defaultConfigs");
const Config = require("../models/Config");
const queueService = require('./queueService');

class configService {
    constructor() {
        this.activeConfigs = {};
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new configService();
            this.instance.initService();
        }
        return this.instance;
    }

    async initService() {
        let configs = await Config.findAll();
        if (configs.length > 0) {
            configs.forEach(e1 => {
                this.activeConfigs[e1['key']] = isNaN(parseInt(e1['value'])) ? e1['value'] : parseInt(e1['value']);
            });
        } else {
            this.activeConfigs = defaultConfigs;
            Config.bulkCreate(
                // array in form of [{key: string, value: string}]...
                Object.keys(defaultConfigs).map(e1 => {
                    return { key: e1, value: defaultConfigs[e1] };
                })
            );
        }
        queueService.importConfigs(this.activeConfigs);
    }

    async updateConfigs(newConfigs) {
        let newCKeys = Object.keys(newConfigs);
        let savedConfigs = await Config.findAll();

        savedConfigs.forEach(config => {
            let key = config['key'];
            let newVal = newConfigs[key];
            if (newCKeys.includes(key) && config.value != newVal) {
                this.activeConfigs[key] = newVal;
                config.update({ value: newVal });
            }
        });
        queueService.importConfigs(this.activeConfigs);
    }
}

module.exports = configService.getInstance();