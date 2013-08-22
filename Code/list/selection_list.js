//this encapsulates the list of locations selected, and displays them appropriately
//this also handles the coloring scheme for the list, which can be passed to other display elements
function selectionList(){

	var 
		// the containing svg
		sel_container,
		//the array of selected items
		sel_list,
		//the current color of the most recently added item
		curr_col,
		//the maximum number of items that could be added to the list
		list_max = 93,
		//sizing parameters
		list_space = 25,
		list_col_xpos = 0,
		list_name_xpos = 25,
		list_scale = d3.scale.linear().range([0, list_space * (list_max - 1)]).domain([0, list_max - 1]),
		//process colorbrewer colors a bit, set up color scale
		col_set = d3.merge([colorbrewer["Set3"][12].slice(0, 1), colorbrewer["Set3"][12].slice(2, 8), colorbrewer["Set3"][12].slice(9)]),
		col_num = col_set.length,	
		color = d3.scale.ordinal().range(col_set)
		button_id = "#clear_button";

	//initialize list, populate in selection	
	function list(selection) {
		sel_list = [];
		curr_col = 0;
		sel_container = selection.append("svg")
								.attr("height", list_space * sel_list.length)
				  				.attr("width", 50);
		d3.select(button_id)
			.on("click", list.clear_list);
	};	

	function update_list(){
		//add jd to the list, using the specified color
		sel_container.attr("height", list_space * sel_list.length);

		var slist = sel_container.selectAll("g")
						 .data(sel_list, function(d) {return d.itemid;});

		var listEnter = slist.enter()
				          	.append("g")
				          	.attr("width",60)
				          	.attr("height",20)
				 		  	.attr("transform",function(d, i) {return "translate(0," + list_scale(i) + ")";});		 				 

		listEnter.append("rect")
			     .attr("x", list_col_xpos)
			     .attr("height", 20)
			     .attr("width", 20)
			     .style("fill", color(curr_col))
			     .on("click", function(d) {return list.select_item(d.itemid)});

		listEnter.append("text")
				 .attr("x", list_name_xpos)
				 .attr("y", 14)
				 .style("text-align", "center")
				 .text(function(d) {return d.itemid;});

		var listUpdate=d3.transition(slist)
						 .attr("transform",function(d, i) {return "translate(0," + list_scale(i) + ")";});

		var listExit=d3.transition(slist.exit()).remove();				 		 	     		 
	};

	list.clear_list = function() {
		sel_list.forEach(function(item){
			list.select_item(item.itemid);
		});
		curr_col=0;
	};

	list.select_item = function(item_name) {
		//add or remove selected jd from the stack
		if(!sel_list.some(function(e, i){return item_name == e.itemid})) {
			sel_list.push({"itemid": item_name, "col_index": curr_col});
			
			//call functions relating to the list update

			chart.sel_circle(list.colmap()(curr_col), item_name, 1);
			mapHandler.sel_location(list.colmap()(curr_col), item_name, 1);
			update_list();

			//update color
			curr_col = (curr_col + 1) % col_num;
		}
		else {
			//if removing from end, decrement index, otherwise, dont
			if (sel_list.slice(-1)[0].itemid == item_name) {
				curr_col = (curr_col - 1) % col_num;
			}

			sel_list = sel_list.filter(function (e, i) { return item_name != e.itemid;});

			update_list();

			chart.sel_circle(null, item_name, 0);
			mapHandler.sel_location(null, item_name, 0);			   
		}

		//if JD_stack empty, then disable button, otherwise enable
		if (sel_list.length == 0) {
			d3.select(button_id).attr("disabled", "disabled");
			chart.clear_top();
		}
		else {
			d3.select(button_id).attr("disabled", null);
			chart.clear_top();
			chart.id_top_scatter();
		}		
	};

	//this is a getter/setter function for the selection list (used primarily to return the current list)
	list.items = function(_) {
		if (!arguments.length) return sel_list;
		sel_list = _;
		return list;
	};	

	//setter/getter for the colormap to be used on the list
	list.colmap = function(_) {
		if (!arguments.length) return color;
		color = _;
		return list;
	};

	return list;				  
};