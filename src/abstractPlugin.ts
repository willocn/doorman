import PluginManager from "./pluginManager";
import ProxyServer from "./proxyServer";

export default class AbstractPlugin {
    proxyServer: ProxyServer;
    pluginManager: PluginManager;
    namespace = "proxy";
    commands: {
        [commandName: string]: (args: string[]) => void
    } = {};
    constructor(proxyServer: ProxyServer, pluginManager: PluginManager) {
        this.proxyServer = proxyServer;
        this.pluginManager = pluginManager;
    }

    protected sendChat(message: string): void {
        const resp = {
            "text": "",
            "extra": [
                {
                    "text": "[",
                    "bold": false
                },
                {   
                    "text": this.namespace,
                    "color": "blue",
                    "bold": false
                },
                {
                    "text": "] ",
                    "bold": false
                },
                {
                    "text": message
                }
            ]
        };
        this.proxyServer.writeToAllClients("chat", {
            "message": JSON.stringify(resp),
            "position": 0
        });
        return;
    }

    public runCommand(commandName: string, args: string[]): boolean {
        if(commandName in this.commands) {
            this.commands[commandName](args);
            return true;
        }
        return false;
    }
}