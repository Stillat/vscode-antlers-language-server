<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

use Stillat\StatamicAnalyzer\Utilities\NodeHelpers;
use Stillat\StatamicAnalyzer\Utilities\Paths;

class Discovery
{

    public static function scanForAdditionalBaseClasses($results, $filePath)
    {
        $targetClassName = Paths::getFileName($filePath);

        if (TagAnalyzer::shouldAnalyze($results)) {
            $class = NodeHelpers::extractClass($results, $targetClassName);
            TagAnalyzer::$knownStatamicTagBaseClasses[] = NodeHelpers::getFqn($results, $targetClassName);
        }
    }

}