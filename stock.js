var iex    = require('./drivers/iex'),
    colors = require('colors/safe');

var UNKNOWN = '???';

var stock = function(ticker) {
    this.history = {
        title: ticker,
        x: [0],
        y: [0]
    };
    this.ticker = ticker;
    this.data = {
        name:    '',
        current: UNKNOWN,
        open:    UNKNOWN,
        close:   UNKNOWN,
        changeP: UNKNOWN
    };
    this.selected = false;
};

stock.prototype.fetch = function() {
    return iex.general.fetch(this.ticker);
};

stock.prototype.apply = function(data) {
    this.data = iex.general.parse(data);
};

stock.prototype.update = function() {
    var that = this;
    this.fetch().then(function(data) {
        that.apply(data);
    })
    .catch(error => {
        console.error(error.message);
    });
};

stock.prototype.updateHistory = function(duration) {
    var that = this;
    iex.history.fetch(this.ticker, duration).then(function(data) {
        var d = iex.history.parse(data, duration);
        that.history.x = d.x;
        that.history.y = d.y;
    });
};

var gen = function(tickers) {
    return tickers.map((ticker) => new stock(ticker));
};

var table_colors = global.theme.chart.colors;

var blessed = {
    line: function(stocks) {
        return stocks.map((st, i) => {
            var h = st.history;
            h.style = {
                line: table_colors[i % table_colors.length],
                text: table_colors[i % table_colors.length]
            };
            return h;
        });
    },
    table: function(stocks) {
        headers = ['', 'Ticker', 'Current', 'Open', 'Close', 'Change%', 'Name'];
        data = stocks.map((_stock) => {
            var c = +_stock.data.changeP < 0 ? colors.red : colors.green;
            if(_stock.data.changeP == UNKNOWN) {
                c = colors.white;
            }

            return [
                _stock.selected ? '*' : ' ',
                c(_stock.ticker),
                c(_stock.data.current),
                c(_stock.data.open),
                c(_stock.data.close),
                c(_stock.data.changeP),
                c(_stock.data.name)
            ];
        });
        return {
            headers: headers,
            data: data
        };
    }
};

module.exports = exports = {
    stock: stock,
    gen: gen,
    blessed: blessed
};
