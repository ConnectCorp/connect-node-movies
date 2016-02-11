// Use the same environment-based configuration as in staging
var url = require('url');

if (!process.env.MYSQL_URL) {
  throw new Error('MYSQL_URL env variable not found');
}
var mysqlUrl = url.parse(process.env.MYSQL_URL);
var auth     = mysqlUrl.auth.split(':');

module.exports = {
  "mysqlDs": {
    "host":      mysqlUrl.host,
    "port":      mysqlUrl.port,
    "url":       process.env.MYSQL_URL,
    "database":  mysqlUrl.pathname,
    "password":  auth[1],
    "name":      "mysqlDs",
    "user":      auth[0],
    "connector": "mysql"
  }
}
