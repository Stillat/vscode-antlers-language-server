<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

use Illuminate\Support\Str;
use PhpParser\Node;
use Stillat\StatamicAnalyzer\Utilities\NodeHelpers;
use Stillat\StatamicAnalyzer\Utilities\StringUtilities;

class AugmentationAnalyzer
{
    const PREFIX_COLLECTION = '@collection';
    const PREFIX_BLUEPRINT = '@blueprint';
    const PREFIX_RETURNS = '@returns';

    public static $knownAugmentationEntryPoints = [
        'Statamic\\Entries\\AugmentedEntry'
    ];

    private function getCollectionsAndBlueprints(Node $node)
    {
        $docBlock = $node->getDocComment();

        if ($docBlock == null) {
            return [[], []];
        }

        $lines = StringUtilities::breakDocBlock($docBlock->getText());
        $blueprints = [];
        $collections = [];

        foreach ($lines as $line) {
            if (Str::startsWith($line, self::PREFIX_BLUEPRINT)) {
                $parseLine = trim(mb_substr($line, strlen(self::PREFIX_BLUEPRINT)));
                $blueprints = explode('|', $parseLine);
            } else if (Str::startsWith($line, self::PREFIX_COLLECTION)) {
                $parseLine = trim(mb_substr($line, strlen(self::PREFIX_COLLECTION)));
                $collections = explode('|', $parseLine);
            }
        }

        return [$blueprints, $collections];
    }

    private function getAugmentedField(Node\Stmt\ClassMethod  $method)
    {
        if ($method->name == null || $method->name instanceof Node\Identifier == false) {
            return null;
        }

        if (!NodeHelpers::shouldParse($method)) {
            return null;
        }

        $field = new AugmentedField();
        $field->name = Str::snake($method->name->name);

        $description = '';

        $docBlock = $method->getDocComment();

        if ($docBlock != null) {
            $lines = StringUtilities::breakDocBlock($docBlock->getText());
            $hasFoundDesc = false;

            foreach ($lines as $line) {

                if (Str::startsWith($line, '@')) {
                    $hasFoundDesc = true;
                }

                if (!$hasFoundDesc) {
                    if (strlen(trim($line)) > 0 && strlen(trim($description)) == 0) {
                        $description = $line;
                    } else {
                        $description .= "\n".$line;
                    }
                }

                if (Str::startsWith($line, self::PREFIX_RETURNS)) {
                    $field->returnTypes = explode('|', trim(mb_substr($line, strlen(self::PREFIX_RETURNS))));
                }
            }

        }

        $field->description = trim($description);

        return $field;
    }

    /**
     * @param array $nodes
     * @param string $targetClassName
     * @param string $sourceFile
     * @return AugmentationContribution
     */
    public function analyze(array $nodes, string $targetClassName, string $sourceFile)
    {
        $augmentClass = NodeHelpers::extractClass($nodes, $targetClassName);

        if (!NodeHelpers::shouldParse($augmentClass)) {
            return null;
        }

        $publicMethods = NodeHelpers::extractPublicClassMethods($augmentClass->stmts);
        $appliesTo = $this->getCollectionsAndBlueprints($augmentClass);

        $contribution = new AugmentationContribution();
        $contribution->blueprints = $appliesTo[0];
        $contribution->collections = $appliesTo[1];
        $contribution->sourceFile = $sourceFile;
        $contribution->name = $targetClassName;
        $contribution->description = NodeHelpers::findDescription($augmentClass);

        foreach ($publicMethods as $method) {
            $field = $this->getAugmentedField($method);

            if ($field != null) {
                $contribution->fields[] = $field;
            }
        }

        return $contribution;
    }

    /**
     * @param Node[] $nodes
     * @return bool
     */
    public static function shouldAnalyze(array $nodes): bool
    {
        return NodeHelpers::doesExtend($nodes, self::$knownAugmentationEntryPoints);
    }

}
