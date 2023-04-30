import dotenv from "dotenv";
import { runLibraryServer } from "./library";
import { runProxyServer } from "./proxyServer";
import chalk from "chalk";
dotenv.config();

console.clear();

try {
  runLibraryServer();
} catch (e) {
  console.log(chalk.red("Failed to start library server!"));
}

try {
  runProxyServer();
} catch (e) {
  console.log(chalk.red("Failed to start proxy server!"));
}
