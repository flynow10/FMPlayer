import { VercelRequest } from "@vercel/node";
import { DEFAULT_PAGE_LIMIT } from "./constants.js";
import { PostgresRequest } from "@/src/types/postgres-request.js";

export const printRequestType = (endpoint: string, type: string) => {
  // const formattedRequestName = type
  //   .split(/(?=[A-Z])/)
  //   .join(" ")
  //   .toLowerCase()
  //   .replace(/\b\w/, (l) => l.toUpperCase());
  console.log(`[serverless][${endpoint}]: Received "${type}" request`);
};

export const getPaginationOptions = (req: VercelRequest) => {
  const { page, limit, sortBy, sortDirection } = req.query;
  const options: PostgresRequest.PaginationOptions = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : DEFAULT_PAGE_LIMIT,
    sortDirection: sortDirection
      ? (sortDirection as PostgresRequest.SortType)
      : "asc",
    sortBy: sortBy ? (sortBy as string) : "title",
  };

  return options;
};

export const getPrismaSelectPaginationOptions = (
  paginationOptions: PostgresRequest.PaginationOptions,
  defaultSort: string
) => {
  const { page, limit, sortDirection, sortBy } = paginationOptions;
  const skip = (page - 1) * limit;
  const take = limit;
  let orderBy;
  if (sortBy !== defaultSort) {
    orderBy = [
      {
        [sortBy]: sortDirection,
      },
      {
        [defaultSort]: sortDirection,
      },
    ];
  } else {
    orderBy = {
      [sortBy]: sortDirection,
    };
  }

  return { skip, take, orderBy };
};
