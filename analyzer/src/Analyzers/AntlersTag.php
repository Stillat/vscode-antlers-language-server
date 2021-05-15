<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

class AntlersTag
{

    public $sourceFile = '';
    public $handle = '';
    public $name = '';
    public $compound = '';
    public $showInCompletions = true;

    /**
     * @var AntlersTagParameter[]
     */
    public $parameters = [];

}