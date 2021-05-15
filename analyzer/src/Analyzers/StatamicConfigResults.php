<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

class StatamicConfigResults
{
    /**
     * The project's asset presets.
     *
     * @var string[]
     */
    public $assetPresets = [];

    /**
     * The project's site names.
     *
     * @var string[]
     */
    public $siteNames = [];

    /**
     * The project's OAuth providers.
     *
     * @var string[]
     */
    public $oauthProviders= [];

    /**
     * The project's search indexes.
     *
     * @var string[]
     */
    public $searchIndexes = [];

}
