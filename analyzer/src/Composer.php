<?php

namespace Stillat\StatamicAnalyzer;

use Illuminate\Support\Str;

class Composer
{

    public static function isStatamicAddon($path)
    {
        $contents = json_decode(file_get_contents($path), true);

        if (array_key_exists('extra', $contents)) {
            $extra = $contents['extra'];

            return array_key_exists('statamic', $extra);
        }

        return false;
    }

    public static function getRequirePaths($contents, $projectPath)
    {
        if (is_array($contents) == false) {
            return [];
        }

        $tempDependencies = [];
        $dependencies = [];

        $localRepositories = [];

        if (array_key_exists('repositories', $contents)) {
            $repos = $contents['repositories'];

            foreach ($repos as $repo) {
                if (is_array($repo) && array_key_exists('type', $repo) && array_key_exists('url', $repo)) {
                    if ($repo['type'] == 'path') {
                        $path = $repo['url'];
                        $parts = explode('/', $path);

                        if (count($parts) < 2) {
                            continue;
                        }

                        $vendorParts = [];
                        $vendorParts[] = array_pop($parts);
                        $vendorParts[] = array_pop($parts);

                        $vendorPath = implode('/', array_reverse($vendorParts));

                        $localRepositories[$vendorPath] = $path;
                    }
                }
            }
        }

        if (array_key_exists('require', $contents)) {
            $required = $contents['require'];

            foreach ($required as $name => $version) {
                $path = $name;
                $isLocal = false;

                if (array_key_exists($name, $localRepositories)) {
                    $path = $projectPath.$localRepositories[$name];
                    $isLocal = true;
                } else {
                    $path = $projectPath.'vendor/'.$name;
                }

                $dep = new ComposerDependency();

                $dep->name = $name;
                $dep->path = Str::finish($path, '/');
                $dep->isLocalDevMaster = $isLocal;
                $dep->version = $version;
                $dep->cacheHash = sha1($name.'_'.$version);

                $tempDependencies[] = $dep;
            }
        }

        foreach ($tempDependencies as $dep) {
            if (file_exists($dep->path) && is_dir($dep->path)) {
                $dependencies[] = $dep;
            }
        }

        return $dependencies;
    }

}
