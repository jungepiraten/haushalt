<?php

require_once("getBudgetInfo.inc.php");

$year = $_REQUEST["year"];
$kontoInfo = getKontoInfo($year, $_REQUEST["code"]);

$info = array(
	"code" => $kontoInfo["code"],
	"parentCode" => $kontoInfo["parentCode"],
	"label" => $kontoInfo["label"],
	"description" => $kontoInfo["description"],
	"value" => $kontoInfo["sum-balance"],
	"subaccounts" => array()
);

foreach ($kontoInfo["subaccounts"] as $subAccountCode) {
	$subAccountInfo = getKontoInfo($year, $subAccountCode);

	$info["subaccounts"][] = array(
		"code" => $subAccountCode,
		"label" => $subAccountInfo["label"],
		"description" => $subAccountInfo["description"],
		"value" => $subAccountInfo["sum-balance"],
		"hasSubAccounts" => !empty($subAccountInfo["subaccounts"])
	);
}

header("Content-Type: application/json; charset=utf-8");
print(json_encode($info));

?>
