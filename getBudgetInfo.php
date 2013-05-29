<?php

$memcache = new Memcache();
$memcache->addServer("storage");
$kontoCache = array();
function getKontoInfo($year, $konto) {
	global $kontoCache, $memcache;

	if (!isset($kontoCache[$year."-".$konto]) || $kontoCache[$year."-".$konto] == null) {
		$kontoCache[$year."-".$konto] = unserialize($memcache->get("haushalt-" . $year . "-" . $konto));
	}
	if (!isset($kontoCache[$year."-".$konto]) || $kontoCache[$year."-".$konto] == null) {
		$kontoCache[$year."-".$konto] = unserialize(file_get_contents("http://opendata.junge-piraten.de/konten/" . $year . "/" . $konto . "/info.php"));
		foreach ($kontoCache[$year."-".$konto]["subaccounts"] as $subaccount) {
			$subinfo = getKontoInfo($year, $subaccount);
			$kontoCache[$year."-".$konto]["debit"] += $subinfo["debit"];
			$kontoCache[$year."-".$konto]["credit"] += $subinfo["credit"];
			$kontoCache[$year."-".$konto]["balance"] += $subinfo["balance"];
		}
		$memcache->set("haushalt-" . $year . "-" . $konto, serialize($kontoCache[$year."-".$konto]), 0, 6*60*60);
	}
	return $kontoCache[$year."-".$konto];
}

$year = $_REQUEST["year"];
$kontoInfo = getKontoInfo($year, $_REQUEST["code"]);

$info = array(
	"code" => $kontoInfo["code"],
	"parentCode" => $kontoInfo["parentCode"],
	"label" => $kontoInfo["label"],
	"description" => $kontoInfo["description"],
	"value" => $kontoInfo["credit"] - $kontoInfo["debit"],
	"subaccounts" => array()
);

foreach ($kontoInfo["subaccounts"] as $subAccountCode) {
	$subAccountInfo = getKontoInfo($year, $subAccountCode);

	$info["subaccounts"][] = array(
		"code" => $subAccountCode,
		"label" => $subAccountInfo["label"],
		"description" => $subAccountInfo["description"],
		"value" => $subAccountInfo["balance"],
		"hasSubAccounts" => !empty($subAccountInfo["subaccounts"])
	);
}

header("Content-Type: application/json; charset=utf-8");
print(json_encode($info));

?>
