import { ProxyServer } from "./proxyServer";

const p = new ProxyServer({
    destinationHost: "localhost",
    hostPort: 25569,
    username: "pclient"
});
p.serverbound.on("chat", console.log); // testy test
p.clientbound.on("chat", console.log);

