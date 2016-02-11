var uuid   = require('node-uuid');
var morgan = require('morgan');

module.exports = function (app) {

  morgan.token('trace-id', function (req) {
    return req.traceId;
  });

  app.use(function (req, res, next) {
    req.traceId = req.headers['x-trace-id'] || uuid.v4();
    next();
  });

  app.use(morgan(':trace-id - :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

};
