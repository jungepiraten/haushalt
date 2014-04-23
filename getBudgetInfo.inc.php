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
		$memcache->set("haushalt-" . $year . "-" . $konto, serialize($kontoCache[$year."-".$konto]), 0, 3*60*60);
	}
	return $kontoCache[$year."-".$konto];
}
