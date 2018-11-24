#!/usr/bin/env node

var tickers = ['AAPL', 'GOOG', 'TSLA', 'T', 'SNAP', 'AMZN', 'FB'];

var theme_name = 'default';
var theme   = require('./themes/' + theme_name);
global.theme = theme;

var st      = require('./stock');
var stocks = st.gen(tickers);
stocks.map((stock) => stock.update());

setInterval(function() {
    stocks.map((stock) => stock.update());
}, 5000);

var blessed = require('blessed'),
    contrib = require('blessed-contrib');

var screen = blessed.screen({ });
var grid = new contrib.grid({
    rows: 12,
    cols: 24,
    screen: screen
});

var line = grid.set(0, 0, 8, 22, contrib.line, {
    showNthLabel: 5,
    label: ' History ',
    showLegend: true,
    style: theme.chart,
    xLabelPadding: 5
});

var durations = grid.set(0, 22, 8, 2, contrib.table, {
    label: 'Time',
    keys: true,
    fg: theme.table.foreground,
    columnSpacing: 1,
    columnWidth: [5]
});

var durationChoices = [
    '1d', '1m', '3m', '6m',
    'ytd', '1y', '2y', '5y'
];

durations.setData({
    data: durationChoices.map(el => [el]),
    headers: []
});

var table = grid.set(8, 0, 4, 24, contrib.table, {
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
    durations.emit('attach');
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

screen.key(['right'], function(ch, key) {
    durations.focus();
});

screen.key(['left'], function(ch, key) {
    table.focus();
});

var duration = '1d';

table.rows.on('select', (item, index) => {
    var st = stocks[index];
    st.selected = !st.selected;
    if(st.selected)
        st.updateHistory(duration);
});

durations.rows.on('select', (item, index) => {
    duration = durationChoices[index];
    stocks.filter(st => st.selected).map(st => st.updateHistory(duration));
});

setInterval(function() {

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
