var currentVizData = null;

function viz_hide() {
	$(".visualisation").empty().hide();
	currentVizData = null;
}

function viz_load(data) {
	$(".visualisation").show();
	var width = $(".visualisation").width(),
	    height = $(".visualisation").height();

	var color = d3.scale.category20c();

	var div = d3.select(".visualisation")
		.style("position", "relative");

	var treemap = d3.layout.treemap()
		.size([width, height])
		.sticky(true)
		.sort(function(a,b) { return Math.abs(a.value) - Math.abs(b.value); })
		.round(true)
		.value(function(d) { return Math.abs(d.value); });

	div.data([{"label":"Gesamt","children": data,"description":""}]).selectAll("div").data(treemap.nodes).enter()
		.append("div")
			.style("background", function(d) {return color(d.label);})
			.on("click",function(d) {
				if (d.hasSubAccounts) {
					goToBudget(d.code);
				}
			}, true)
			.style("position", "absolute")
			.style("border", "1px solid #9a9a9a")
			.style("overflow", "hidden")
			.style("padding", "5px")
			.style("cursor", function(d) {return (d.hasSubAccounts ? "pointer" : "");})
			.style("display", function(d) {return (d.value > 1 ? "block":"none");})
			.style("left", function(d) {return Math.max(0,d.x) + "px";})
			.style("top", function(d) {return Math.max(0,d.y) + "px";})
			.style("width", function(d) {return Math.max(0,d.dx-1-10) + "px";})
			.style("height", function(d) {return Math.max(0,d.dy-1-10) + "px";})
			.text(function(d) {return d.label;})
			.attr("title", function (d) {return d.label + " (" + d.value.toFixed(2) + " EUR)" + "\n" + d.description;});

	currentVizData = data;
}

$(window).resize(function() {
	if (currentVizData != null) {
		var vizData = currentVizData;
		viz_hide();
		viz_load(vizData);
	}
});
