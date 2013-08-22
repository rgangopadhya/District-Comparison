//generates a map using the provided data to draw paths etc
function genMap(){
	var 
	map_width = 700,
	map_height = 400,
	zoom_scale = 3.25,
	//contains the leaflet panes
	map_panes,
	//the data to be used
	map_data_root = jd_map,
	map_data = map_data_root.features,
	loc_shorthand = function(d) {return d.properties.DISTRICT_A;},
	loc_name = function(d) {return d.properties.DISTRICT_N;},	
	//tooltip for the map location on mouseover
	maptip,
	//svg element to contain the map
	map_container,
	//map parameters (derived from data)
	map_bounds,
	map_path,
	//
	leaflet,
	locs;

	function usMap() {

		maptip = d3.select("body")
					 .append("div")
					 .attr("class", "tooltip")
					 .attr("id", "map_tip")
					 .style("opacity", 0);

		map_panes = new L.Map("map", {
			center: [37.8, -96.9],
			zoom: zoom_scale
		});

		map_container = d3.select(map_panes.getPanes().overlayPane).append("svg");
		leaflet = map_container.append("g").attr("class", "leaflet-zoom-hide");	

		map_bounds = d3.geo.bounds(map_data_root);
		map_path = d3.geo.path().projection(project);

		locs = leaflet.selectAll("path")
							.data(map_data)
							.enter()
							.append("path")
							.attr("id", loc_shorthand)
							.attr("class", "jds")
							.on("click", function(d) {return list.select_item(loc_shorthand(d));})
							.on("mouseover", show_name)
							.on("mouseout", hide_name);

		map_panes.on("viewreset", reset);
		reset();

	};

	function reset() {
		var bottomLeft = project(map_bounds[0]),
			topRight = project(map_bounds[1]);

		map_container.attr("width", topRight[0] - bottomLeft[0])
				.attr("height", bottomLeft[1] - topRight[1])
				.style("margin-left", bottomLeft[0] + "px")
				.style("margin-top", topRight[1] + "px");

		leaflet.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

		locs.attr("d", map_path);			
	}

	function project(x){
		var point = map_panes.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
		return [point.x, point.y];
	}			

	function show_name(d){
		maptip.transition()
			  .duration(200)
			  .style("opacity", 0.9);
		maptip.html("<div class='tip_head'>" + loc_name(d) + "</div>"
					+ "(" + loc_shorthand(d) + ")")
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 10) + "px");		  
	};

	function hide_name(d){
		maptip.transition()
			  .duration(500)
			  .style("opacity", 0);
	};

	usMap.sel_location = function(curr_col, loc, add){
		leaflet.selectAll("path")
			.filter(function (e, i) {return loc == loc_shorthand(e);})
			.classed("selected", add)
			.style("fill", curr_col);		
	};
	return usMap;
};