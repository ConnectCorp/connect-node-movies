var server = require('./server');
var ds     = server.dataSources.mysqlDs;

var modelConfig = require('./model-config.json');

var tables = Object.keys(modelConfig);

ds.automigrate(tables, function (er) {
  if (er) throw er;
  console.log('Loopback tables [' + tables + '] created in ', ds.adapter.name);
  ds.disconnect();
});
