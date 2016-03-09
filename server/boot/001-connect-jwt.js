var jwt      = require('express-jwt');

module.exports = function (app) {

  var secret = process.env.CONNECT_JWT_SECRET;

  if (!secret) {
    return;
  }

  app.use('/api', jwt({
    secret:          secret.replace(/\\n/g, "\n"),
    requestProperty: 'jwt'
  }));

  app.use('/api', function (req, res, next) {

    var User = app.models.Person;

    var email = req.jwt.email || req.jwt.sub + '@movies.connect.com';

    var data = {
      username:      "" + req.jwt.sub,
      email:         email,
      pictureUrl:    req.jwt.picture || '',
      name:          req.jwt.name || email,
      phoneNumber:   req.jwt.phone || '',
      emailVerified: true,
      password:      secret
    };

    User.findOrCreate({where: {username: data.username}}, data, function (err, user) {
      if (err) {
        return next(err);
      }

      User.login({
        email:    user.email,
        password: secret
      }, next)
    });
  });
};
