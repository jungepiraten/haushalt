var currentYear = null;
var currentCode = null;

$(function () {
	window.addEventListener("popstate", function (ev) {
		// Firefox ruft den Eventhandler _nicht_ beim Start auf, Chrome schon
		if (!ev.state)
			return

		// "/year/budget/"
		goToBudget(location.pathname.split("/")[1], location.pathname.split("/")[2]);
	});

	$("*[data-budget]").css("cursor","pointer").click(function () {
		goToBudget($(".year").text(), $(this).data("budget") + "");
	});

	goToBudget(location.pathname.split("/")[1], location.pathname.split("/")[2]);
});

function goToBudget(year, code) {
	if (!isValidYear(year)) {
		year = "2014";
	}

	if (!isValidCode(year, code)) {
		code = "40000";
	}

	// Change URL if needed
	if (year != currentYear || code != currentCode) {
		window.history.ready = true;
		window.history.pushState(null, null, "/" + year + "/" + code + (code == "" ? "" : "/"));
	}
	currentYear = year;
	currentCode = code;

	clearView();

	initView(year, code);
	$(".haushaltNav.budget-" + code.substring(0,1)).addClass("active");
	$(".haushaltNav.budget-" + code.substring(0,2)).addClass("active");
}

function isValidYear(year) {
	return $.inArray(year, ["2013", "2014"]) == 0;
}

function isValidCode(year, code) {
	if (!code) {
		return false;
	}
	if (year == "2013") {
		return code.length == 5 && !isNaN(code);
	}
	if (year == "2014") {
		return code.length >= 3;
	}
	return false;
}
