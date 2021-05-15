<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

use PhpParser\Node;
use Stillat\StatamicAnalyzer\Utilities\NodeHelpers;

class ViewModelAnalyzer
{
    protected static $knownViewModelBaseClasses = [
        'Statamic\\View\\ViewModel'
    ];

    public function analyze(array $nodes, string $targetClassName, string $sourceFile)
    {
        $class = NodeHelpers::extractClass($nodes, $targetClassName);

        if (!NodeHelpers::shouldParse($class)) {
            return null;
        }

        $dataMethod = NodeHelpers::findMethod($class->stmts, 'data');
        $returnStatement = null;

        foreach ($dataMethod->stmts as $stmt) {
            if ($stmt instanceof Node\Stmt\Return_) {
                $returnStatement = $stmt;
                break;
            }
        }

        if ($returnStatement == null) {
            return null;
        }

        if ($returnStatement->expr == null || ($returnStatement->expr instanceof Node\Expr\Array_) == false) {
            return null;
        }

        $arrayKeys = NodeHelpers::getArrayKeyNames($returnStatement->expr);

        $fqn = NodeHelpers::getFqn($nodes, $targetClassName);

        $viewModel = new ViewModel();

        $viewModel->name = $targetClassName;
        $viewModel->fqn = $fqn;
        $viewModel->fields = $arrayKeys;
        $viewModel->sourceFile = $sourceFile;

        return $viewModel;
    }

    /**
     * @param Node[] $nodes
     * @return bool
     */
    public static function shouldAnalyze(array $nodes): bool
    {
        return NodeHelpers::doesExtend($nodes, self::$knownViewModelBaseClasses);
    }

}