<?php

namespace Stillat\StatamicAnalyzer;

use Stillat\StatamicAnalyzer\Analyzers\AntlersModifier;
use Stillat\StatamicAnalyzer\Analyzers\AntlersTag;
use Stillat\StatamicAnalyzer\Analyzers\AugmentationContribution;
use Stillat\StatamicAnalyzer\Analyzers\QueryScope;
use Stillat\StatamicAnalyzer\Analyzers\ViewModel;

class PackageManifest
{

    /**
     * The package name.
     *
     * @var string
     */
    public $packageName = '';

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

}
