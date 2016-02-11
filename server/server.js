var loopback = require('loopback');
var boot     = require('loopback-boot');
var jwt      = require('express-jwt');
var uuid     = require('node-uuid');

var app = module.exports = loopback();

var secret = process.env.CONNECT_JWT_SECRET || 's3cr3t';

app.use('/api', jwt({
  secret:          secret,
  requestProperty: 'jwt'
}));

app.use('/api', function (req, res, next) {

  var User = loopback.findModel('Person');

  var data = {
    username:      req.jwt.sub,
    email:         req.jwt.email || req.jwt.sub + '@movies.connect.com',
    pictureUrl:    req.jwt.picture || '',
    name:          req.jwt.name || '',
    phoneNumber:   req.jwt.phone || '',
    emailVerified: true,
    password:      secret
  };

  User.findOrCreate({ username: data.username }, data, function (err, user) {
    if (err) {
      return next(err);
    }

    User.login({
      email:    user.email,
      password: secret
    }, next)
  });
});

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
