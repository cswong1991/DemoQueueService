var express = require('express');
var router = express.Router();

const { body, header, validationResult } = require('express-validator');
var authService = require('../services/authService');
var configService = require('../services/configService');
var queueService = require('../services/queueService');
var redisClient = require('../services/redisClient');
var statisticsService = require('../services/statisticsService');

// Login
router.post('/auth/token',
  body('username').isLength({ min: 4, max: 20 }),
  body('password').isLength({ min: 4 }),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(403).json({ errors: errors.array() });
      return;
    }

    authService.authByUsernamePassword(req.body['username'], req.body['password'], true).then(loginResult => {
      if (loginResult === false) {
        res.status(403).send();
      } else {
        res.json({ access_token: loginResult.access_token });
      }
    });
  }
);

// Filter requests without access token
router.use(
  header('authorization').notEmpty(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(401).json({ errors: errors.array() });
      return;
    }

    authService.authByAccessToken(authService.getAccessTokenFromHeader(req)).then(authResult => {
      if (authResult === false) {
        res.status(401).send();
      } else {
        res.locals.admin = authResult;
        next();
      }
    });
  }
);

router.use(function (req, res, next) {
  if (["/queue/status", "/queue-item/verify", "/config/list"].includes(req.path)) {
    next();
  } else {
    if (process.env.VIEW_ONLY === "true") {
      res.status(403).send();
    } else {
      next();
    }
  }
});

// Logout or renew access token
router.post('/auth/token/renew',
  function (req, res, next) {
    authService.generateAccessToken(res.locals.admin);
    res.status(200).send();
  }
);

// Update username
router.post('/auth/update/username',
  body('username').isLength({ min: 4, max: 20 }),
  body('password').isLength({ min: 4 }),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(403).json({ errors: errors.array() });
      return;
    }

    authService.updateUsername(res.locals.admin, req.body['password'], req.body['username']).then(updateResult => {
      if (updateResult === false) {
        res.status(403).send();
      } else {
        res.status(200).send();
      }
    });
  }
);

// Update password
router.post('/auth/update/password',
  body('password').isLength({ min: 4 }),
  body('newPassword').isLength({ min: 4 }),
  body('ConfirmNewPW').custom((value, { req }) => value === req.body.newPassword),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(403).json({ errors: errors.array() });
      return;
    }

    authService.updatePassword(res.locals.admin, req.body['password'], req.body['newPassword']).then(updateResult => {
      if (updateResult === false) {
        res.status(403).send();
      } else {
        res.status(200).send();
      }
    });
  }
);

// List configs
router.post('/config/list', function (req, res, next) {
  res.json(configService.activeConfigs);
});

// Update configs
router.post('/config/update',
  body('maxCapacity').isInt({ min: 100 }).withMessage('min: 100'),
  body('minCapacity').isInt({ min: 100 }).withMessage('min: 100'),
  body('maxCapacity').custom((value, { req }) => parseInt(value) > parseInt(req.body.minCapacity)).withMessage('Must be greater than minCapacity'),
  body('callbackURL').isURL().withMessage('Must be valid URL'),
  body('digestItems').isInt({ min: 0 }).withMessage('min: 0'),
  body('digestInterval').isInt({ min: 5 }).withMessage('min: 5'),
  body('autoClearInterval').isInt({ min: 60 }).withMessage('min: 60'),
  body('timeoutInQueue').isInt({ min: 60 }).withMessage('min: 60'),
  body('timeoutFinishQueue').isInt({ min: 60 }).withMessage('min: 60'),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(403).json({ errors: errors.array() });
      return;
    }

    configService.updateConfigs(req.body).then(() => res.status(200).send());
  }
);

// Get queue status
router.post('/queue/status',
  function (req, res, next) {
    redisClient.lrange('statistics', 0, -1, function (err, reply) {
      if (err) {
        res.status(500).send();
        return;
      }

      res.json(reply.map(e1 => JSON.parse(e1)));
    });
  }
);

// Start service
router.post('/queue/start',
  function (req, res, next) {
    queueService.importConfigs(configService.activeConfigs);
    queueService.serviceStatus = true;
    res.status(200).send();
  }
);
// Stop service
router.post('/queue/stop',
  function (req, res, next) {
    queueService.importConfigs({
      ...configService.activeConfigs,
      digestItems: 0,
      digestInterval: 0,
      autoClearInterval: 0
    });
    queueService.serviceStatus = false;
    redisClient.flushall(function (err, reply) {
      if (err) {
        res.status(500).send();
      } else {
        res.status(200).send();
      }
    });
  }
);

// Manual digest queue items
router.post('/queue/digest',
  body('digestItems').isInt({ min: 1 }),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(403).json({ errors: errors.array() });
      return;
    }

    queueService.digestQueueItems(req.body['digestItems']).then(() => res.status(200).send());
  }
);

// Verify queue-item finishQueue or not
router.post('/queue-item/verify',
  body('uuid').notEmpty(),
  body('vc').notEmpty(),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(403).json({ errors: errors.array() });
      return;
    }

    redisClient
      .multi()
      // get verification code
      .hget(req.body['uuid'], 'vcode')
      // del this queue item
      .del(req.body['uuid'])
      .exec(function (err, reply) {
        if (err) {
          res.status(500).send();
          return;
        }
        res.status((reply[0] === req.body['vc']) ? 200 : 403).send();
      });
  }
);

module.exports = router;
