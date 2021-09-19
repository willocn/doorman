import AbstractPlugin from "./abstractPlugin.js";
import ProxyServer from "./proxyServer.js";
import MetaPlugin from "./plugins/meta/metaPlugin.js";
import getLogger from "./logger.js";

const logger = getLogger("pluginManager");

export default class PluginManager {
    loadedPlugins: Record<string, AbstractPlugin> = {};
    qualifiedCommands: string[] = [];
    proxyServer: ProxyServer;
    constructor(server: ProxyServer) {
        this.proxyServer = server;
        this.load(MetaPlugin);
    }

    public load(pluginClass: typeof AbstractPlugin): boolean {
        const plugin = new pluginClass(this.proxyServer, this);
        logger.info(`Loading plugin ${plugin.constructor.name} with namespace ${plugin.namespace}`);
        this.loadedPlugins[plugin.namespace] = plugin;
        Object.keys(plugin.commands).forEach(commandName => {
            this.qualifiedCommands.push(`/${plugin.namespace}:${commandName}`);
        });
        return true;
    }
    
    public unload(pluginNamespace: string): boolean {
        // TODO: remove event listeners gracefully, remove commands, remove packet transformers
        return true;
    }

    getTabCompletion(commandPrefix: string): string[] {
        return this.qualifiedCommands.filter(command => command.startsWith(commandPrefix));
    }

    executeCommand(qualifiedCommand: string, args: string[]): boolean {
        const[namespace, command] = qualifiedCommand.split(":");
        const plugin = this.loadedPlugins[namespace.substr(1)];
        if(plugin) {
            return plugin.runCommand(command, args);
        }
        return false;
    }
}