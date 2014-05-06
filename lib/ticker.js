'use strict';

var BitstampTickerClient = require('bitstamp');
var async = require('async');

var BitstampTicker = function() {
  this.client = new BitstampTickerClient();
};

BitstampTicker.factory = function factory() {
  return new BitstampTicker();
};

function fetchUSD(client, callback) {
  client.ticker(function (err, res) {
    if (err) return callback(err);
    callback(null, {USD: {currency: 'USD', rate: res.ask}});
  });
}

function fetchEUR(client, callback) {
  async.parallel([
      client.ticker,
      client.eur_usd
    ],
    function(err, results) {
      if (err) return callback(err);
      var usdRate = results[0].ask;
      var eurRate = usdRate / results[1].sell;
      callback(null, {
        USD: {currency: 'USD', rate: usdRate}, 
        EUR: {currency: 'EUR', rate: eurRate.toFixed(2)}
      });
    }
  );
}

BitstampTicker.prototype.ticker = function ticker(currencies, callback) {
  if (currencies.length > 2) return callback(new Error('Unsupported currencies.'));

  if (currencies.length === 1) {
    var currency = currencies[0];
    if (currency === 'EUR')
      return fetchEUR(this.client, callback);
    else if (currency === 'USD')
      return fetchUSD(this.client, callback);
    else
      return callback(new Error('Unsupported currencies.'));
  }

  var sortedCurrencies = currencies.sort();
  if (sortedCurrencies[0] !== 'EUR' || sortedCurrencies[1] !== 'USD')
      return callback(new Error('Unsupported currencies.'));

  fetchEUR(this.client, callback);      
};

module.exports = BitstampTicker;
