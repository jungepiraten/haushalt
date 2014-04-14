var currentRequest = false;

var _nav = {
	"2013": {"3": "Erträge", "4": "Aufwendungen", "11": "Forderungen", "21": "Verpflichtungen", "12": "Barvermögen"}
};

function formatCurrency(value) {
	if (value == 0) {
		return "-";
	}

	if (value.toString().length > 4) {
		return value + " EUR";
	}

	var units = [
		{ unit: "EUR",
		  fixed: 2 },
		{ unit: "Tsd EUR",
		  fixed: 1 },
		{ unit: "Mio EUR",
		  fixed: 1 },
		{ unit: "Mrd EUR",
		  fixed: 1 } ];
	var curUnit = 0;

	while (Math.abs(value) > 1500 && curUnit < units.length-1) {
		value /= 1000;
		curUnit++;
	}

	return value.toFixed(units[curUnit].fixed) + " " + units[curUnit].unit;
}


function clearView() {
	$("title").text("Junge Piraten Haushalt");
	$(".haushaltNav").removeClass("active");
	$(".parentBudget").addClass("disabled").unbind("click");
	$(".exportJson").attr("href","#");
	$(".subBudgets tbody").empty();
	$(".ktoNav").empty();

	viz_hide();
}

function initView(year, budgetCode) {
	if (currentRequest != false) {
		currentRequest.abort();
	}
	currentRequest = $.ajax({
		type: "GET",
		url: "/getBudgetInfo.php?year=" + year + "&code=" + budgetCode,
		success: function(data) {
			$(".year").text(year);
			for (var ktoPrefix in _nav[year]) {
				var kto = ktoPrefix + "00000".substring(0, 5-ktoPrefix.length);
				var item = $("<li>").addClass("haushaltNav").addClass("budget-" + ktoPrefix)
					.append($("<a>")
					.data("kto",kto)
					.click(function () {
						goToBudget(year,$(this).data("kto"));
					}).text(_nav[year][ktoPrefix]));
				$(".ktoNav").append(item);
			}

			if (data.label == null) {
				$(".budgetLabel").text("(Unbekannt)");
				$(".subBudgets tbody").append($("<tr>")
					.append($("<td>").attr("colspan","3").text("Unbekannte Budgetnummer"))
				);
				return;
			}
			if (data.parentCode) {
				$(".parentBudget").removeClass("disabled").click(function () {
					goToBudget(data.parentCode);
				});
			}
			$(".budgetLabel").text(data.label);
			$(".budgetDescription").text(data.description);
			$(".budgetValue").text(formatCurrency(Math.abs(data.value)));
			$(".exportJson").attr("href","http://opendata.junge-piraten.de/konten/" + year + "/" + data.code + "/info.json");
			$("title").text(data.label + " – Junge Piraten Haushalt " + year);

			if (data.subaccounts.length == 0) {
				$(".subBudgets tbody").append($("<tr>")
					.append($("<td>").attr("colspan","3").text("Keine Unterbudgets vorhanden"))
				);
			} else {
				data.subaccounts.sort(function (a, b) {
					return a.code - b.code;
				});

				// Div by 0 otherwise
				if (data.value != 0) {
					viz_load(year, data);
				}

				for (var i in data.subaccounts) {
					var subAccount = data.subaccounts[i];
					$(".subBudgets tbody").append($("<tr>").css("cursor",(subAccount.hasSubAccounts ? "pointer" : "")).addClass("subBudget-" + subAccount.code)
						.data("code", subAccount.code)
						.data("hasSubAccounts", subAccount.hasSubAccounts)
						.attr("title", subAccount.description + "")
						.append($("<td>")
							.append($("<div>").addClass("viz-icon").css({
								width: "16px",
								height: "16px",
								border: "1px solid black",
								background: viz_color(subAccount),
								float: "left",
								marginRight: "5px"
							}).text(" "))
							.append(subAccount.label) )
						.append($("<td>").text(formatCurrency(Math.abs(subAccount.value))))
						.append($("<td>").text((data.value == 0 ? " - " : Math.abs(subAccount.value / data.value * 100).toFixed(2) + " %")))
						.click(function() {
							if ($(this).data("hasSubAccounts")) {
								goToBudget($(this).data("code"));
							}
						})
					);
				}
			}
		}
	});
}
