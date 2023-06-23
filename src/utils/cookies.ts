// https://stackoverflow.com/questions/5968196/how-do-i-check-if-a-cookie-exists
export const getCookie = (name: string) => {
  const dc = document.cookie;
  const prefix = name + "=";
  let begin = dc.indexOf("; " + prefix);
  let end = undefined;
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    if (begin != 0) return null;
  } else {
    begin += 2;
    end = document.cookie.indexOf(";", begin);
    if (end == -1) {
      end = dc.length;
    }
  }
  // because unescape has been deprecated, replaced with decodeURI
  //return unescape(dc.substring(begin + prefix.length, end));
  return decodeURI(dc.substring(begin + prefix.length, end));
};

export const cookieExists = (name: string) => {
  return getCookie(name) !== null;
};
