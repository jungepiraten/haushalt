var currentVizYear = null;
var currentVizData = null;

var color = d3.scale.category20();

function viz_color(account) {
	return color(account.code);
}

function viz_hide() {
	$(".visualisation").empty().hide();
	currentVizYear = null;
	currentVizData = null;
}

function viz_load(year, data) {
	color = d3.scale.category20();

	currentVizYear = year;
	currentVizData = data;

	var subaccounts = data.subaccounts;

	$(".visualisation").show();
	var width = $(".visualisation").width(),
	    height = $(".visualisation").height();

	var treemap = d3.layout.treemap()
		.size([width, height])
		.sticky(true)
		.sort(function(a,b) { return Math.abs(a.value) - Math.abs(b.value); })
		.round(true)
		.value(function(d) { return Math.abs(d.value); });

	d3.select(".visualisation").style("position", "relative").data([{"label":data.label,"children": subaccounts,"description":data.description}]).selectAll("div")
	   .data(treemap.nodes).enter()
		.append("div")
			.style("background", function(d) {return viz_color(d);})
			.on("click",function(d) {
				if (d.hasSubAccounts) {
					goToBudget(year, d.code);
				}
			}, true)
			.style("box-sizing", "border-box")
			.style("position", "absolute")
			.style("border", "1px solid #9a9a9a")
			.style("overflow", "hidden")
			.style("padding", "5px")
			.style("cursor", function(d) {return (d.hasSubAccounts ? "pointer" : "");})
			.style("left", function(d) {return Math.max(0,d.x) + "px";})
			.style("top", function(d) {return Math.max(0,d.y) + "px";})
			.style("width", function(d) {return Math.max(0,d.dx+1) + "px";})
			.style("height", function(d) {return Math.max(0,d.dy+1) + "px";})
			.text(function(d) {return d.label;})
			.attr("title", function (d) {return d.label + " (" + formatCurrency(d.value) + ")" + "\n" + d.description;});
}

$(window).resize(function() {
	if (currentYear != null && currentVizData != null) {
		var year = currentVizYear;
		var vizData = currentVizData;
		viz_hide();
		viz_load(year, vizData);
	}
});
