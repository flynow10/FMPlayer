export const printRequestType = (endpoint: string, type: string) => {
  // const formattedRequestName = type
  //   .split(/(?=[A-Z])/)
  //   .join(" ")
  //   .toLowerCase()
  //   .replace(/\b\w/, (l) => l.toUpperCase());
  console.log(`[serverless][${endpoint}]: Received "${type}" request`);
};
