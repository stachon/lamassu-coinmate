'use strict';

var Wreck = require('wreck');
var async = require('async');


// copy relevant convienient constants
var config        = require('../config');

var API_ENDPOINT  = config.API_ENDPOINT;
var COINMATE_CURRENCIES = config.COINMATE_CURRENCIES;

function getTickerUrls(currencies) {
  var urls = [];

  for (var i=0; i<currencies.length; i++) {
    var currency = currencies[i];

    urls.push(API_ENDPOINT + 'ticker?currencyPair=' + config.currencyPairName(currency));
  }

  return urls;
}

function formatResponse(currencies, results, callback) {
  
  if (currencies.length != 1)
    return callback(new Error('API supports only one currency per ticker call'));
    
  var response = {};
  var currency = currencies[0];
  
  if (COINMATE_CURRENCIES.indexOf(currency) == -1) {
    return callback(new Error('Unsupported currency'));
  }
  
  var rate = {
    ask: parseFloat(results[0].data.ask),
    bid: parseFloat(results[0].data.bid)
  };
  response[currency] = {
    currency: currency,
    rates: {
      ask: rate.ask.toFixed(2),
      bid: rate.bid.toFixed(2)
    }
  };


  if (currencies.length !== Object.keys(response).length)
    

  callback(null, response);
}


exports.ticker = function ticker(currencies, callback) {
  if (typeof currencies === 'string')
    currencies = [currencies];

  currencies.sort();

  if(currencies.length === 0)
    return callback(new Error('Currency not specified'));

  var urls = getTickerUrls(currencies);

  // change each url on the list into a download job
  var downloadList = urls.map(function(url) {
    return function(cb) {
      Wreck.get(url, { json:true, rejectUnauthorized: false /*FIXME TODO REMOVE!!!*/ }, function(err, res, payload) {
        cb(err, payload);
      });
    };
  });

  async.parallel(downloadList, function(err, results) {
    if (err) return callback(err);

    formatResponse(currencies, results, callback);
  });
};

