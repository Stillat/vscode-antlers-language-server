<?php

namespace Stillat\StatamicAnalyzer\Utilities;

class StringUtilities
{

    public static function normalizeLineEndings(string $input): string{
        return str_replace(array("\r\n", "\r", "\n"), "\n", $input);
    }

    public static function breakByNewLine(string $input): array {
        return explode("\n", self::normalizeLineEndings($input));
    }

    public static function cleanByNewLine(string $input): array {
        return array_map('trim', self::breakByNewLine($input));
    }

    public static function breakDocBlock(string $input) : array {
        $lines = [];

        foreach (self::cleanByNewLine($input) as $line) {
            $line = trim(ltrim($line, '/*'));
            if (mb_strlen($line) == 0) {
                continue;
            }

            $lines[] = $line;
        }

        return $lines;
    }

}
