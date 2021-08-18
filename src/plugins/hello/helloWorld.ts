import * as mc from "minecraft-protocol";
import AbstractPlugin from "../../abstractPlugin.js";
import PluginManager from "../../pluginManager.js";
import ProxyServer from "../../proxyServer.js";

export default class HelloWorldPlugin extends AbstractPlugin {
    namespace = "hello";

    constructor(proxyServer: ProxyServer, pluginManager: PluginManager) {
        super(proxyServer, pluginManager);
        this.commands["hello"] = this.helloCommand;
        this.proxyServer.clientbound.once("login", this.handleLoginPacket); // register clientbound packet listener
    }

    /*
    Example command. arg parsing is left up to the plugin.
    */
    helloCommand = (args: string[]): void => {
        this.sendChat("hai :3");
    }

    /*
    Example packet listener, runs every time the login packet is sent
    */
    handleLoginPacket = (data: Record<string, any>, meta: mc.PacketMeta): void => {
        this.sendChat(`Logged in! :D eid: ${data.entityId}`);
    }
}