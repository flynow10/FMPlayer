import { VercelRequest } from "@vercel/node";
import { PaginationOptions, SortType } from "api/_postgres-types.js";
import { DEFAULT_PAGE_LIMIT } from "./_constants.js";

export const printRequestType = (endpoint: string, type: string) => {
  // const formattedRequestName = type
  //   .split(/(?=[A-Z])/)
  //   .join(" ")
  //   .toLowerCase()
  //   .replace(/\b\w/, (l) => l.toUpperCase());
  console.log(`[serverless][${endpoint}]: Recived "${type}" request`);
};

export const getPaginationOptions = (req: VercelRequest) => {
  const { page, limit, sortBy, sortDirection } = req.query;
  const options: PaginationOptions = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : DEFAULT_PAGE_LIMIT,
    sortDirection: sortDirection ? (sortDirection as SortType) : "asc",
    sortBy: sortBy ? (sortBy as string) : "title",
  };

  return options;
};

export const getPrismaSelectPaginationOptions = (
  paginationOptions: PaginationOptions,
  defaultSort: string
) => {
  const { page, limit, sortDirection, sortBy } = paginationOptions;
  const skip = (page - 1) * limit;
  const take = limit;
  var orderBy;
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
