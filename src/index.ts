import { readFileSync } from "fs";
import ProxyServer from "./proxyServer.js";
import sharp from "sharp";
import chalk from "chalk";

console.log(chalk.blue.bold("\ndoorman proxy"));
console.log(chalk.white("by WillOCN\n"));

const b64 = "data:image/png;base64," + (await sharp("images/logo.png").resize(64, 64).toBuffer()).toString("base64");

const p = new ProxyServer({
    destinationHost: "localhost",
    hostPort: 25569,
    username: "frankenstein",
    icon: b64
});