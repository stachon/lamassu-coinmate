'use strict';

var should = require('chai').should();
var Ticker = require('../lib/ticker');
var Trader = require('../lib/trader');


// re-reads *uncached* version of config JSON
function getFreshConfig() {
  var configPath = './mockConfig.json';
  delete require.cache[require.resolve(configPath)]
  return require(configPath);
};


// Checks structure and values of object returned by `.balance()`
function checkCurrency(results, currency) {
  results.should.be.an('object');
  results.should.have.property(currency);

  var currency = results[currency];
  currency.should.be.an('object');
  currency.should.have.property('rate');

  var rate = parseFloat(currency.rate);
  isNaN(rate).should.not.equal(true, 'The rate should be a float');
  return rate;
};


describe('Bitstamp Plugin', function () {

  // price returned from `Ticker` will be used to place order in `Trader`
  var lastUsdPrice = null;

  describe('Ticker', function () {
    var ticker = Ticker.factory();

    // // NOTE: should be uncommented and adjusted when rate limiting is in place
    // afterEach(function (done) {
    //   setTimeout(done, 1000);
    // });

    // NOTE: MAX timeout for each test
    this.timeout(2000);

    it('Read ticker in USD', function (done) {
      var currencies = ['USD'];

      ticker.ticker(currencies, function (err, results) {
        should.not.exist(err, "There should be no error");
        should.exist(results);

        lastUsdPrice = checkCurrency(results, currencies[0]);

        done();
      });
    });

    it('Read ticker in EUR', function (done) {
      var currencies = ['EUR'];

      ticker.ticker(currencies, function (err, results) {
        should.not.exist(err, "There should be no error");
        should.exist(results);

        checkCurrency(results, currencies[0]);

        done();
      });
    });

    it('Read ticker in ILS', function (done) {
      var currencies = ['ILS'];

      ticker.ticker(currencies, function (err, results) {
        should.exist(err);
        should.not.exist(results);

        done();
      });
    });

    it('Read ticker in USD, EUR', function (done) {
      var currencies = ['USD', 'EUR'];

      ticker.ticker(currencies, function (err, results) {
        should.not.exist(err, "There should be no error");
        should.exist(results);

        for(var i in currencies)
          checkCurrency(results, currencies[i]);

        done();
      });
    });

    it('Read ticker in EUR, ILS', function (done) {
      var currencies = ['EUR', 'ILS'];

      ticker.ticker(currencies, function (err, results) {
        should.exist(err);
        should.not.exist(results);

        done();
      });
    });

    it('Read ticker in USD, EUR, ILS', function (done) {
      var currencies = ['USD', 'EUR', 'ILS'];

      ticker.ticker(currencies, function (err, results) {
        should.exist(err);
        should.not.exist(results);

        done();
      });
    });

    it('Read ticker with empty array', function (done) {
      var currencies = [];

      ticker.ticker(currencies, function (err, results) {
        should.exist(err);
        should.not.exist(results);

        done();
      });
    });

  });

  describe('Trader', function () {
    var configMock = null;
    var trader = null;

    describe('Mock config file', function () {

      it('`test/mockConfig.json` should exist', function () {
        should.not.Throw(function () {
          configMock = getFreshConfig();
        });
        configMock.should.be.an('object');
      });

      it('should have `key` property', function () {
        configMock.should.have.property('key');
      });

      it('should have `secret` property', function () {
        configMock.should.have.property('secret');
      });

      it('should have `clientId` property', function () {
        configMock.should.have.property('clientId');
      });

    });

    describe('Config', function () {

      afterEach(function () {
        trader = null;
        configMock = getFreshConfig();
      });

      it('should have valid and activated API credentials', function (done) {
        should.not.Throw(function bitstampInit() { // named for better stacktrace
          trader = Trader.factory(configMock);
        });

        trader.balance(function (err) {
          should.not.exist(err);
          done();
        });
      });
    });

    describe('Requests', function () {

      var balance = NaN;
      var minimalAmount = NaN;

      before(function () {
        configMock = getFreshConfig();
        trader = Trader.factory(configMock);
      });

      afterEach(function (done) {
        this.timeout(1500);

        // without it _some_ request _sometimes_ fail
        setTimeout(done, 777);
      });

      it('should return valid balance', function (done) {
        trader.balance(function (err, localBalance) {
          should.not.exist(err);
          localBalance.should.be.a('number');
          isNaN(localBalance).should.not.equal(true);

          balance = localBalance;

          done();
        });
      });

      // NOTE: [amount === 0] and [amount < $5] produce different errors
      it('should fail when amount is zero', function (done) {
        trader.purchase(0, lastUsdPrice, function (err) {
          should.exist(err);
          // expected err: [Error: {"amount":["Ensure this value is greater than or equal to 1E-8."]}]
          JSON.parse(err.message).should.have.property('amount');

          done();
        });
      });

      it('should fail when amount too small', function (done) {

        // NOTE: minimum allowed order is $5;
        //       used `5.01` to accomodate possible price change
        minimalAmount = (5.01 * 1e8) / lastUsdPrice;
        var tooSmallAmount = minimalAmount / 2;

        trader.purchase(tooSmallAmount, lastUsdPrice, function (err) {
          should.exist(err);
          // expected err: [Error: Minimum order size is $5]
          err.message.should.have.string('$5');

          done();
        });
      });

      it('should fail when price not provided', function (done) {
        trader.purchase(minimalAmount, null, function (err) {
          should.exist(err);
          JSON.parse(err.message).should.have.property('price');

          done();
        });
      });

      it('should fail when provided price is too high', function (done) {

        var tooHighPrice = lastUsdPrice * 1.2;

        trader.purchase(minimalAmount, tooHighPrice, function (err) {
          should.exist(err);
          // expected err: [Error: Price is more than 20% above market price.]
          err.message.should.have.string('20%');

          done();
        });
      });

      it('should have at least $5 on account', function () {
        balance.should.be.above(5);

      });

      it('should successfully place order', function (done) {
        trader.purchase(minimalAmount, lastUsdPrice, function (err) {
          should.not.exist(err);

          done();
        });
      });

    });
  });
});
