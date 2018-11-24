var iex = require('node-iex');

var freqs = {}; // fetch requests

var fetch = function(ticker) {
    if(freqs[ticker] != undefined)
        return freqs[ticker];

    return freqs[ticker] = iex.http.stock(ticker).quote().then(function(data) {
        delete freqs[ticker];
        return data;
    });
};

var parse = function(data) {
    return {
        high:     data.high,
        low:      data.low,
        changeP:  data.changePercent,
        open:     data.open,
        close:    data.close,
        current:  data.latestPrice
    };
};

var history = {
    fetch: function(ticker, type) {
        return iex.http.stock(ticker).chart(type);
    },
    parse: function(data) {
        var x = data.map(el => el.date);
        var y = data.map(el => el.close);
        return { x:x, y:y };
    }
};

module.exports = {
    general: {
        fetch: fetch,
        parse: parse
    },
    history: history
};
