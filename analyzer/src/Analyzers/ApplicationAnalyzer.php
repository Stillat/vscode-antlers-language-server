<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

use Illuminate\Support\Str;
use PhpParser\Lexer\Emulative;
use PhpParser\Parser\Php7;
use Stillat\StatamicAnalyzer\Traverser\Directory;
use Stillat\StatamicAnalyzer\Utilities\Paths;

class ApplicationAnalyzer
{

    private $directory = '';
    private $files = [];
    private $lexer = null;
    private $parser = null;
    private $parseResults = [];
    private $antlersTags = [];
    private $queryScopes = [];
    private $modifiers = [];
    private $augmentContributions = [];
    private $viewModels = [];

    public function __construct($directory)
    {
        $this->directory = $directory;
        $this->files = Directory::getFiles($this->directory);

        $this->lexer = new Emulative([
            'usedAttributes' => [
                'comments',
                'startLine', 'endLine',
                'startTokenPos', 'endTokenPos',
            ],
        ]);

        $this->parser = new Php7($this->lexer);
    }

    public function analyze()
    {
        foreach ($this->files as $file) {
            $fileName = basename($file);


            if (Str::endsWith($fileName, '.php')) {
                $contents = file_get_contents($file);

                $this->parseResults[$file] = $this->parser->parse($contents);
            }
        }

        foreach ($this->parseResults as $filePath => $nodes) {
            Discovery::scanForAdditionalBaseClasses($nodes, $filePath);
        }

        foreach ($this->parseResults as $filePath => $result) {
            $targetClassName = Paths::getFileName($filePath);

            if (TagAnalyzer::shouldAnalyze($result)) {
                $tagAnalyzer = new TagAnalyzer();
                $tags = $tagAnalyzer->analyze($result, $targetClassName, $filePath);

                if ($tags != null) {
                    $this->antlersTags = array_merge($this->antlersTags, $tags);
                }
            } else if (QueryScopeAnalyzer::shouldAnalyze($result)) {
                $queryScopeAnalyzer = new QueryScopeAnalyzer();
                $scope = $queryScopeAnalyzer->analyze($result, $targetClassName, $filePath);

                if ($scope != null) {
                    $this->queryScopes[] = $scope;
                }
            } else if (ModifierAnalyzer::shouldAnalyze($result)) {
                $modifierAnalyzer = new ModifierAnalyzer();
                $modifier = $modifierAnalyzer->analyze($result, $targetClassName, $filePath);

                if ($modifier != null) {
                    $this->modifiers[] = $modifier;
                }
            } else if (AugmentationAnalyzer::shouldAnalyze($result)) {
                $augmentationAnalyzer = new AugmentationAnalyzer();
                $contribution = $augmentationAnalyzer->analyze($result, $targetClassName, $filePath);

                if ($contribution != null) {
                    $this->augmentContributions[] = $contribution;
                }
            } else if (ViewModelAnalyzer::shouldAnalyze($result)) {
                $viewModelAnalyzer = new ViewModelAnalyzer();
                $viewModel = $viewModelAnalyzer->analyze($result, $targetClassName, $filePath);

                if ($viewModel != null) {
                    $this->viewModels[] = $viewModel;
                }
            }
        }
    }

    /**
     * @return AntlersTag[]
     */
    public function getAntlersTags()
    {
        return $this->antlersTags;
    }

    /**
     * @return QueryScope[]
     */
    public function getQueryScopes()
    {
        return $this->queryScopes;
    }

    public function getModifiers()
    {
        return $this->modifiers;
    }

    public function getAugmentationContributions()
    {
        return $this->augmentContributions;
    }

    public function getViewModels()
    {
        return $this->viewModels;
    }

}
