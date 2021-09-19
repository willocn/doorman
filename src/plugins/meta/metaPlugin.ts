import AbstractPlugin from "../../abstractPlugin.js";
import PluginManager from "../../pluginManager.js";
import ProxyServer from "../../proxyServer.js";

export default class MetaPlugin extends AbstractPlugin {
    namespace = "meta";

    constructor(proxyServer: ProxyServer, pluginManager: PluginManager) {
        super(proxyServer, pluginManager);
        this.commands["plugins"] = this.listLoadedPlugins;
    }

    listLoadedPlugins = (args: string[]): void => {
        this.sendClientChat(`${this.pluginManager.loadedPlugins.length} loaded plugins:`);
        const prettyPluginNames = this.pluginManager.loadedPlugins.map(pl => `${pl.constructor.name} (${pl.namespace})`);
        prettyPluginNames.forEach(pluginName => {
            this.sendClientChat(pluginName);
        });
    }
}