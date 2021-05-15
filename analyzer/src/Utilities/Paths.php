<?php

namespace Stillat\StatamicAnalyzer\Utilities;

use Illuminate\Support\Str;

class Paths
{
    const APP_DIRECTORY = 'app';
    const CONFIG_DIRECTORY = 'config';
    const STATAMIC_CONFIG_DIRECTORY = 'config/statamic';
    const VENDOR_DIRECTORY = 'vendor';

    public static function getFileName(string $path) :string {
        $info = pathinfo($path);

        if (is_array($info) && array_key_exists('filename', $info)) {
            return $info['filename'];
        }

        return '';
    }

    public static function normalizeDirectoryPath($directory): string
    {
        return Str::finish(
            str_replace('\\', '/', $directory),
            DIRECTORY_SEPARATOR
        );
    }

    public static function getProjectPaths($rootDirectory): ProjectPaths
    {
        $rootDirectory = self::normalizeDirectoryPath($rootDirectory);

        $paths = new ProjectPaths();

        $paths->applicationDirectory = self::normalizeDirectoryPath($rootDirectory.self::APP_DIRECTORY);
        $paths->configDirectory = self::normalizeDirectoryPath($rootDirectory.self::CONFIG_DIRECTORY);
        $paths->statamicConfigDirectory = self::normalizeDirectoryPath($rootDirectory.self::STATAMIC_CONFIG_DIRECTORY);
        $paths->vendorDirectory = self::normalizeDirectoryPath($rootDirectory.self::VENDOR_DIRECTORY);

        return $paths;
    }

}