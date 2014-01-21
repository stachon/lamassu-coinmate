/*
* THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
* WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
* OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
* INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
* HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
* STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
* IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
* POSSIBILITY OF SUCH DAMAGE.
*/

'use strict';

var BitstampClient = require('bitstamp');
var winston = require('winston');
var logger = new (winston.Logger)({transports:[new (winston.transports.Console)()]});

var SATOSHI_FACTOR = Math.pow(10,8);
var FUDGE_FACTOR = 1.1;

var BitstampTrade = function(config) {
  this.client = new BitstampClient(config.key, config.secret, config.clientId);
};

BitstampTrade.factory = function factory(config) {
  return new BitstampTrade(config);
};

// Public functions

BitstampTrade.prototype.balance = function balance(callback) {
  this.client.balance(function(err, json) {
    if (err) {
      return callback(err);
    }

    if (json.error) { 
      return callback(new Error(json.error));
    }

    callback(null, json.usd_available);
  });
};

BitstampTrade.prototype.purchase = function purchase(satoshis, currentPrice, callback) {
  // TODO DEV
  var bitcoins = satoshis / SATOSHI_FACTOR;
  var price = currentPrice * FUDGE_FACTOR;
  var priceStr = price.toFixed(2);
  var amountStr = bitcoins.toFixed(8);
  this.client.buy(amountStr, priceStr, function(err, json) {
    if (err) {
      return callback(err);
    }

    if (json.error) {
      return callback(new Error(json.error));
    }

    logger.info('Bitstamp purchase %j',json);
    callback();
  });
};

module.exports = BitstampTrade;
