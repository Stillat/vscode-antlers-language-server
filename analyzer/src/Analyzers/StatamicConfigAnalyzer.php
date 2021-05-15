<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

use Illuminate\Support\Arr;

class StatamicConfigAnalyzer
{
    const ASSETS = 'assets.php';
    const OAUTH = 'oauth.php';
    const SEARCH = 'search.php';
    const SITES = 'sites.php';

    private $statamicConfigDirectory = '';

    public function __construct($statamicConfigDirectory)
    {
        $this->statamicConfigDirectory = $statamicConfigDirectory;
    }

    public function analyze() : StatamicConfigResults
    {
        $results = new StatamicConfigResults();

        if (!file_exists($this->statamicConfigDirectory) || !is_dir($this->statamicConfigDirectory)) {
            return $results;
        }

        $assetsPath = $this->statamicConfigDirectory.self::ASSETS;
        $oauthPath = $this->statamicConfigDirectory.self::OAUTH;
        $searchPath = $this->statamicConfigDirectory.self::SEARCH;
        $sitesPath = $this->statamicConfigDirectory.self::SITES;

        if (file_exists($assetsPath)) {
            $assetConfig = require_once $assetsPath;

            if (is_array($assetConfig)) {
                $results->assetPresets = array_keys(Arr::get($assetConfig, 'image_manipulation.presets', []));
            }
        }

        if (file_exists($oauthPath)) {
            $oauthConfig = require_once $oauthPath;

            if (is_array($oauthConfig)) {
                $results->oauthProviders = Arr::get($oauthConfig, 'providers', []);
            }
        }

        if (file_exists($searchPath)) {
            $searchConfig = require_once $searchPath;

            if (is_array($searchConfig)) {
                $results->searchIndexes = array_keys(Arr::get($searchConfig, 'indexes', []));
            }
        }

        if (file_exists($sitesPath)) {
            $sitesConfig = require_once $sitesPath;

            if (is_array($sitesConfig)) {
                $results->siteNames = array_keys(Arr::get($sitesConfig, 'sites', []));
            }
        }

        return $results;
    }

}
