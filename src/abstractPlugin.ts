import PluginManager from "./pluginManager.js";
import ProxyServer from "./proxyServer.js";

export default class AbstractPlugin {
    proxyServer: ProxyServer;
    pluginManager: PluginManager;
    namespace = "proxy"; // this is the default namespace, plz change it!
    commands: {
        [commandName: string]: (args: string[]) => void
    } = {};
    constructor(proxyServer: ProxyServer, pluginManager: PluginManager) {
        this.proxyServer = proxyServer;
        this.pluginManager = pluginManager;
    }

    // Send chat to clients connected to the proxy with a consistent format
    protected sendClientChat(message: string): void {
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