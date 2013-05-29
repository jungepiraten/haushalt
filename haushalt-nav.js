var currentCode = null;

$(function () {
	window.addEventListener("popstate", function (ev) {
		// Firefox ruft den Eventhandler _nicht_ beim Start auf, Chrome schon
		if (!ev.state)
			return

		// "/budget/"
		goToBudget(location.pathname.substring(1,6));
	});

	$("*[data-budget]").css("cursor","pointer").click(function () {
		goToBudget($(this).data("budget") + "");
	});

	goToBudget(location.pathname.substring(1,6));
});

function goToBudget(code) {
	if (!isValidCode(code)) {
		code = "40000";
	}

	// Change URL if needed
	if (code != currentCode) {
		window.history.ready = true;
		window.history.pushState(null, null, "/" + code + (code == "" ? "" : "/"));
	}
	currentCode = code;

	clearView();

	initView(code);
	$(".haushaltNav.budget-" + code.substring(0,1)).addClass("active");
	$(".haushaltNav.budget-" + code.substring(0,2)).addClass("active");
}

function isValidCode(code) {
	return code.length == 5 && !isNaN(code);
}
