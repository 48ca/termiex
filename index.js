#!/usr/bin/env node

var tickers = ['AAPL', 'GOOG', 'TSLA'];

var theme_name = 'default';
var theme   = require('./themes/' + theme_name);
global.theme = theme;

var blessed = require('blessed'),
    contrib = require('blessed-contrib');
var st      = require('./stock');

global.stop = false;

var screen = blessed.screen({ });
var grid = new contrib.grid({
    rows: 12,
    cols: 12,
    screen: screen
});

var line = grid.set(0, 0, 8, 12, contrib.line, {
    showNthLabel: 5,
    label: ' History ',
    showLegend: true,
    style: theme.chart,
    xLabelPadding: 5
});

var table = grid.set(8, 0, 4, 12, contrib.table, {
    keys: true,
    fg: theme.table.foreground,
    label: ' Stocks ',
    columnSpacing: 1,
    columnWidth: [2, 10, 10, 10, 10, 10, 15]
});

table.focus();

screen.render();
screen.on('resize', function(a) {
    line.emit('attach');
    table.emit('attach');
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    global.stop = true;
    return process.exit(0);
});

var stocks = st.gen(tickers);

table.rows.on('select', (item, index) => {
    var st = stocks[index];
    st.selected = !st.selected;
    if(st.selected)
        st.updateHistory();
});

setInterval(function() {
    stocks.map((stock) => stock.update());

    table.setData(st.blessed.table(stocks));
    var lines = stocks.filter(st => st.selected);
    if(lines.length == 0) {
        line.setData([{
            x:0, y:0,
            title: "No ticker",
            style: {color: 'yellow'}
        }]);
    } else {
        var mins = lines.map(line => Math.min.apply(null, line.history.y.filter(y => {
            return isFinite(y);
        })));
        line.options.minY = Math.min.apply(null, mins);
        line.setData(st.blessed.line(lines));
    }

    screen.render();
}, 100);
