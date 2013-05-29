var year = "2013";

function clearView() {
	$("title").text("Junge Piraten Haushalt");
	$(".haushaltNav").removeClass("active");
	$(".parentBudget").addClass("disabled").unbind("click");
	$(".exportJson").attr("href","#");
	$(".subBudgets tbody").empty();

	viz_hide();
}

function initView(budgetCode) {
	$.ajax({
		type: "GET",
		url: "/getBudgetInfo.php?year=" + year + "&code=" + budgetCode,
		success: function(data) {
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
			$(".budgetValue").text(Math.abs(data.value).toFixed(2) + " EUR");
			$(".exportJson").attr("href","http://opendata.junge-piraten.de/konten/" + year + "/" + data.code + "/info.json");
			$("title").text(data.label + " – Junge Piraten Haushalt");

			if (data.subaccounts.length == 0) {
				$(".subBudgets tbody").append($("<tr>")
					.append($("<td>").attr("colspan","3").text("Keine Unterbudgets vorhanden"))
				);
			} else {
				data.subaccounts.sort(function (a, b) {
					return a.code - b.code;
				});
				for (var i in data.subaccounts) {
					var subAccount = data.subaccounts[i];
					$(".subBudgets tbody").append($("<tr>").css("cursor",(subAccount.hasSubAccounts ? "pointer" : ""))
						.data("code", subAccount.code)
						.data("hasSubAccounts", subAccount.hasSubAccounts)
						.attr("title", subAccount.description + "")
						.append($("<td>").text(subAccount.label))
						.append($("<td>").text(Math.abs(subAccount.value).toFixed(2) + " EUR"))
						.append($("<td>").text((data.value == 0 ? " - " : (subAccount.value / data.value * 100).toFixed(2) + " %")))
						.click(function() {
							if ($(this).data("hasSubAccounts")) {
								goToBudget($(this).data("code"));
							}
						})
					);
				}
				// Div by 0 otherwise
				if (data.value != 0) {
					viz_load(data.subaccounts);
				}
			}
		}
	});
}
