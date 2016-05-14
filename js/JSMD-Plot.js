
/*Adds new data to the plot*/
function update_plot(TE,KE,PE,Temp,energy_chart,temperature_chart) {

    var chart_data1 = energy_chart.seriesSet[0].timeSeries;
    chart_data1.append(new Date().getTime(),TE);
    var chart_data2 = energy_chart.seriesSet[1].timeSeries;
    chart_data2.append(new Date().getTime(),KE);
    var chart_data3 = energy_chart.seriesSet[2].timeSeries;
    chart_data3.append(new Date().getTime(),PE);
    var temperature_chart_data = temperature_chart.seriesSet[0].timeSeries;
    temperature_chart_data.append(new Date().getTime(),Temp);
}
    
/*Creates new plot*/
function create_plots(id_prefix, light_background) {

    id_prefix = id_prefix || "";
    
    var labels = '#ffffff';
    var background = '#000000';

    if(light_background) {
	labels = '#3333333';
	background = '#FFFFFF';
    }
	    
    var energy_chart = new SmoothieChart({
	grid: {
	    fillStyle: background
	},
	labels: {
	    fillStyle: labels
	}
    });
    var temperature_chart  = new SmoothieChart({
	grid: {
	    fillStyle: background
	},
	labels: {
	    fillStyle: labels
	}
    });
    var chart_data1 = new TimeSeries();
    energy_chart.addTimeSeries(chart_data1, { strokeStyle:'rgb(255, 0, 255)', lineWidth: 3 });
    var chart_data2 = new TimeSeries();
    energy_chart.addTimeSeries(chart_data2, {strokeStyle:'rgba(0, 255, 0, 1)', lineWidth:3 });
    var chart_data3 = new TimeSeries();
    energy_chart.addTimeSeries(chart_data3, { strokeStyle: 'rgba(255,255,0,1)', lineWidth: 3 });
    var temperature_chart_data = new TimeSeries();
    temperature_chart.addTimeSeries(temperature_chart_data, { strokeStyle:'rgb(255, 0, 0)', lineWidth: 3 });
    energy_chart.streamTo(document.getElementById(id_prefix + "energy-chart"), 3000);
    temperature_chart.streamTo(document.getElementById(id_prefix + "temperature-chart"), 3000);
    return [energy_chart,temperature_chart];
}
