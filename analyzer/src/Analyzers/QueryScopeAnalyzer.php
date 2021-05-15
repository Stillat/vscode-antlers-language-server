<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

use Illuminate\Support\Str;
use Stillat\StatamicAnalyzer\Utilities\NodeHelpers;

class QueryScopeAnalyzer
{
    public static $knownQueryScopeBaseClasses = [
        'Statamic\\Query\\Scopes\\Scope'
    ];

    public function analyze(array $nodes, string $targetClassName, string $sourceFile)
    {
        $sourceScope = NodeHelpers::extractClass($nodes, $targetClassName);

        if (!NodeHelpers::shouldParse($sourceScope)) {
            return null;
        }

        $scope = new QueryScope();

        $scope->sourceFile = $sourceFile;
        $scope->name = Str::snake($targetClassName);
        $scope->description = NodeHelpers::findDescription($sourceScope);

        return $scope;
    }

    public static function shouldAnalyze(array $nodes): bool
    {
        return NodeHelpers::doesExtend($nodes, self::$knownQueryScopeBaseClasses);
    }

}