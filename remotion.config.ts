import { Config } from "@remotion/cli/config";
import os from "node:os";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// M3 has 8 logical cores (4P + 4E); cap to available cores (e.g. 4 on CI)
Config.setConcurrency(Math.min(8, os.cpus().length));
