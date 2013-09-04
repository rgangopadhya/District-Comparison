D3 Matrix scatterplot linked to geography:

Example: (http://rgangopadhya.github.io/District-Comparison/)

Uses a matrix scatterplot where points are geographic regions linked to a map to allow for easy selection. Each cell represents the characteristics of a particular service type, with each point in the cell a particular district.  Districts can be highlighted to quickly scan through the matrix for that district to see how the district compares in terms of utilization volume/intensity.  The notion of volume/intensity can be varied by using the dropdown menus above the matrix. 

Takes the ideas of http://bl.ocks.org/mbostock/4063663, but (in this particular application) instead of looking at correlation between variables, this compares utilization volume/intensity for a given service by region.  

Behind the scenes, this applies closures (as suggested in http://bost.ocks.org/mike/chart/) to organize the code more cleanly.  Some work still needs to be done to abstract the core functionality, as there are implicit dependencies between each object (these can be made explicit by creating a setter/getter function for the variables relating to the dependency, and requiring these to be set on creation of the function).
