const Sequelize = require('sequelize');

class sequelizeClient {
    constructor() {
        this.sequelize = new Sequelize({
            host: 'localhost',
            dialect: 'sqlite',
            storage: './database.sqlite',
        });
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new sequelizeClient();
        }
        return this.instance;
    }
}

module.exports = sequelizeClient.getInstance().sequelize;