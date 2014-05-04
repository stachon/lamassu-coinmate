'use strict';

var BitstampTickerClient = require('bitstamp');
var async = require('async');

var BitstampTicker = function() {
  this.client = new BitstampTickerClient();
};

BitstampTicker.factory = function factory() {
  return new BitstampTicker();
};

BitstampTicker.prototype.ticker = function ticker(callback) {
  // jshint camelcase: false
  async.parallel([
      this.client.ticker,
      this.client.eur_usd
    ],
    function(err, results) {
      if (err) {
        return callback(err);
      }
      var usdRate = results[0].ask;
      var eurRate = usdRate / results[1].sell;
      callback(null, {USD: usdRate, EUR: eurRate.toFixed(2)});
    }
  );
  // jshint camelcase: true
};

module.exports = BitstampTicker;
