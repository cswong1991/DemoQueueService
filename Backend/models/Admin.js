const Sequelize = require('sequelize');
const sequelizeClient = require('../services/sequelizeClient');

const Model = Sequelize.Model;
class Admin extends Model { }
Admin.init({
    // attributes
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [4, 20]
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    access_token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    }
}, {
    sequelize: sequelizeClient,
    modelName: 'admin'
    // options
});
Admin.sync();

module.exports = Admin;