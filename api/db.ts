import { Prisma } from "@prisma/client";
import { Operation } from "@prisma/client/runtime/library.js";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { AblyMessage } from "fm-player-shared";
import { handleRequest, printRequestType } from "../api-lib/api-utils.js";
import { getIncludes, Include, ModelSymbol } from "../api-lib/constants.js";
import { ablyRest, prismaClient } from "../api-lib/data-clients.js";

type PrismaArgs<S extends ModelSymbol, O extends Operation> = Prisma.Args<
  (typeof prismaClient)[S],
  O
>;

type GetArgs<S extends ModelSymbol> = PrismaArgs<S, "findUnique">;

type CreateArgs<S extends ModelSymbol> = PrismaArgs<S, "create">;

type UpdateArgs<S extends ModelSymbol> = PrismaArgs<S, "update">;

type DeleteArgs<S extends ModelSymbol> = PrismaArgs<S, "delete">;

type ListArgs<S extends ModelSymbol> = PrismaArgs<S, "findMany">;

enum Methods {
  CREATE,
  GET,
  UPDATE,
  DELETE,
  LIST,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const requestParams = handleRequest(req, res, {
      expectsPath: true,
    });
    if (requestParams === null) return;
    const { path: table, method: requestMethod } = requestParams;

    const prismaClientModelName = (table[0].toLowerCase() +
      table.substring(1)) as ModelSymbol;

    if (
      !Object.keys(prismaClient).includes(prismaClientModelName) ||
      prismaClientModelName[0] === "$"
    ) {
      throw new Error("Requested table is invalid!");
    }

    if (!(req.body instanceof Object)) {
      throw new Error("Request body is not an object!");
    }

    printRequestType("db", requestMethod.toLowerCase() + table);

    const body = req.body as unknown;

    let method;

    switch (requestMethod) {
      case "GET": {
        method = Methods.LIST;
        break;
      }
      case "POST": {
        method = Methods.GET;
        break;
      }
      case "PUT": {
        method = Methods.CREATE;
        break;
      }
      case "PATCH": {
        method = Methods.UPDATE;
        break;
      }
      case "DELETE": {
        method = Methods.DELETE;
        break;
      }
      default: {
        throw new Error("Request method is invalid!");
      }
    }
    const result = await modelSwitch(method, prismaClientModelName, body);

    const ablyMessageMapping = {
      [Methods.CREATE]: AblyMessage.DatabaseChanges.ChangeType.CREATE,
      [Methods.UPDATE]: AblyMessage.DatabaseChanges.ChangeType.UPDATE,
      [Methods.DELETE]: AblyMessage.DatabaseChanges.ChangeType.DELETE,
    };
    if (method in ablyMessageMapping && ablyRest !== null) {
      const message: AblyMessage.DatabaseChanges.UpdateMessage = {
        changeType:
          ablyMessageMapping[
            method as Methods.CREATE | Methods.UPDATE | Methods.DELETE
          ],
        model: table,
        timestamp: Date.now(),
      };
      const channel = ablyRest.channels.get(
        AblyMessage.Channel.DatabaseChanges,
        { modes: ["PUBLISH"] }
      );
      await channel.publish("status", message);
    }
    res.json(result);
  } catch (e) {
    console.error(e);
    let message;
    if (typeof e === "string") {
      message = e;
    } else if (e instanceof Error) {
      message = e.message;
    } else {
      return res.status(500).json("Something went terribly wrong!");
    }
    // https://stackoverflow.com/questions/25245716/remove-all-ansi-colors-styles-from-strings
    // Dec 23, 2023
    // Removes coloring from prisma error messages
    return res.status(400).json(
      message.replace(
        // eslint-disable-next-line no-control-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      )
    );
  }
}

async function modelSwitch(
  methodName: Methods,
  modelName: ModelSymbol,
  args: unknown
) {
  let method;
  switch (methodName) {
    case Methods.CREATE: {
      method = create;
      break;
    }
    case Methods.GET: {
      method = get;
      break;
    }
    case Methods.UPDATE: {
      method = update;
      break;
    }
    case Methods.DELETE: {
      method = deleteMethod;
      break;
    }
    case Methods.LIST: {
      method = list;
      break;
    }
  }
  return method(modelName, args);
}

async function create<S extends ModelSymbol>(modelName: S, data: unknown) {
  return await (
    prismaClient[modelName].create as (
      args: object & { data: CreateArgs<S>["data"]; include: Include<S> }
    ) => object
  )({
    data: data as CreateArgs<S>["data"],
    include: getIncludes(modelName),
  });
}

async function get<S extends ModelSymbol>(modelName: S, whereArgs: unknown) {
  return await (
    prismaClient[modelName].findUnique as (
      args: object & { where: GetArgs<S>["where"]; include: Include<S> }
    ) => object
  )({
    where: whereArgs as GetArgs<S>["where"],
    include: getIncludes(modelName),
  });
}

async function update<S extends ModelSymbol>(modelName: S, body: unknown) {
  const { where, data } = body as { where: unknown; data: unknown };
  if (where === undefined) {
    throw new Error("Missing where clause cannot perform update!");
  }
  return await (
    prismaClient[modelName].update as (
      args: object & {
        where: UpdateArgs<S>["where"];
        data: UpdateArgs<S>["data"];
        include: Include<S>;
      }
    ) => object
  )({
    where: where as UpdateArgs<S>["where"],
    data: data as UpdateArgs<S>["data"],
    include: getIncludes(modelName),
  });
}

async function deleteMethod<S extends ModelSymbol>(
  modelName: S,
  whereArgs: unknown
) {
  return await (
    prismaClient[modelName].delete as (
      args: object & { where: DeleteArgs<S>["where"]; include: Include<S> }
    ) => object
  )({
    where: whereArgs as DeleteArgs<S>["where"],
    include: getIncludes(modelName),
  });
}

async function list<S extends ModelSymbol>(modelName: S, body: unknown) {
  const { where, include } = body as { where: unknown; include: unknown };
  return await (
    prismaClient[modelName].findMany as (
      args: object & { where: ListArgs<S>["where"]; include: Include<S> }
    ) => object
  )({
    where: where as ListArgs<S>["where"],
    include: (include as Include<S> | undefined) ?? getIncludes(modelName),
  });
}
