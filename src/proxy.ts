import * as mc from "minecraft-protocol";
import { EventEmitter } from "stream";
import * as mineflayer from "mineflayer";
import { sleep } from "./util/sleep";

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

export class ProxyServer {
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
        console.log(`proxy to ${this.destinationHost}:${this.destinationPort} running on ${this.hostPort}`);
        this.srv.on("login", this.handleProxyLogin);
    }

    public handleProxyLogin = (client: mc.Client): void => {
        const addr = client.socket.remoteAddress;
        console.log("Incoming connection", "(" + addr + ")");
        // console.log(this.clients);
        const pclient = new ProxyClient(client, this);
        this.clients.push(pclient);
        if (this.clients.length == 1) { // We need to handle the first client differently.
            console.log("main client joined");
            pclient.sendAllPackets = true;

            // TODO: INIT MINEFLAYER HERE SO STATE IS SYNCED
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

            this.targetClient.on("packet", (data, meta: mc.PacketMeta) => { // CLIENTBOUND PACKET HANDLING
                this.clientbound.emit("packet", data, meta);
                this.clientbound.emit(meta.name, data, meta);
                // TODO: emit raw, raw.packet

                if (meta.state === states.PLAY && client.state === states.PLAY) {
                    if (!this.endedClient) {
                        if (meta.name === "set_compression") {
                            this.clients.forEach(c => {
                                c._client.compressionThreshold = data.threshold;
                            });
                        } // Set compression

                        this.writeToAllClients(meta.name, data);
                    }
                }
            });

            this.targetClient.on("end", (endReason) => {
                this.endedTargetClient = true;
                console.log("Connection closed by server");
                console.log(endReason);
                this.clients.forEach(c => {
                    c._client.end(endReason);
                });
            });

            this.targetClient.on("error", (err) => {
                this.endedTargetClient = true;
                console.log("Connection error by server", err);
                console.log(err.stack);
                this.clients.forEach(c => {
                    c._client.end("error on targetclient");
                });
            });

        // TODO: MAKE MINEFLAYER BOT USE CUSTOM CLIENT BRAND
        } else if(this.clients.length == 2) {
            console.log("second client (bot) join");
            // this.sendLoginPackets(pclient);
            this.bot?.once("spawn", () => {
                this.bot?.chat("hai");
            });

            this.bot?.on("chat", async (username, message) => {
                if(username === this.username) {
                    return;
                } else if(message.toLowerCase() === "eid") {
                    this.bot?.chat(`My entity id is ${this.bot.entity.id}`);
                } else if(message.toLowerCase() === "players") {
                    this.bot?.chat(`Players: ${Object.keys(this.bot.players)} (${Object.keys(this.bot.players).length} players)`);
                } else if(message.toLowerCase().startsWith("say ")) {
                    this.bot?.chat(message.substring(4));
                } else if(message.toLowerCase() === "ping") {
                    this.bot?.chat(`My ping is ${this.bot._client.latency + this.targetClient?.latency} ms (${this.bot._client.latency} ms + ${this.targetClient?.latency} ms)`);//
                } else if(message.toLowerCase() === "swing") {
                    this.writeToAllClients("animation", {
                        entityId: this.bot?.entity.id,
                        animation: 0
                    });
                } else if(message.toLowerCase() === "swing a lot") {
                    for(let i = 0; i < 50; i++) {
                        this.writeToAllClients("animation", {
                            entityId: this.bot?.entity.id,
                            animation: 0
                        });
                        await sleep(50);
                    }
                } else if(message.toLowerCase() === "ouch") {
                    for(let i = 0; i < 100; i++) {
                        this.writeToAllClients("animation", {
                            entityId: this.bot?.entity.id,
                            animation: 3
                        });
                        await sleep(50);
                    }
                }
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

    public writeToAllClients(name: string, params: any): void {
        this.clients.forEach((c) => {
            c._client.write(name, params);
        });
    }

    // use this function when you need to resync other clients with new change
    public writeToOtherClients(client: ProxyClient, name: string, params: any): void {
        this.clients.forEach((c) => {
            if(c !== client) {
                c._client.write(name, params);
            }
        });
    }
}

class ProxyClient { // currently wraps nmp client: maybe later extend it?
    sendAllPackets = false;
    whitelistedPackets = new Set<string>(["chat", "tab_complete"]); // need to test!
    _client: mc.Client;
    username: string;
    proxy: ProxyServer;
    addr?: string;

    public constructor(client: mc.Client, proxy: ProxyServer) {
        this._client = client;
        this.username = client.username;
        this.addr = client.socket.remoteAddress;
        this.proxy = proxy;

        // register event listeners
        this._client.on("packet", this.handlePacket);
        this._client.on("end", this.handleEnd);
        this._client.on("error", this.handleError);
    }

    public canSendPacket(meta: mc.PacketMeta): boolean {
        if(this.sendAllPackets) {
            return true;
        } else if(this.whitelistedPackets.has(meta.name)) {
            return true;
        }
        return false;
    }

    public parseMovementPackets(data: any, meta: mc.PacketMeta): void {
        if (meta.name === "position_look") {
            this.proxy.facing.pitch = data.pitch;
            this.proxy.facing.yaw = data.yaw;
            this.proxy.pos.x = data.x;
            this.proxy.pos.y = data.y;
            this.proxy.pos.z = data.z;
        }
        if(meta.name === "look") {
            this.proxy.facing.pitch = data.pitch;
            this.proxy.facing.yaw = data.yaw;
        }
        if(meta.name === "position") {
            this.proxy.pos.x = data.x;
            this.proxy.pos.y = data.y;
            this.proxy.pos.z = data.z;
        }

        this.proxy.writeToOtherClients(this, "position", {
            x: this.proxy.pos.x,
            y: this.proxy.pos.y,
            z: this.proxy.pos.z,
            pitch: this.proxy.facing.pitch,
            yaw: this.proxy.facing.yaw,
            flags: 0x00 // in newer versions there is an additional field (Teleport ID)
        });
    }

    public handlePacket = (data: any, meta: mc.PacketMeta): void => {
        if (this.canSendPacket(meta)) {
            this.proxy.serverbound.emit("packet", data, meta);
            this.proxy.serverbound.emit(meta.name, data, meta);
            // TODO: emit raw, raw.packet
            if (this.proxy.targetClient) {
                if (this.proxy.targetClient.state === states.PLAY && meta.state === states.PLAY) {
                    if (["position", "position_look", "look"].includes(meta.name)) {
                        this.parseMovementPackets(data, meta);
                    }
                }
                if (!this.proxy.endedTargetClient) {
                    this.proxy.targetClient.write(meta.name, data);
                }
            }
        }
        return;
    }

    public handleEnd = () => {
        console.log("Connection closed by client", "(" + this.addr + ")");
        this.proxy.clients = this.proxy.clients.filter(el => el != this);
    }

    public handleError = (err: Error) => {
        console.log("Connection error by client", "(" + this.addr + ")");
        console.log(err.stack);
        this.proxy.clients = this.proxy.clients.filter(el => el != this);
    }
}