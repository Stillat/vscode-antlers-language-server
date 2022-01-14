<?php

require_once 'shims.php';
require_once 'vendor/autoload.php';

use Stillat\StatamicAnalyzer\Analyzer;
use Stillat\StatamicAnalyzer\Utilities\Paths;

$args = $_SERVER['argv'];

if (count($args) != 2) {
    return;
}

$applicationPath = \Illuminate\Support\Str::finish(Paths::normalizeDirectoryPath(trim($args[1], "'")), '/');

if (!file_exists($applicationPath) || !is_dir($applicationPath)) {
    return;
}

$storagePath = $applicationPath.'storage/framework/cache/antlers-language-server/';

if (!file_exists($storagePath)) {
    @mkdir($storagePath, 0755, true);
}

try {

    $composerPath = $applicationPath.'composer.json';
    $targetManifest = $storagePath.'.antlers.json';

    if (!file_exists($composerPath)) {
        return;
    }

    $analyzer = new Analyzer();

    $manifest = $analyzer->analyze($applicationPath);


    file_put_contents($targetManifest, json_encode($manifest));
} catch (Exception $e) {
    $errorPath = $storagePath.'error_'.time().'.json';
    file_put_contents($errorPath, json_encode($e));
}
