// import * as format from "date-fns/format";

import { format } from "date-fns";

export function resolveNullableMapKey(key: any) {
  return (key || "").toLowerCase();
}

export function htmlEncode(str: string) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));

  // The trick we are using here doesnt encode quotes. So we have to replace them using regexp search
  return div.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function isNullOrWhiteSpace(value: string | null) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

export function isNullOrEmpty(value: string | null) {
  return value == null || value === "";
}

export function toString(val: any) {
  if (typeof val === "boolean") {
    return val ? "True" : "False";
  } else if (typeof val === "number") {
    return `${val}`;
  } else if (val instanceof Date) {
    return format(val, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  } else {
    return val;
  }
}

export function hashCode(str: string | null) {
  if (isNullOrWhiteSpace(str)) {
    return 0;
  }

  let hash = 0;
  if (str) {
    const trimmedString = str.trim();

    for (let i = 0; i < trimmedString.length; i++) {
      const ch = str.charCodeAt(i);
      hash = (hash << 5) - hash + ch;
      hash = hash & hash; // Convert to 32bit integer
    }
  }

  return hash;
}

export function ignoreCaseEquals(a: string, b: string) {
  return (a || "").toLowerCase() === (b || "").toLowerCase();
}
