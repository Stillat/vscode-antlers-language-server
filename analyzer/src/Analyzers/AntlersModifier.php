<?php

namespace Stillat\StatamicAnalyzer\Analyzers;

class AntlersModifier
{

    public $sourceFile = '';

    public $name = '';
    public $description = '';
    public $expectsTypes = [];
    public $returnsTypes = [];

    /**
     * @var AntlersTagParameter[]
     */
    public $parameters = [];

}
