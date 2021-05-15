<?php

namespace Stillat\StatamicAnalyzer\Traverser;

class Directory
{



    public static function getFiles($directory, &$filesToReturn = []): array
    {
        $files = scandir($directory);

        foreach ($files as $key => $value) {
            $path = realpath($directory . DIRECTORY_SEPARATOR . $value);
            if (!is_dir($path)) {
                $filesToReturn[] = $path;
            } else if ($value != "." && $value != "..") {
                Directory::getFiles($path, $filesToReturn);
                $filesToReturn[] = $path;
            }
        }

        return $filesToReturn;
    }

}