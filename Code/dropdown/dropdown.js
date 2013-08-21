//implements functionality for the dropdowns - namely, contains currently selected dropdown options
// and passes changes in dropdown menu to other elements

function metricDropdown(){
	var 
		yvars = y_metrics,
		xvars = x_metrics,
		sel_y = y_metrics[0],
		sel_x = x_metrics[0];

	function dropdown() {
		//dynamically create the dropdown menus based on the x/y var lists, and set them
		// so that when they change, the matrix scatter is replotted
		var xdown = d3.select("#all").select("#xdrop")
					.append("select");
		var xopt = xdown.selectAll("option")			
					.data(x_metrics)
					.enter()
					.append("option")
					.attr("value",function(d) {return d.alias;} )
					.attr("selected",function(d, i) {return i == 0 ? "selected": null;})
					.text(function(d) {return d.alias;});

		xdown.on("change",function(){
						sel_x = x_metrics[this.selectedIndex];
						chart.replot();
					});			

		var ydown=d3.select("#all").select("#ydrop")
					.append("select");

		var yopt=ydown.selectAll("option")			
					.data(y_metrics)
					.enter()
					.append("option")
					.attr("value",function (d) {return d.alias;} )
					.attr("selected",function (d,i) {return i==0 ? "selected":null;})
					.text(function (d) {return d.alias});

		ydown.on("change",function() {
						sel_y = y_metrics[this.selectedIndex];
						chart.replot();
					});		
	};

	//getter methods for current selection
	dropdown.X = function() {
		return sel_x;
	};

	dropdown.Y = function() {
		return sel_y;
	};

	return dropdown;
};								

