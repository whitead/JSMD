function update_plot(TE, chart) {

    var chart_data = chart.seriesSet[0].timeSeries;
    chart_data.append(new Date().getTime(), TE);
}
    
/*Adds new data to the plot*/
function createTimeline() {
    var chart = new SmoothieChart();
    var chart_data = new TimeSeries();
    chart.addTimeSeries(chart_data, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
    chart.streamTo(document.getElementById("chart"), 500);
    return chart;
}


