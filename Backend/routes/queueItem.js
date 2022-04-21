var express = require('express');
var router = express.Router();

const crypto = require("crypto");
var session = require('express-session')

var configService = require("../services/configService");
var queueService = require('../services/queueService');
var redisClient = require("../services/redisClient");

router.use(session({
  secret: 'secret'
}));

function finishQueue(res, uuid, vcode) {
  if (configService.activeConfigs['callbackURL']) {
    res.redirect(configService.activeConfigs['callbackURL'] + '?uuid=' + uuid + '&vc=' + vcode);
  } else {
    res.render('finishQueue', { qItem: { uuid: uuid } });
  }
}

router.use(function (req, res, next) {
  if (queueService.serviceStatus === false) {
    res.status(403).send('Queue service was suspended');
  } else {
    next();
  }
})

router.get('/queue', async function (req, res, next) {
  let uuid = req.session.uuid;
  if (uuid) {
    // renew order
    redisClient
      .multi()
      // get item
      .hgetall(uuid)
      // set expire
      .expire(uuid, configService.activeConfigs['timeoutInQueue'])
      // get all items in queue
      .lrange('queue', 0, -1)
      .exec(function (err, replies) {
        // error
        if (err) {
          res.status(500).send();
          return;
        }
        // check queue-item expired or not
        if (replies[0]) {
          // inqueue
          if (replies[0]['status'] === 'inQueue') {
            let newOrder = replies[2].indexOf(uuid) + 1;
            res.render('inQueue', { qItem: { order: newOrder, uuid: uuid } });
            return;
          }
          // finishqueue
          req.session.destroy(() => finishQueue(res, uuid, replies[0]['vcode']));
        } else {
          next('route');
        }
      });
  } else {
    next('route');
  }
});

router.get('/queue', async function (req, res, next) {
  // add new item
  let newUUID = crypto.randomUUID();
  redisClient
    .multi()
    // add item
    .hset(newUUID, 'status', 'inQueue')
    // set expire
    .expire(newUUID, configService.activeConfigs['timeoutInQueue'])
    // add to the end of queue
    .rpush('queue', newUUID)
    .exec(function (err, replies) {
      // error
      if (err) {
        res.status(500).send();
        return;
      }
      // less than min cap
      if (configService.activeConfigs['minCapacity'] >= replies[2]) {
        let newVCode = crypto.randomBytes(16).toString('hex');
        redisClient
          .multi()
          .hmset(newUUID, { status: 'finishQueue', vcode: newVCode })
          .expire(newUUID, configService.activeConfigs['timeoutFinishQueue'])
          .exec(function (er2, re2) {
            if (er2) {
              res.status(500).send();
              return;
            }
            // finishqueue
            finishQueue(res, newUUID, newVCode);
          });
        return;
      }
      // larger than max cap
      if (replies[2] >= configService.activeConfigs['maxCapacity']) {
        res.status(403).send('exceed queue maxcapacity');
        return;
      }
      // set session data
      req.session.uuid = newUUID;
      res.render('inQueue', { qItem: { order: replies[2], uuid: newUUID } });
    });
});

module.exports = router;
