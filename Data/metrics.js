//declare y, x metrics
var y_metrics = [{"var":"norm_perc_pop","type":"percent","alias":"Percent of Part B Population"}, 
				{"var":"norm_cost_per_rec","type":"cost","alias":"Cost Per Patient Receiving"},
				{"var":"norm_scost_per_rec","type":"cost","alias":"Standardized Cost Per Patient Receiving"},
				{"var":"norm_procs_per_rec","type":"number","alias":"Procedures Per Patient Receiving"},
				{"var":"norm_cost_per_enr","type":"cost","alias":"Cost Per Part B Enrollee"},
				{"var":"norm_scost_per_enr","type":"cost","alias":"Standardized Cost Per Part B Enrollee"},
				{"var":"norm_procs_per_enr","type":"number","alias":"Procedures Per Part B Enrollee"}];
var x_metrics= [{"var":"norm_tot_cost","type":"cost","alias":"Cost"},
				{"var":"norm_tot_scost","type":"cost","alias":"Standardized Cost"},
				{"var":"norm_num_bens","type":"number","alias":"Number of Patients Receiving"},
				{"var":"norm_num_lines","type":"number","alias":"Number of Lines"},	{"var":"norm_num_procs","type":"number","alias":"Number of Procedures"}];