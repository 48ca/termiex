var iex = require('./drivers/iex');

var stock = function(ticker) {
    this.history = {
        title: ticker,
        x: 0,
        y: 0
    };
    this.ticker = ticker;
    this.data = {
        current: '???',
        open:    '???',
        close:   '???',
        changeP: '???'
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

stock.prototype.updateHistory = function() {
    var that = this;
    iex.history.fetch(this.ticker, '1y').then(function(data) {
        var d = iex.history.parse(data);
        that.history.x = d.x;
        that.history.y = d.y;
    });
};

var gen = function(tickers) {
    return tickers.map((ticker) => new stock(ticker));
};

var colors = global.theme.chart.colors;

var blessed = {
    line: function(stocks) {
        return stocks.map((st, i) => {
            var h = st.history;
            h.style = {
                line: colors[i % colors.length],
                text: colors[i % colors.length]
            };
            return h;
        });
    },
    table: function(stocks) {
        headers = ['', 'Ticker', 'Current', 'Open', 'Close', 'Change %'];
        data = stocks.map((_stock) => {
            return [
                _stock.selected ? '*' : ' ',
                _stock.ticker,
                _stock.data.current,
                _stock.data.open,
                _stock.data.close,
                _stock.data.changeP,
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
