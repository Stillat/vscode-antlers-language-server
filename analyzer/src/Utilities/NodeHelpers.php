<?php

namespace Stillat\StatamicAnalyzer\Utilities;

use Illuminate\Support\Str;
use PhpParser\Node;
use PhpParser\Node\Identifier;
use PhpParser\Node\Stmt;
use PhpParser\Node\Stmt\Class_;
use PhpParser\Node\Stmt\Namespace_;

class NodeHelpers
{
    const FLAG_NO_PARSE = '@ls noparse';
    const FLAG_NO_COMPLETE = '@ls nocomplete';

    public static function getDocBlockText(Node $node): string
    {
        $docBlock = $node->getDocComment();

        if ($docBlock == null) {
            return '';
        }

        return $docBlock->getText();
    }

    public static function shouldParse(Node $node): bool
    {
        return !Str::contains(self::getDocBlockText($node), self::FLAG_NO_PARSE);
    }

    public static function shouldAppearInCompletions(Node $node): bool
    {
        return !Str::contains(self::getDocBlockText($node), self::FLAG_NO_COMPLETE);
    }

    public static function findDescription(Node $node): string
    {
        $docBlock = $node->getDocComment();

        if ($docBlock == null) {
            return '';
        }

        $lines = StringUtilities::breakDocBlock($docBlock->getText());
        $description = '';

        foreach ($lines as $line) {
            $adjustLine = trim($line);

            if (Str::startsWith($adjustLine, '@')) {
                break;
            }

            if (strlen($line) > 0) {
                if (strlen(trim($description)) == 0) {
                    $description = $line;
                } else {
                    $description .= "\n" . $line;
                }
            }
        }

        return trim($description);
    }

    public static function getFqn($nodes, $targetClassName)
    {
        $prefix = '';

        if ($nodes[0] instanceof Node\Stmt\Namespace_) {
            $namespace = $nodes[0];

            if ($namespace->name != null && count($namespace->name->parts) > 0) {
                $prefix = join('\\', $namespace->name->parts);
            }
        }

        $fqn = '';

        if (mb_strlen($prefix) > 0) {
            $fqn = $prefix .'\\'.$targetClassName;
        } else {
            $fqn = $targetClassName;
        }

        return $fqn;
    }

    public static function doesExtend(array $nodes, array $baseClasses)
    {
        if (count($nodes) == 0) {
            return false;
        }

        if (!$nodes[0] instanceof Node\Stmt\Namespace_) {
            return false;
        }

        if ($nodes[0]->stmts == null || count($nodes[0]->stmts) == 0) {
            return false;
        }

        foreach ($nodes[0]->stmts as $node) {
            if ($node instanceof Node\Stmt\Use_) {
                if ($node->uses == null || count($node->uses) == 0) {
                    continue;
                }

                /** @var Node\Stmt\UseUse $useStatement */
                foreach ($node->uses as $useStatement) {
                    if ($useStatement->name == null || count($useStatement->name->parts) == 0) {
                        continue;
                    }

                    $import = implode('\\', $useStatement->name->parts);

                    if (in_array($import, $baseClasses)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public static function getArrayKeyNames(Node\Expr\Array_ $array)
    {
        $keys = [];

        /** @var Node\Expr\ArrayItem $ele */
        foreach ($array->items as $ele) {
            if ($ele->key != null && $ele->key instanceof Node\Scalar\String_) {
                $keys[] = $ele->key->value;
            }
        }

        return $keys;
    }

    /**
     * @param array $nodes
     * @param string $className
     * @return Stmt|Class_|null
     */
    public static function extractClass(array $nodes, string $className)
    {
        if (count($nodes) > 0 && $nodes[0] instanceof Namespace_) {
            foreach ($nodes[0]->stmts as $stmt) {
                if ($stmt instanceof Class_) {
                    if ($stmt->name != null && $stmt->name instanceof Identifier) {
                        if ($stmt->name == $className) {
                            return $stmt;
                        }
                    }
                }
            }
        }

        return null;
    }

    public static function findMethod(array $nodes, string $name)
    {
        foreach ($nodes as $node) {
            if ($node instanceof Stmt\ClassMethod) {
                if ($node->flags == 1 && $node->name != null && $node->name instanceof Identifier) {
                    if ($node->name == $name) {
                        return $node;
                    }
                }
            }
        }

        return null;
    }

    /**
     * @param Node[] $nodes
     * @return Stmt\ClassMethod[]
     */
    public static function extractPublicClassMethods(array $nodes)
    {
        $methods = [];

        foreach ($nodes as $node) {
            if ($node instanceof Stmt\ClassMethod) {
                if ($node->flags == 1) {
                    $methods[] = $node;
                }
            }
        }

        return $methods;
    }

    /**
     * @param Node[] $nodes
     * @param string $propertyName
     * @return Node\Expr|null
     */
    public static function getPropertyValue(array $nodes, string $propertyName)
    {
        foreach ($nodes as $node) {
            if ($node instanceof Stmt\Property) {
                if ($node->props != null && count($node->props) > 0) {
                    foreach ($node->props as $prop) {
                        if ($prop instanceof Stmt\PropertyProperty) {
                            if ($prop->name != null && $prop->name instanceof Node\VarLikeIdentifier) {
                                if ($prop->name->name == $propertyName) {
                                    if ($prop->default != null) {
                                        return $prop->default;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return null;
    }


}
