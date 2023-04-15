import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import crypto from "crypto";
import http from "http";

dotenv.config();

const app = express();

const secretKey = process.env.SECRET_KEY as string;
const password = process.env.PASSWORD as string;
const body = crypto.randomBytes(32).toString("hex");

app.use(cors());
app.use(bodyParser.json());

const authMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.query["p"];
  if (typeof token !== "string" || token === "") return res.sendStatus(401);

  jwt.verify(token, secretKey, (err: any, decoded) => {
    if (err || decoded !== body) return res.sendStatus(403);
    next();
  });
};

app.post("/login", (req, res) => {
  console.log("Token Requested");
  if (req.body?.password === password) {
    const token = jwt.sign(body, secretKey);
    console.log("Authorized");
    return res.json({ token });
  } else {
    console.log("Rejected, Attempt: " + req.body?.password);
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
  console.log("Requested: ", req.path);
  res.sendFile(filePath);
});

const port = process.env.PORT || 3000;
// Create an HTTP service.
http.createServer(app).listen(port);
