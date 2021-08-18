import AbstractPlugin from "../abstractPlugin";
import PluginManager from "../pluginManager";
import ProxyServer from "../proxyServer";

export default class HelloWorldPlugin extends AbstractPlugin {
    namespace = "hello";

    constructor(proxyServer: ProxyServer, pluginManager: PluginManager) {
        super(proxyServer, pluginManager);
        this.commands["hello"] = this.helloCommand;
    }

    helloCommand = (args: string[]): void => {
        this.sendChat("hai :3");
    }
}