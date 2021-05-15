<?php

namespace Stillat\StatamicAnalyzer;

use Stillat\StatamicAnalyzer\Analyzers\ApplicationAnalyzer;
use Stillat\StatamicAnalyzer\Analyzers\StatamicConfigAnalyzer;
use Stillat\StatamicAnalyzer\Utilities\Paths;
use Stillat\StatamicAnalyzer\Utilities\ProjectPaths;

class Analyzer
{

    /**
     * @var ProjectPaths|null
     */
    private $paths = null;

    /**
     * @var AntlersManifest|null
     */
    private $manifest = null;

    public function analyze($directory): AntlersManifest
    {
        $this->manifest = new AntlersManifest();

        $this->paths = Paths::getProjectPaths($directory);

        $this->getConfigurationItems();
        $this->analyzeApp();

        $composerJsonPath = $directory . 'composer.json';
        $composerDetails = json_decode(file_get_contents($composerJsonPath), true);
        $deps = Composer::getRequirePaths($composerDetails, $directory);

        $this->analyzeComposerDependencies($deps, $directory);

        return $this->manifest;
    }

    private function getConfigurationItems()
    {
        $configAnalyzer = new StatamicConfigAnalyzer($this->paths->statamicConfigDirectory);

        $this->manifest->config = $configAnalyzer->analyze();
    }

    private function analyzeApp()
    {
        if (file_exists($this->paths->applicationDirectory) && is_dir($this->paths->applicationDirectory)) {
            $analyzer = new ApplicationAnalyzer($this->paths->applicationDirectory);

            $analyzer->analyze();

            $this->manifest->tags = $analyzer->getAntlersTags();
            $this->manifest->queryScopes = $analyzer->getQueryScopes();
            $this->manifest->modifiers = $analyzer->getModifiers();
            $this->manifest->augmentContributions = $analyzer->getAugmentationContributions();
            $this->manifest->viewModels = $analyzer->getViewModels();
        }
    }

    private function analyzeComposerDependencies($dependencies, $applicationPath)
    {
        $canCache = false;
        $storagePath = $applicationPath.'storage/';
        $cachePath = $storagePath.'antlers-language-server/';

        if (file_exists($storagePath) && is_dir($storagePath)) {
            if (!file_exists($cachePath)) {
                mkdir($cachePath, 0777, true);
            }

            $canCache = file_exists($cachePath) && is_dir($cachePath);
        }

        /** @var ComposerDependency $dep */
        foreach ($dependencies as $dep) {
            $targetComposerPath = $dep->path . 'composer.json';

            if (file_exists($targetComposerPath) && Composer::isStatamicAddon($targetComposerPath) &&
                file_exists($dep->path . 'src/') && is_dir($dep->path . 'src/')) {
                $depCachePath = $cachePath.$dep->cacheHash.'.pcache';

                if ($canCache && file_exists($depCachePath)) {
                    $this->manifest->packageManifests[] = unserialize(file_get_contents($depCachePath));
                    continue;
                }

                $analyzer = new ApplicationAnalyzer($dep->path . 'src/');
                $analyzer->analyze();

                $packageManifest = new PackageManifest();
                $packageManifest->packageName = $dep->name;
                $packageManifest->tags = $analyzer->getAntlersTags();
                $packageManifest->queryScopes = $analyzer->getQueryScopes();
                $packageManifest->modifiers = $analyzer->getModifiers();
                $packageManifest->viewModels = $analyzer->getViewModels();
                $packageManifest->augmentContributions = $analyzer->getAugmentationContributions();

                if ($canCache) {
                    file_put_contents($depCachePath, serialize($packageManifest));
                }

                $this->manifest->packageManifests[] = $packageManifest;
            }
        }
    }

}
