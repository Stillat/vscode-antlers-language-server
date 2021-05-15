<?php

namespace Stillat\StatamicAnalyzer;

use Stillat\StatamicAnalyzer\Analyzers\AntlersModifier;
use Stillat\StatamicAnalyzer\Analyzers\AntlersTag;
use Stillat\StatamicAnalyzer\Analyzers\AugmentationContribution;
use Stillat\StatamicAnalyzer\Analyzers\QueryScope;
use Stillat\StatamicAnalyzer\Analyzers\StatamicConfigResults;
use Stillat\StatamicAnalyzer\Analyzers\ViewModel;

class AntlersManifest
{

    /**
     * The project's configuration entries.
     *
     * @var StatamicConfigResults|null
     */
    public $config = null;

    /**
     * @var AntlersTag[]
     */
    public $tags = [];

    /**
     * @var AntlersModifier[]
     */
    public $modifiers = [];

    /**
     * @var AugmentationContribution[]
     */
    public $augmentContributions = [];

    /**
     * @var QueryScope[]
     */
    public $queryScopes = [];

    /**
     * @var ViewModel[]
     */
    public $viewModels = [];

    /**
     *
     * @var PackageManifest[]
     */
    public $packageManifests = [];

}
