import ProxyServer from "./proxyServer";

const p = new ProxyServer({
    destinationHost: "localhost",
    hostPort: 25569,
    username: "robot"
});

