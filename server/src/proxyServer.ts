import express from "express";
import cors from "cors";
import chalk from "chalk";
import axios from "axios";

const proxyPrefix = chalk.blue(`[${chalk.bold.blueBright("PROXY")}] `);

export function runProxyServer() {
  const credentials = false,
    origin = "*",
    port = 8010,
    proxyPartial = "/proxy",
    proxyUrl = "https://suggestqueries.google.com";
  var proxy = express();
  proxy.use(cors({ credentials: credentials, origin: origin }));
  proxy.options("*", cors({ credentials: credentials, origin: origin }));

  // remove trailing slash
  var cleanProxyUrl = proxyUrl.replace(/\/$/, "");
  // remove all forward slashes
  var cleanProxyPartial = proxyPartial.replace(/\//g, "");

  proxy.use("/" + cleanProxyPartial, async function (req, res) {
    try {
      console.log(
        proxyPrefix + chalk.gray("Request Proxied -> ") + chalk.green(req.url)
      );
    } catch (e) {}

    const axiosResponse = await axios({
      url: cleanProxyUrl + req.url,
      responseType: "stream",
    });

    axiosResponse.data.pipe(res);
  });

  proxy.listen(port);

  // Welcome Message
  console.log(chalk.bgGreen.black.bold.underline("\n Proxy Active \n"));
  console.log(chalk.blue("Proxy Url: " + chalk.green(cleanProxyUrl)));
  console.log(chalk.blue("Proxy Partial: " + chalk.green(cleanProxyPartial)));
  console.log(chalk.blue("PORT: " + chalk.green(port)));
  console.log(chalk.blue("Credentials: " + chalk.green(credentials)));
  console.log(chalk.blue("Origin: " + chalk.green(origin) + "\n"));
  console.log(
    chalk.cyan(
      "To start using the proxy simply replace the proxied part of your url with: " +
        chalk.bold("http://localhost:" + port + "/" + cleanProxyPartial + "\n")
    )
  );
}
