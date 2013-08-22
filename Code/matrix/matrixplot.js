//creates a matrix of scatter plots
function matrixPlot(){

	var 
		//reference to the containing svg for this matrix
		matsvg, 
		//size of each plot in the matrix, and number of rows/columns
		mat_size = 150,
		mat_padx = 30,
		mat_pady = 30,
		mat_m = 8,
		mat_n = 4,
		//name of the dataset to be placed in the matrix - this has one row per matrix key/scatter key combo 
		mat_data = jd_level_data,
		//function to filter the matrix data to place appropriate rows (same matrix key) in one scatter plot
		filt_data = filter_cpt,
		//name of the key variable in the mat_data set - this is the variable group elements together into a scatter plot
		matrix_key = 'cptgroup',
		//location key variable in mat_data - this defines each circle in the scatter plot, and links to other elements in the plot
		scatter_key = 'ben_loc',
		//indicator - is the plot zoomed?
		zoomed = null,
		//this keeps track of where the matrix scrollbar was last placed
		last_scroll = null, 
		//reference to the div containing the matrix tooltip
		mattip,
		//id for the zoom help tooltip
		zoom_help_id = "#mat_zoom_help",
		matplotid = matplot,
		//the zoom help should only show up a limited number of times
		zoom_tip_counter = 0,
		//data containing the extents and scales to be used for this matrix plot
		extents,
		scales;

	//called for each cell in the matrix of scatter plots
	//called by the selection which will contain the matrix
	function chart(selection){

		selection.each(function(data) { 
			//from this data, should create extents of every variable by cptgroup
			//we can also create the x and y scales for each cptgroup, the range being a fixed amount
			//the domain is something we will assign to the cptgroup based on the dropdown selections			
			var all_metrics=[{"type": "y", "met": y_metrics},{"type": "x", "met": x_metrics}];
			extents = {};
			scales = {};
			//loop over each cptgroup - for each, need to create extents for each variable of interest, x and y	
			data.forEach(function(cellid) {
				extents[cellid[matrix_key]] = {};
				scales[cellid[matrix_key]] = {};
				//loop over the x and y variables
				all_metrics.forEach(function(metric_group) {
					//for each x/y variable, find the extent
					metric_group["met"].forEach(function(metric) {
							extents[cellid[matrix_key]][metric.var] = d3.extent(mat_data.filter(filt_data(cellid[matrix_key])), function(d){return d[metric.var]; } );
							//expand the extent a bit on each side
							extents[cellid[matrix_key]][metric.var] = [extents[cellid[matrix_key]][metric.var][0] - 0.25, extents[cellid[matrix_key]][metric.var][1] + 0.25];	
							if (metric_group["type"] == "y") {
								//create the scales using the matrix parameters
								//reverse the y scale so that higher values are mapped to the top
								scales[cellid[matrix_key]][metric.var] = d3.scale.linear().range([mat_pady / 2, mat_size - mat_pady / 2]).domain(extents[cellid[matrix_key]][metric.var].reverse());
							}
							else {
								scales[cellid[matrix_key]][metric.var]=d3.scale.linear().range([mat_padx / 2, mat_size - mat_padx / 2]).domain(extents[cellid[matrix_key]][metric.var]);
							}
					}
					);
				});
				//create axes for each
				scales[cellid[matrix_key]].xaxis = d3.svg.axis()
										     .scale(scales[cellid[matrix_key]][dropdown.X().var])
										     .orient("bottom")
										     .ticks(5)
										     .tickSize(mat_size - mat_padx);
				scales[cellid[matrix_key]].yaxis = d3.svg.axis()
											 .scale(scales[cellid[matrix_key]][dropdown.Y().var])
											 .orient("left")
											 .ticks(5)
											 .tickSize(mat_size - mat_pady);						     
			});

			//for each element in the selection, create a matrix plot
			matsvg=d3.select(this).append("svg")
						   .attr("width", mat_size * mat_n)
						   .attr("height", mat_size * mat_m)
						   .append("g")
						   .attr("class", "matrix");

			matsvg.selectAll(".cell")
				   .data(data)
				   .enter()
				   .append("g")
				   .attr("class", "cell")
				   .attr("transform", function(d, i){
				   		return "translate(" + matrix_index(i, mat_n).column * mat_size + "," + matrix_index(i, mat_n).row * mat_size + ")";	
				   		})
				   .attr("width", mat_size)
				   .attr("height", mat_size)
				   .each(init_scatter);

		   //create the tooltip associated with the matrix
			mattip=d3.select("body")
						 .append("div")
						 .attr("class", "tooltip")
						 .attr("id", "mat_tip")
						 .style("opacity", 0);				   			   													
		})		
	};		

	//this creates each scatter plot (should be pushed to a scatter generator function, which matrixPlot calls)
	//this is called by chart
	//this hands off zoom_plot show_zoom_hint, hide_zoom_hint, show_data_circle, hide_data_circle
	//also handoff for select_jd
	//also depends on the scales array being populated
	function init_scatter(p) {
		var cell = d3.select(this);

		//reads the matrix associated group type
		var curr_matkey = p[matrix_key];

		//initialize axis
		cell.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (mat_pady / 2) + ")")
			.call(scales[curr_matkey].xaxis);
		cell.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (mat_size - mat_padx / 2) + ",0)")
			.call(scales[curr_matkey].yaxis);

		//draws rectangular border
		var rect = cell.append("rect")
			.attr("class", "frame")
			.attr("x", mat_padx / 2)
			.attr("y", mat_pady / 2)
			.attr("width", mat_size - mat_padx)
			.attr("height", mat_size - mat_pady);

		//create x=0 and y=0 lines	
		cell.append("line")
			.attr("class", "x cross")
			.attr("x1", mat_padx / 2)
			.attr("x2", mat_size - mat_padx / 2)	
			.attr("y1", scales[curr_matkey][dropdown.Y().var](0))
			.attr("y2", scales[curr_matkey][dropdown.Y().var](0));

		cell.append("line")
			.attr("class", "y cross")
			.attr("y1", mat_pady / 2)
			.attr("y2", mat_size - mat_pady / 2)	
			.attr("x1", scales[curr_matkey][dropdown.X().var](0))
			.attr("x2", scales[curr_matkey][dropdown.X().var](0));

		//finally, draw an invisible rectangle over the whole area, and allow this to zoom when clicked on
		//add a hint for the click zoom functionality, disappears after successful zoom
		var vrect=cell.append("rect")
					  .attr("class", "clickrect")
					  .attr("x", 0)
					  .attr("y", 0)
					  .attr("width", mat_size)
					  .attr("height", mat_size)
					  .on("click", zoom_plot)
					  .on("mouseover", show_zoom_hint)
					  .on("mouseout", hide_zoom_hint);	

		//create a circle for each district, representing the values of the procedure group this cell relates to			  
		cell.selectAll("circle")
			.data(mat_data.filter(filt_data(curr_matkey)), function(d) {return d[scatter_key];})
				.enter()
				.append("circle")
				.attr("cx", function(d) {
					return scales[curr_matkey][dropdown.X().var](d[dropdown.X().var]);
					})	
				.attr("cy", function(d) {return scales[curr_matkey][dropdown.Y().var](d[dropdown.Y().var]);})
				.attr("r", 2)
				.on("mouseover", show_data_circle)
				.on("mouseout", hide_data_circle)
				.on("click", function (d) {list.select_item(d[scatter_key])});

		//add name of the cptgroup up top
		cell.append("text")
			.attr("y", mat_pady / 3)
			.attr("x", mat_padx / 2)
			.attr("class","cpt_title")
			.text(function(d) {return d.cpt_short;})
			.append("title").text(function(d) {return d.cpt_full;});	
	};

	//this is used as a callback for clicking on a particular scatter to zoom in to that scatter
	//when called, this invokes matrix index, top_text
	function zoom_plot(d){
		//when clicked, scale and transform to the selected cell
		//were operating on matrix here, so any transformation should be with an offset of mat_padx,mat_pady/2
		//so need to know which cell was selected 
		//also need to see whether weve already zoomed or not
		var i = CPT_groups.indexOf(d);
		var x = 0,
			y = 0,
			k = 1;

		//if the selected matrix is not already zoomed	
		if (i !== zoomed){
			x = matrix_index(i, mat_n).column * mat_size;
			y = matrix_index(i, mat_n).row * mat_size;
			k = 4;

			//if zoomed is not null (already zoomed), need to remove all top text before moving on to the next zoom choice
			if (zoomed !== null) {
				matsvg.selectAll(".top_text").remove();
				d3.selectAll(".cpt_title").text(function(d) {return d.cpt_short;}).style("font-size",null);
			}

			zoomed = i;
			//this handles the scrollbar- when zooming in, would lose the position unless 
			last_scroll = matplotid.scrollTop;
			matplotid.scrollTop = 0;

			top_txt(d3.select(this.parentNode));
			d3.select(this.parentNode).selectAll(".cpt_title").text(function(d) {return d.cpt_full;}).style("font-size", 7 + "px");
		}
		//already zoomed in on selection, so zoom out	
		else {
			zoomed=null;
			matplotid.scrollTop=last_scroll;
			d3.select(this.parentNode).selectAll(".top_text").remove();
			d3.select(this.parentNode).selectAll(".cpt_title").text(function(d) {return d.cpt_short;}).style("font-size", null);
		}

		//this actually zooms in or out, depending on k, x, y
		matsvg.transition()
			  .duration(1000)
			  .attr("transform", "scale(" + k + ")translate(" + (-x) + "," + (-y) + ")"); 	  
	};	

	//when zoomed in, prints the names of the top 10 districts nearest the upper right corner
	//called by zoom_plot and replot
	function top_txt(cell) {
		var txt_d = 3;
		//this is just to place the text somewhere around but not on the corresponding circle
		function txt_vary() {return (Math.random() * 2 * txt_d) - txt_d;};

		//get the data of the top 10
		var top = cell.selectAll("circle")
					.filter(function(element, index, array) {return element[dropdown.X().var] >= 0 && element[dropdown.Y().var] >= 0;})
		    		.sort(function(a, b) {return dist(b[dropdown.X().var], b[dropdown.Y().var]) - dist(a[dropdown.X().var], a[dropdown.Y().var]);} ) 
		    		.filter(function(d, i){return i < 10;})
		    		.data(); 

		//use this data to create the top 10 selections    		
		var text = cell.selectAll(".top_text")
		 			 .data(top, function(d) {return d.ben_loc;});
		 			 
		//now we have the data, we need to distinguish entering/exititing/updating selections 			  
		var topEnter = text.enter() 
							.append("text")
			 				.attr("class", "top_text")
							.text(function(d) {return d.ben_loc;})
							.attr("x", function(d){
								return scales[d["cptgroup"]][dropdown.X().var](d[dropdown.X().var]) + txt_vary();
								})	
							.attr("y", function(d){
								return scales[d["cptgroup"]][dropdown.Y().var](d[dropdown.Y().var]) + txt_vary();
							});

		var topUpdate = d3.transition(text)
							.attr("x", function(d){
								return scales[d["cptgroup"]][dropdown.X().var](d[dropdown.X().var]) + txt_vary();
								})	
							.attr("y", function(d){
								return scales[d["cptgroup"]][dropdown.Y().var](d[dropdown.Y().var]) + txt_vary();
							});	

		var topExit=d3.transition(text.exit().remove());											    
	};			

	function dist(x,y){
		return (x * x) + (y * y);
	};	

	//Tool-tip functions
	//show name, relevant metrics
	function show_data_circle(d){
		mattip.transition()
			  .duration(200)
			  .style("opacity",.9);	

		mattip.html("<div class='tip_head underline'>" + d.jd_name + "</div>"
					+"<li>" + dropdown.X().alias + ": " + num_format(d[dropdown.X().var.slice(5, dropdown.X().var.len)], dropdown.X().type) + "</li>"
					+"<div class='tip_desc'>(" + num_format(d[dropdown.X().var], "norm") + " standard deviations " + norm_format(d[dropdown.X().var]) + " the mean) </div>"
					+"<li>" + dropdown.Y().alias + ": " + num_format(d[dropdown.Y().var.slice(5, dropdown.X().var.len)], dropdown.Y().type) + "</li>"
					+"<div class='tip_desc'>(" + num_format(d[dropdown.Y().var], "norm") + " standard deviations " + norm_format(d[dropdown.Y().var]) + " the mean)</div>")
			  .style("left", (d3.event.pageX) + "px")
			  .style("top", (d3.event.pageY - 10) + "px");	 
	};

	function hide_data_circle(d){
		mattip.transition()
			  .duration(500)
			  .style("opacity", 0);	
	};

	//these are functions to interact with the zoom helper (gives hint to click to zoom)
	function show_zoom_hint(){
		if (zoom_tip_counter < 3){
		d3.select(zoom_help_id).transition()
				.duration(200)
				.style("opacity", 0.9);	
		}		
	};

	function hide_zoom_hint(){
		if (zoom_tip_counter < 3){
		d3.select(zoom_help_id).transition()
				.duration(200)
				.style("opacity", 0);
		zoom_tip_counter += 1;		
		}		
	};

	//goes from a flattened array to the corresponding index (this assumes row-major order)
	function matrix_index(index, num_columns){
		return {"row": Math.floor(index / num_columns), "column": index % num_columns};
	};

	//**************Functions that can be called on chart object to modify its state**********************//

	//interacts with a list of selected locations to pull out the "most significant" plots for the top selection
	//this is called by replot, as well as select_jd	
	chart.id_top_scatter = function() {
		//take first in the stack, and identify the 5 most relevant cpt groups
		//to do this, look at the input data, filter by judicial district, and then sort by positive distance from origin
		//take first 5 of these, (so result is a list of cpts), filter the rects based on this list, fill based on that jds color

		var top_plots = mat_data.filter(function (d) {return (d[scatter_key] == list.items()[0].itemid) && d[dropdown.X().var] >= 0 && d[dropdown.Y().var] >= 0;})
									.sort(function (a, b) {return dist(b[dropdown.X().var], b[dropdown.Y().var]) - dist(a[dropdown.X().var], a[dropdown.Y().var]);} )
									.filter(function (d, i) {return dist(d[dropdown.X().var], d[dropdown.Y().var]) >= 1;})
									.filter(function (d, i) {return i < 5;});
		//for these top cpts, go through the cells and highlight appropriately							
		top_plots.forEach(function(plot) {
			matsvg.selectAll(".frame").filter(function (d) {return plot[matrix_key] == d[matrix_key];})
										.style("stroke", list.colmap()(list.items()[0].col_index))
										.style("stroke-width", 3);
		});
	};

	//replot adjusts the matrix when metrics are changed (so called by a change in the dropdown)
	//this depends on having the CPT groups, the scales, top_txt, and id_top_cpts
	chart.replot = function() {
		//re-applies the scale and axis to each matrix, moves the circles accordingly
		CPT_groups.forEach(function(cellid) {
			var cptgroup = cellid[matrix_key];
			scales[cptgroup].xaxis=d3.svg.axis()
									     .scale(scales[cptgroup][dropdown.X().var])
									     .orient("bottom")
									     .ticks(5)
									     .tickSize(mat_size-mat_padx);
			scales[cptgroup].yaxis=d3.svg.axis()
										 .scale(scales[cptgroup][dropdown.Y().var])
										 .orient("left")
										 .ticks(5)
										 .tickSize(mat_size-mat_pady);						     
		});

		matsvg.selectAll(".x.axis")
			 .transition()
			 .each(function(d) {var ax=d3.select(this); ax.call(scales[d[matrix_key]].xaxis);});
		matsvg.selectAll(".y.axis")
			 .transition()
			 .each(function(d) {var ax=d3.select(this); ax.call(scales[d[matrix_key]].yaxis);});	 

		//each circle contains which cptgroup its associated with, so can just modify those appropriately
		matsvg.selectAll("circle")
			  .transition()
			  .duration(1000)
			  .attr("cx",function(d) {return scales[d[matrix_key]][dropdown.X().var](d[dropdown.X().var]);})
			  .attr("cy",function(d) {return scales[d[matrix_key]][dropdown.Y().var](d[dropdown.Y().var]);});

		matsvg.selectAll(".y.cross").transition().duration(1000)	
				.attr("x1", function (d) {return scales[d[matrix_key]][dropdown.X().var](0);})
				.attr("x2", function (d) {return scales[d[matrix_key]][dropdown.X().var](0);});
		matsvg.selectAll(".x.cross").transition().duration(1000)
				.attr("y1", function (d) {return scales[d[matrix_key]][dropdown.Y().var](0);})
				.attr("y2", function (d) {return scales[d[matrix_key]][dropdown.Y().var](0);});

		//if zoomed, then handle the top selections	  
		if (zoomed) {
			top_txt(d3.selectAll(".cell").filter(function (d,i) {return i==zoomed;}));
		}

		//if there are districts highlighted, indicate the top procedure groups for that district
		if (list.items().length>0){
			chart.id_top_scatter();
		}	  	  	  
	};

	//highlights or removes a circle
	chart.sel_circle = function(curr_col, loc, add) {

		if (add == 1){
			matsvg.selectAll("circle")
				  .filter(function (e, i) {return loc == e[scatter_key];})   
				  .transition()
				  .duration(1000)			  
				  .style("fill", curr_col)
				  .attr("r", 5)
				  .style("fill-opacity", 0.9);

			matsvg.selectAll(".cell").each(function() {
					d3.select(this).selectAll("circle").sort(function(a, b) { 
							if (list.items().some(function(e) {return a[scatter_key] == e.itemid;})) {return 1;}
							else {return -1;}
						} );	  
					}
				);			
		}

		else {
			matsvg.selectAll("circle")
				  .filter(function (e, i){return loc == e[scatter_key];})   
				  .transition()
				  .duration(1000)			  
				  .style("fill", curr_col)
				  .attr("r", 2)
				  .style("fill-opacity", null);
		}
	};

	chart.clear_top = function() {
		matsvg.selectAll(".frame").style("stroke", null).style("stroke-width", null);		
	};
	//****************Getter/Setter methods for interacting with the chart object************************//

	return chart;
};

