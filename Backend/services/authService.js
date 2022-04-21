
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Admin = require("../models/Admin");

class authService {
    constructor() { }

    static getInstance() {
        if (!this.instance) {
            this.instance = new authService();
            this.instance.initService();
        }
        return this.instance;
    }

    async initService() {
        let admin = await Admin.findOne({ where: { id: 1 } });
        if (!admin) {
            Admin.create({
                id: 1,
                username: process.env.APP_ADMIN,
                password: bcrypt.hashSync(process.env.APP_PASSWORD, 10),
                access_token: crypto.randomBytes(64).toString('hex'),
            });
        }
    }

    async authByUsernamePassword(username, password, requestAccessToken = false, renewAccessToken = false) {
        let admin = await Admin.findOne({ where: { username: username } });
        if (admin && bcrypt.compareSync(password, admin.password)) {
            if (requestAccessToken) {
                return renewAccessToken ? this.generateAccessToken(admin) : admin;
            } else {
                return true;
            }
        }
        return false;
    }

    async generateAccessToken(admin) {
        return await admin.update({ access_token: crypto.randomBytes(64).toString('hex') });
    }

    getAccessTokenFromHeader(req, headerName = 'authorization', prefix = 'Bearer') {
        if (req.headers[headerName] && req.headers[headerName].split(' ')[0] === prefix) {
            return req.headers[headerName].split(' ')[1];
        } else {
            return false;
        }
    }

    async authByAccessToken(access_token) {
        // return admin if true
        if (access_token) {
            return await Admin.findOne({ where: { access_token: access_token } }) ?? false;
        } else {
            return false;
        }
    }

    async updateUsername(admin, password, newUsername) {
        if (admin && bcrypt.compareSync(password, admin.password)) {
            return await admin.update({ username: newUsername });
        }
        return false;
    }

    async updatePassword(admin, password, newPassword) {
        if (admin && bcrypt.compareSync(password, admin.password)) {
            return await admin.update({ password: bcrypt.hashSync(newPassword, 10) });
        }
        return false;
    }
}

module.exports = authService.getInstance();