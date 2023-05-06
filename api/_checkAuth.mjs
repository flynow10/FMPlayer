export function checkAuthorization(request) {
  const hash = request.query.p,
    correctHash = process.env.PASSWORD_HASH;
  if (!correctHash) {
    throw Error("Missing correct hash variable");
  }
  if (!hash || typeof hash !== "string") {
    return false;
  }

  return hash === correctHash;
}
