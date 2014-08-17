'use strict';

var Wreck       = require('wreck');
var async       = require('async');


// copy relevant convienient constants
var config                = require('../config');
var API_ENDPOINT          = config.API_ENDPOINT;
var SUPPORTED_CURRENCIES  = config.SUPPORTED_CURRENCIES;


function getTickerUrls(currencies) {
  var urls = [
    API_ENDPOINT + 'ticker/'
  ];

  if (currencies.indexOf('EUR') !== -1)
    urls.push(API_ENDPOINT + 'eur_usd/');

  return urls;
};

function formatResponse(currencies, results, callback) {
  var usdRate = {
    ask: parseFloat(results[0].ask),
    bid: parseFloat(results[0].bid)
  };

  var response = {};
  if (currencies.indexOf('USD') !== -1)
    response.USD = {
      currency: 'USD',
      rates: {
        ask: usdRate.ask,
        bid: usdRate.bid
      }
    }

  if (currencies.indexOf('EUR') !== -1)
    response.EUR = {
      currency: 'EUR',
      rates: {
        ask: parseFloat(usdRate.ask / results[1].sell).toFixed(2),
        bid: parseFloat(usdRate.bid / results[1].sell).toFixed(2)
      }
    }

  callback(null, response);
};


exports.ticker = function ticker(currencies, callback) {
  if (typeof currencies === 'string')
    currencies = [currencies];

  currencies.sort();

  if(currencies.length === 0)
    return callback(new Error('Currency not specified'));

  for (var i=0; i<currencies.length; i++)
    if (SUPPORTED_CURRENCIES.indexOf(currencies[i]) === -1)
      return callback(new Error('Unsupported currency: ' + currencies[i]));

  var urls = getTickerUrls(currencies);

  // change each url on the list into a download job
  var downloadList = urls.map(function(url) {
    return function(cb) {
      Wreck.get(url, { json:true }, function(err, res, payload) {
        cb(err, payload);
      });
    }
  });

  async.parallel(downloadList, function(err, results) {
    if (err) return callback(err);

    formatResponse(currencies, results, callback);
  });
};

