function filter_cpt(curr_select) {
	return function(element, index, array) {
		return element.cptgroup==curr_select;
	}
};

function num_format(value, type){
	var to_output;
	var perc=d3.format("0,.2p");
	var numb=d3.format("0,.3s");
	var ab=d3.format("0,.2f");
	if (type=="percent") {
		to_output=perc(value);
	}
	else if (type=="cost"){
		to_output="$"+ convert_si(numb(value));
	}
	else if (type=="number"){
		to_output=convert_si(numb(value));
	}
	else if (type=="norm"){
		to_output=Math.abs(ab(value));
	}
	return to_output;
};

function convert_si(fmt_str){
	fmt_str=fmt_str.replace("M"," Million");
	fmt_str=fmt_str.replace("G"," Billion");

	return fmt_str;
};

function norm_format(value) {
	var ret="below"
	if (value>0) {
		ret="above"
	}
	return ret;
};

