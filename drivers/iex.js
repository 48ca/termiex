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
        name:     data.companyName,
        high:     data.high,
        low:      data.low,
        changeP:  Math.round(data.changePercent * 10000)/100,
        open:     data.open,
        close:    data.close,
        current:  data.latestPrice
    };
};

var history = {
    fetch: function(ticker, type) {
        return iex.http.stock(ticker).chart(type);
    },
    parse: function(data, type) {
        var x = type == '1d'
            ? data.map(el => el.minute)
            : data.map(el => el.date);

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
