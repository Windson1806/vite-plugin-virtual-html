import { HtmlPluginOptions } from "./types";
import type { ConfigEnv, Plugin, UserConfig } from "vite";
import { HistoryApiOptions } from "../history-api/types";
import { Serve } from "./Serve";
import { Build } from "./Build";

export const VirtualHtmlPlugin = (
  virtualHtmlOptions: HtmlPluginOptions & HistoryApiOptions
): Plugin => {
  let _htmlOptions = virtualHtmlOptions;
  let _config: UserConfig;
  let _instance: Serve | Build | null = null;
  return {
    name: "vite-plugin-virtual-html",
    async config(config: UserConfig, { command }: ConfigEnv) {
      config.appType = "custom";
      _config = config;
      if (command === "serve") {
        _instance = new Serve(_htmlOptions);
      } else if (command === "build") {
        _instance = new Build(_htmlOptions);
        await _instance._buildConfig.call(_instance, config);
      }
    },
    configureServer(server) {
      if ((_instance as Serve)._configureServer) {
        return (_instance as Serve)._configureServer(server);
      }
    },
    async load(...args) {
      if (_instance?._load) {
        return await _instance._load(...args);
      }
    },
    async transform(...args) {
      if (_instance?._transform) {
        return await _instance._transform(...args);
      }
    },
    closeBundle() {
      if ((_instance as Build)._closeBundle) {
        return (_instance as Build)._closeBundle();
      }
    },
  };
};
