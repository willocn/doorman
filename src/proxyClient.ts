import { ProxyServer } from "./proxyServer";
import * as mc from "minecraft-protocol";
import { logger } from "./logger";

const states = mc.states;

export class ProxyClient { // currently wraps nmp client: maybe later extend it?
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

    //TODO: move out to client sync plugin
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
            this.proxy.serverbound.emit("packet", data, meta); //TODO: also emit client
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
        logger.error("Connection closed by client", "(" + this.addr + ")");
        this.proxy.clients = this.proxy.clients.filter(el => el != this);
    }

    public handleError = (err: Error) => {
        logger.error("Connection error by client", "(" + this.addr + ")");
        logger.error(err.stack);
        this.proxy.clients = this.proxy.clients.filter(el => el != this);
    }
}