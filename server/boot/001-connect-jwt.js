var jwt = require('express-jwt');
var async = require('async');
var Transaction = require('loopback-connector').Transaction;
var connectMiddleware = require('connect-node-middleware');

module.exports = function (app) {

  var base64secret = process.env.CONNECT_JWT_SECRET;
  var secret = base64secret && new Buffer(base64secret, 'base64');
  var User = app.models.Person;

  if (!secret) {
    return;
  }

  function login(email, next) {
    User.login({
      email: email,
      password: secret
    }, next);
  }

  app.use('/api', connectMiddleware({
    secret: secret,
    baseUri: process.env.CONNECT_AUTH_BASE_URL
  }));

  app.use('/api', function (req, res, next) {
    var tx, u;

    async.waterfall([
      function (next) {
        User.beginTransaction(Transaction.READ_COMMITTED, next);
      },
      function (t, next) {
        tx = t;
        req.user.data.id = req.user.data;
        User.findOne({where: {username: req.user.userId}}, {transaction: tx}, next);
      },
      function (user, next) {
        if (user) {
          return next(null, user);
        }

        var email = req.user.emailAccounts && req.user.emailAccounts.lengh > 0 && req.user.emailAccounts[0].address;
        email = email || req.user.userId + '@movies.connect.com';

        var data = {
          username: req.user.userId,
          email: email,
          pictureUrl: req.user.userId.pictureUrl,
          name: req.user.userId.name,
          emailVerified: true,
          password: base64secret
        };

        User.create(data, {transaction: tx}, next);
      },
      function (user, next) {
        u = user;
        tx.commit(next);
      },
      function (next) {
        return login(u.email, next);
      }
    ], next);
  });
};
