import AbstractPlugin from "../../abstractPlugin";
import PluginManager from "../../pluginManager";
import ProxyServer from "../../proxyServer";

export default class MetaPlugin extends AbstractPlugin {
    namespace = "meta";

    constructor(proxyServer: ProxyServer, pluginManager: PluginManager) {
        super(proxyServer, pluginManager);
        this.commands["plugins"] = this.listLoadedPlugins;
    }

    listLoadedPlugins = (args: string[]): void => {
        this.sendChat(`${this.pluginManager.loadedPlugins.length} loaded plugins:`);
        const prettyPluginNames = this.pluginManager.loadedPlugins.map(pl => `${pl.constructor.name} (${pl.namespace})`);
        prettyPluginNames.forEach(pluginName => {
            this.sendChat(pluginName);
        });
    }
}