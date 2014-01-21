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

var BitstampTickerClient = require('bitstamp');
var async = require('async');

var BitstampTicker = function() {
  this.client = new BitstampTickerClient();
};

BitstampTicker.factory = function factory() {
  return new BitstampTicker();
};

BitstampTicker.prototype.ticker = function ticker(currency, callback) {
  if (currency === 'USD') {
    this.client.ticker(function(err, json) {
      if (err) {
        return callback(err);
      }
      callback(null, json.ask);
    });
  } else if (currency === 'EUR') {
    return this._eurTicker(callback);
  } else {
    callback(new Error('Currency not listed: ' + currency));
  }
};

BitstampTicker.prototype._eurTicker = function _eurTicker(callback) {
  async.parallel([
      this.client.ticker,
      this.client.eur_usd
    ],
    function(err, results) {
      if (err) {
        return callback(err);
      }
      callback(null, results[0].ask / results[1].sell);
    }
  );
};

module.exports = BitstampTicker;
