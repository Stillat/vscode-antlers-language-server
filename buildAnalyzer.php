<?php

$pharLocation = __DIR__.'/analyzer.phar';

if (file_exists($pharLocation)) {
	unlink($pharLocation);
}

$phar = new \Phar($pharLocation);
$phar->startBuffering();
$phar->addFile(__DIR__.'/analyzer/index.php');
$phar->addFile(__DIR__.'/analyzer/composer.json');
$phar->addFile(__DIR__.'/analyzer/composer.lock');
$phar->buildFromDirectory(__DIR__.'/analyzer');

$phar->stopBuffering();

if (file_exists(__DIR__.'/server/out/')) {
	copy($pharLocation, __DIR__.'/server/out/analyzer.phar');	
}
