import AbstractPlugin from "../../abstractPlugin.js";
import PluginManager from "../../pluginManager.js";
import ProxyServer from "../../proxyServer.js";

export default class MetaPlugin extends AbstractPlugin {
    namespace = "meta";

    constructor(proxyServer: ProxyServer, pluginManager: PluginManager) {
        super(proxyServer, pluginManager);
        this.commands["plugins"] = this.listLoadedPlugins;
    }

    listLoadedPlugins = (): void => {
        this.sendClientChat(`${Object.entries(this.pluginManager.loadedPlugins).length} loaded plugins:`);
        const prettyPluginNames = Object.entries(this.pluginManager.loadedPlugins).map(([namespace, pl]) => `${pl.constructor.name} (${namespace})`);
        prettyPluginNames.forEach(pluginName => {
            this.sendClientChat(pluginName);
        });
    };
}