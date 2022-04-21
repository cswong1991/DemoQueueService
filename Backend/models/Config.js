const Sequelize = require('sequelize');
const sequelizeClient = require('../services/sequelizeClient');

const Model = Sequelize.Model;
class Config extends Model { }
Config.init({
    // attributes
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    sequelize: sequelizeClient,
    modelName: 'config'
    // options
});
Config.sync();

module.exports = Config;