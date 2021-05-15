<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

use Illuminate\Support\Str;
use PhpParser\Node;
use Stillat\StatamicAnalyzer\Utilities\NodeHelpers;
use Stillat\StatamicAnalyzer\Utilities\StringUtilities;

class ModifierAnalyzer
{
    const PREFIX_PARAM = '@input';
    const PREFIX_PARAM_REQUIRED = '@input*';
    const PREFIX_ALIAS = '@alias';
    const PREFIX_ACCEPTS = '@accepts';
    const PREFIX_RETURNS = '@returns';

    public static $knownModifierBaseClasses = [
        'Statamic\\Modifiers\\Modifier'
    ];

    /**
     * @param Node $node
     * @return array|AntlersModifierParameter[]
     */
    private function getParameters(Node $node)
    {
        $docBlock = $node->getDocComment();

        if ($docBlock == null) {
            return [[],[],[]];
        }

        /** @var AntlersModifierParameter[] $parameters */
        $parameters = [];
        $blockLines = StringUtilities::breakDocBlock($docBlock);

        $acceptsTypes = [];
        $returnTypes = [];

        foreach ($blockLines as $line) {
            if (Str::startsWith($line, self::PREFIX_PARAM)) {
                $offset = 6;
                $isRequired = Str::startsWith($line, self::PREFIX_PARAM_REQUIRED);

                if ($isRequired) { $offset = 7; }

                $parameter = new AntlersModifierParameter();
                $parameter->isRequired = $isRequired;

                $parseString = trim(mb_substr($line, $offset));
                $parts = explode(' ', $parseString);

                $parameter->acceptsTypes = explode('|', array_shift($parts));
                $parameter->name = array_shift($parts);
                $parameter->description = implode(' ', $parts);

                $parameters[] = $parameter;
            } else if (Str::startsWith($line, self::PREFIX_ALIAS)) {
                $aliases = explode('|', trim(mb_substr($line, 6)));

                if (count($parameters) > 0) {
                    $parameters[count($parameters) - 1]->aliases = array_merge($parameters[count($parameters) - 1]->aliases, $aliases);
                }
            } else if (Str::startsWith($line, self::PREFIX_RETURNS)) {
                $returnTypes = explode('|', trim(mb_substr($line, 8)));
            } else if (Str::startsWith($line, self::PREFIX_ACCEPTS)) {
                $acceptsTypes = explode('|', trim(mb_substr($line, 8)));
            }
        }

        return [$parameters, $returnTypes, $acceptsTypes];
    }

    /**
     * @param array $nodes
     * @param string $targetClassName
     * @param string $sourceFile
     * @return AntlersModifier
     */
    public function analyze(array $nodes, string $targetClassName, string $sourceFile)
    {
        $class = NodeHelpers::extractClass($nodes, $targetClassName);

        if (!NodeHelpers::shouldParse($class)) {
            return null;
        }

        $modifier = new AntlersModifier();

        $modifier->description = NodeHelpers::findDescription($class);
        $modifier->sourceFile = $sourceFile;
        $modifier->name = Str::snake($targetClassName);

        $details = $this->getParameters($class);

        $modifier->parameters = $details[0];
        $modifier->returnsTypes = $details[1];
        $modifier->expectsTypes = $details[2];

        return $modifier;
    }

    /**
     * @param Node[] $nodes
     * @return bool
     */
    public static function shouldAnalyze(array $nodes): bool
    {
        return NodeHelpers::doesExtend($nodes, self::$knownModifierBaseClasses);
    }

}
