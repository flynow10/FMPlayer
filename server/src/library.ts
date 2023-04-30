import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import http from "http";
import chalk from "chalk";

const libraryPrefix = chalk.cyan(`[${chalk.bold.cyanBright("LIBRARY")}] `);

export function runLibraryServer() {
  const app = express();

  const secretKey = process.env.SECRET_KEY as string;
  const password = process.env.PASSWORD as string;
  const body = crypto.randomBytes(32).toString("hex");

  app.use(cors());
  app.use(bodyParser.json());
  const fileRequest = chalk.gray("Requested File -> ");

  const authMiddleware = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token = req.query["p"];
    if (typeof token !== "string" || token === "") {
      console.log(libraryPrefix + fileRequest + chalk.red("Missing Token"));
      return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err: any, decoded) => {
      if (err || decoded !== body) {
        console.log(
          libraryPrefix +
            fileRequest +
            chalk.red("Invalid Token, Access Denied")
        );
        return res.sendStatus(403);
      }
      next();
    });
  };

  app.post("/login", (req, res) => {
    const tokenRequest = chalk.gray("Requested JWT Token -> ");
    if (req.body?.password === password) {
      const token = jwt.sign(body, secretKey);
      console.log(libraryPrefix + tokenRequest + chalk.green("Authorized"));
      return res.json({ token });
    } else {
      console.log(
        libraryPrefix +
          tokenRequest +
          chalk.red(`Rejected (Attempted: "${req.body?.password}")`)
      );
      return res.json(false);
    }
  });
  app.get("/isValid", (req, res) => {
    const token = req.query["p"];
    if (typeof token !== "string" || token === "") return res.json(false);

    jwt.verify(token, secretKey, (err: any, decoded) => {
      if (err || decoded !== body) return res.json(false);
      return res.json(true);
    });
  });

  // Protect the static file route with authentication middleware
  app.get("/static/*", authMiddleware, (req, res) => {
    // If the request is authenticated, serve the file
    const filePath = path.join(process.cwd(), req.path);
    console.log(libraryPrefix + fileRequest + chalk.green(req.path));
    res.sendFile(filePath);
  });

  const port = process.env.PORT || 3000;
  // Create an HTTP service.
  http.createServer(app).listen(port);

  console.log(
    chalk.bgGreen.black.bold.underline("\n Library Server Active \n")
  );
  // console.log(chalk.blue("Proxy Url: " + chalk.green(cleanProxyUrl)));
  // console.log(chalk.blue("Proxy Partial: " + chalk.green(cleanProxyPartial)));
  console.log(chalk.blue("PORT: " + chalk.green(port) + "\n"));
  // console.log(chalk.blue("Credentials: " + chalk.green(credentials)));
  // console.log(chalk.blue("Origin: " + chalk.green(origin) + "\n"));
  console.log(
    chalk.cyan(
      "To access library and music files make requests to: " +
        chalk.bold("http://localhost:" + port + "/static/{YOUR_RESOURCE}\n")
    )
  );
}
