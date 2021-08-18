import * as mc from "minecraft-protocol";
import { EventEmitter } from "stream";
import * as mineflayer from "mineflayer";
import sleep from "./util/sleep";
import ProxyClient from "./proxyClient";
import logger from "./logger";
import PluginManager from "./pluginManager";

interface Config {
    hostPort?: number,
    destinationPort?: number,
    destinationHost: string,
    online?: boolean,
    username?: string,
    password?: string;
}

const states = mc.states;

class PacketEmitter extends EventEmitter {} // for read-only packet events

export default class ProxyServer {
    hostPort;
    destinationPort;
    destinationHost;
    version = "1.8.9"; // movement packets are different per version, only support 1.8 for now
    online;
    username;
    password;
    srv;
    clients: ProxyClient[];
    targetClient: mc.Client | undefined; // a lot of extra type guards are required because of this. can this be fixed?
    endedClient = false;
    endedTargetClient = false;
    facing = {
        pitch: 0,
        yaw: 0
    };
    pos = {
        x: 0,
        y: 0,
        z: 0
    };
    clientbound = new PacketEmitter();
    serverbound = new PacketEmitter();
    pluginManager = new PluginManager(this);
    lastTabComplete = "";
    bot: mineflayer.Bot | undefined;

    public constructor(config: Config) {
        const {
            hostPort = 25566,
            destinationPort = 25565,
            destinationHost,
            online = false,
            username = "ProxyBot",
            password = undefined
        } = config; // object destructuring (is this the best way to do this?)
        this.hostPort = hostPort;
        this.destinationPort = destinationPort;
        this.destinationHost = destinationHost;
        this.online = online;
        this.username = username;
        this.password = password;
        this.clients = [];
        this.srv = mc.createServer({
            "online-mode": false,
            port: this.hostPort,
            keepAlive: false, // client in control will handle keep alive packets
            version: this.version,
            maxPlayers: 0,
            motd: "Proxy Rewrite"
        });
        logger.info(`proxy to ${this.destinationHost}:${this.destinationPort} running on ${this.hostPort} :D`);
        this.srv.on("login", this.handleProxyLogin);
    }

    public handleProxyLogin = (client: mc.Client): void => {
        const addr = client.socket.remoteAddress;
        logger.info("Incoming connection", "(" + addr + ")");
        // console.log(this.clients);
        const pclient = new ProxyClient(client, this);
        this.clients.push(pclient);
        if (this.clients.length == 1) { // We need to handle the first client differently.
            logger.debug("main client joined");
            pclient.sendAllPackets = true;

            this.bot = mineflayer.createBot({
                host: "localhost",
                port: this.hostPort,
                username: "PBot",
                version: this.version
            });

            // TODO: assess intializing targetclient in construcor and connect later 
            // SEE: https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/src/createClient.js
            this.targetClient = mc.createClient({
                host: this.destinationHost,
                port: this.destinationPort,
                username: this.username,
                password: this.password,
                keepAlive: false, // client in control will handle keep alive packets
                version: this.version
            });

            this.targetClient.on("packet", (data: Record<string, any>, meta: mc.PacketMeta) => { // CLIENTBOUND PACKET HANDLING
                this.clientbound.emit("packet", data, meta);
                this.clientbound.emit(meta.name, data, meta);
                // TODO: emit raw, raw.packet

                if (meta.state === states.PLAY && client.state === states.PLAY) {
                    if (!this.endedClient) {
                        if(meta.name === "tab_complete") {
                            const newCommands = this.pluginManager.getTabCompletion(this.lastTabComplete); 
                            data.matches = data.matches.concat(newCommands);
                        }

                        if (meta.name === "set_compression") {
                            this.clients.forEach(c => {
                                c._client.compressionThreshold = data.threshold; //TODO: nmp pr to fix this
                            });
                        } // Set compression

                        this.writeToAllClients(meta.name, data);
                    }
                }
            });

            this.targetClient.on("end", (endReason) => {
                this.endedTargetClient = true;
                logger.error("Connection closed by server");
                logger.error(endReason);
                this.clients.forEach(c => {
                    c._client.end(endReason);
                });
            });

            this.targetClient.on("error", (err) => {
                this.endedTargetClient = true;
                logger.error("Connection error by server", err);
                logger.error(err.stack);
                this.clients.forEach(c => {
                    c._client.end("error on targetclient");
                });
            });

        // TODO: MAKE MINEFLAYER BOT USE CUSTOM CLIENT BRAND
        } else if(this.clients.length == 2) {
            logger.debug("second client (bot) join");

            this.bot?.on("message", (chatMsg) => {
                logger.info(chatMsg.toAnsi());
            });
        } else {
            this.sendLoginPackets(pclient);
        }

    }

    public sendLoginPackets(pc: ProxyClient): void {
        /* For new clients, we need to send the inital login packets
        First client does not need this because target server sends this info itself.
        Currently, entity and chunk data are NOT sent so clients will be broken until
        chunk reload/server switch
        TODO: send chunk and entity data to new clients
        see https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/examples/server_world/mc.js#L43
        */
        pc._client.write("login", {
            entityId: this.bot?.entity.id,
            levelType: "default",
            gameMode: 0,
            dimension: 0,
            difficulty: 2,
            maxPlayers: 1,
            reducedDebugInfo: false
        });
        pc._client.write("position", {
            x: this.pos.x,
            y: this.pos.y,
            z: this.pos.z,
            pitch: this.facing.pitch,
            yaw: this.facing.yaw,
            flags: 0x00
        });
    }

    public writeToAllClients(name: string, params: Record<string, any>): void {
        this.clients.forEach((c) => {
            c._client.write(name, params);
        });
    }

    // use this function when you need to resync other clients with new change
    public writeToOtherClients(client: ProxyClient, name: string, params: Record<string, any>): void {
        this.clients.forEach((c) => {
            if(c !== client) {
                c._client.write(name, params);
            }
        });
    }
}