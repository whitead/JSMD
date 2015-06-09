function update_plot(TE,KE,PE,chart,tempchart) {

    var chart_data1 = chart.seriesSet[0].timeSeries;
    chart_data1.append(new Date().getTime(),TE);
    var chart_data2 = chart.seriesSet[1].timeSeries;
    chart_data2.append(new Date().getTime(),KE);
    var chart_data3 = chart.seriesSet[2].timeSeries;
    chart_data3.append(new Date().getTime(),PE);
    tempchart.streamTo(document.getElementById("tempchart"));
}
    
/*Adds new data to the plot*/
function createTimeline() {
    var chart = new SmoothieChart();
    var tempchart  = new SmoothieChart();
    var chart_data1 = new TimeSeries();
    chart.addTimeSeries(chart_data1, { strokeStyle:'rgb(255, 0, 255)', lineWidth: 3 });
    var chart_data2 = new TimeSeries();
    chart.addTimeSeries(chart_data2, {strokeStyle:'rgba(0, 255, 0, 1)', lineWidth:3 });
    var chart_data3 = new TimeSeries();
    chart.addTimeSeries(chart_data3, { strokeStyle: 'rgba(255,255,0,1)', lineWidth: 3 });
    var temp = new TimeSeries();
    tempchart.addTimeSeries(temp, { strokeStyle:'rgb(255, 0, 255)', lineWidth: 3 });
    chart.streamTo(document.getElementById("chart"), 500);
    tempchart.streamTo(document.getElementById("tempchart"), 500);
    return [chart,tempchart];
}
