//JSMD-Plot.js

/*Adds new data to the plot*/
function update_sim_plot(TE,KE,PE,Temp,energy_chart,temperature_chart) {

    var chart_data1 = energy_chart.seriesSet[0].timeSeries;
    chart_data1.append(new Date().getTime(),TE);
    var chart_data2 = energy_chart.seriesSet[1].timeSeries;
    chart_data2.append(new Date().getTime(),KE);
    var chart_data3 = energy_chart.seriesSet[2].timeSeries;
    chart_data3.append(new Date().getTime(),PE);
    var temperature_chart_data = temperature_chart.seriesSet[0].timeSeries;
    temperature_chart_data.append(new Date().getTime(),Temp);
}

function update_plot(chart, v, index) {
    index = index || 0;
    var d = chart.seriesSet[index].timeSeries;
    d.append(new Date().getTime(), v);
}

function create_plots(id, light_background, series_number, colors) {
    
    series_number = series_number || 1;
    id = id || "";
    var i;

    if(typeof colors === 'undefined') {
	colors = [];
	for(i = 0; i < series_number; i++)
	    colors.push( 'rgb(255, 0, 0)');
    }
    
    
    var labels = '#ffffff';
    var background = '#000000';

    if(light_background) {
	labels = '#3333333';
	background = '#FFFFFF';
    }
	    
    var chart = new SmoothieChart({
	grid: {
	    fillStyle: background
	},
	labels: {
	    fillStyle: labels
	}
    });

    for(i = 0; i < series_number; i++) {
	var cd = new TimeSeries();
	chart.addTimeSeries(cd, { strokeStyle: colors[i], lineWidth: 3 });

    }

    chart.streamTo(document.getElementById(id), 3000);
    return chart;
}

    
/*Creates new plot*/
function create_sim_plots(id_prefix, light_background) {

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
