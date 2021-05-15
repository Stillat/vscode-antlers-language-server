<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

use Illuminate\Support\Str;
use PhpParser\Node;
use Stillat\StatamicAnalyzer\Utilities\NodeHelpers;
use Stillat\StatamicAnalyzer\Utilities\StringUtilities;

class TagAnalyzer
{
    const PREFIX_PARAM = '@input';
    const PREFIX_PARAM_REQUIRED = '@input*';
    const PREFIX_ALIAS = '@alias';

    public static $ignoreTagMethods = [
        'wildcard', 'index'
    ];

    public static $knownStatamicTagBaseClasses = [
        'Statamic\\Tags\\Tags'
    ];

    /**
     * @param Node[] $nodes
     * @return bool
     */
    public static function shouldAnalyze(array $nodes): bool
    {
        return NodeHelpers::doesExtend($nodes, self::$knownStatamicTagBaseClasses);
    }

    /**
     * @param Node[] $nodes
     * @param string $targetClassName
     * @param string $sourceFile
     * @return AntlersTag[]
     */
    public function analyze(array $nodes, string $targetClassName, string $sourceFile)
    {
        $tagClass = NodeHelpers::extractClass($nodes, $targetClassName);

        if (!NodeHelpers::shouldParse($tagClass)) {
            return null;
        }

        $tagHandle = $this->getHandle($tagClass->stmts, $targetClassName);
        $tagMethods = NodeHelpers::extractPublicClassMethods($tagClass->stmts);

        /** @var AntlersTag[] $antlersTags */
        $antlersTags = [];
        $foundWildCardOrIndex = false;

        foreach ($tagMethods as $tagMethod) {
            if (NodeHelpers::shouldParse($tagMethod)) {
                if ($tagMethod->name != null && $tagMethod->name instanceof Node\Identifier) {
                    if (Str::startsWith($tagMethod->name, '__')) {
                        continue;
                    }

                    if (!in_array($tagMethod->name, self::$ignoreTagMethods)) {
                        $tagMethodName = Str::snake($tagMethod->name->name);
                        $compoundName = $tagHandle . ':' . $tagMethodName;

                        $tag = new AntlersTag();

                        $tag->sourceFile = $sourceFile;
                        $tag->name = $tagMethodName;
                        $tag->compound = $compoundName;
                        $tag->handle = $tagHandle;
                        $tag->showInCompletions = NodeHelpers::shouldAppearInCompletions($tagMethod);

                        $tag->parameters = $this->getParameters($tagMethod);

                        $antlersTags[] = $tag;
                    } else {
                        if ($tagMethod->name == 'index' && !$foundWildCardOrIndex) {
                            $indexTag = new AntlersTag();

                            $indexTag->sourceFile = $sourceFile;
                            $indexTag->name = $tagHandle;
                            $indexTag->compound = $tagHandle;
                            $indexTag->handle = $tagHandle;
                            $indexTag->showInCompletions = NodeHelpers::shouldAppearInCompletions($tagMethod);

                            $indexTag->parameters = $this->getParameters($tagMethod);

                            $antlersTags[] = $indexTag;
                            $foundWildCardOrIndex = true;
                        }
                    }
                }
            }
        }

        return $antlersTags;
    }

    /**
     * @param array $nodes
     * @param string $className
     * @return string
     */
    private function getHandle(array $nodes, string $className)
    {
        $handleProperty = NodeHelpers::getPropertyValue($nodes, 'handle');

        if ($handleProperty != null && $handleProperty instanceof Node\Scalar\String_) {
            return Str::snake($handleProperty->value);
        }

        if (Str::endsWith($className, 'Tags')) {
            return Str::snake(mb_substr($className, 0, -4));
        }

        if (Str::endsWith($className, 'Tag')) {
            return Str::snake(mb_substr($className, 0, -3));
        }

        return Str::snake($className);
    }

    /**
     * @param Node $node
     * @return array|AntlersTagParameter[]
     */
    private function getParameters(Node $node)
    {
        $docBlock = $node->getDocComment();

        if ($docBlock == null) {
            return [];
        }

        /** @var AntlersTagParameter[] $parameters */
        $parameters = [];
        $blockLines = StringUtilities::breakDocBlock($docBlock);

        foreach ($blockLines as $line) {
            if (Str::startsWith($line, self::PREFIX_PARAM)) {
                $offset = 6;
                $isRequired = Str::startsWith($line, self::PREFIX_PARAM_REQUIRED);

                if ($isRequired) {
                    $offset = 7;
                }

                $parameter = new AntlersTagParameter();
                $parameter->isRequired = $isRequired;

                $parseString = trim(mb_substr($line, $offset));
                $parts = explode(' ', $parseString);

                $parameter->expectsTypes = explode('|', array_shift($parts));
                $parameter->name = array_shift($parts);
                $parameter->description = implode(' ', $parts);

                $parameters[] = $parameter;
            } else if (Str::startsWith($line, self::PREFIX_ALIAS)) {
                $aliases = explode('|', trim(mb_substr($line, 6)));

                if (count($parameters) > 0) {
                    $parameters[count($parameters) - 1]->aliases = array_merge($parameters[count($parameters) - 1]->aliases, $aliases);
                }
            }
        }

        return $parameters;
    }

}