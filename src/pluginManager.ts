import AbstractPlugin from "./abstractPlugin.js";
import ProxyServer from "./proxyServer.js";
import * as plugins from "./plugins/index.js";
import getLogger from "./logger.js";

const logger = getLogger("pluginManager");

export default class PluginManager {
    loadedPlugins: AbstractPlugin[] = [];
    qualifiedCommands: string[] = [];
    proxyServer: ProxyServer;
    constructor(server: ProxyServer) {
        this.proxyServer = server;
        Object.values(plugins).forEach(plug => {
            this.load(new plug(this.proxyServer, this));
        });
    }

    public load(plugin: AbstractPlugin) {
        logger.info(`Loading plugin ${plugin.constructor.name} with namespace ${plugin.namespace}`);
        this.loadedPlugins.push(plugin);
        Object.keys(plugin.commands).forEach(commandName => {
            this.qualifiedCommands.push(`/${plugin.namespace}:${commandName}`);
        });
        return;
    }
    
    public unload(pluginNamespace: string) {
        // TOOD: remove event listeners gracefully, remove commands, remove packet transformers
        return;
    }

    getTabCompletion(commandPrefix: string): string[] {
        return this.qualifiedCommands.filter(command => command.startsWith(commandPrefix));
    }

    executeCommand(qualifiedCommand: string, args: string[]): boolean {
        const[namespace, command] = qualifiedCommand.split(":");
        const plugin = this.loadedPlugins.find(p => p.namespace == namespace.substr(1));
        if(plugin) {
            return plugin.runCommand(command, args);
        }
        return false;
    }
}