import { Request } from "express";

export function getOrigin(req: Request) {
  if (req.headers.origin) {
    return req.headers.origin;
  }

  if (req.headers.referer) {
    const url = new URL(req.headers.referer);
    return `${url.protocol}//${url.host}`;
  }

  const protocol = req.protocol;
  const host = req.headers.host;
  return `${protocol}://${host}`;
}

export function getDomain(req: Request) {
  if (req.headers.origin) {
    const url = new URL(req.headers.origin);
    return url.hostname;
  }
  if (req.headers.referer) {
    const url = new URL(req.headers.referer);
    return url.hostname;
  }
  const host = req.headers.host;
  if (host) {
    return host.split(":")[0];
  }
  return null;
}

export function extractDomain(input_url?: string | null) {
  if (!input_url) return;
  try {
    const url = new URL(input_url);
    return url.hostname;
  } catch {
    try {
      const domainMatch = input_url.match(/^(?:https?:\/\/)?([^\/]+)/i);
      if (domainMatch && domainMatch[1]) return domainMatch[1];
    } catch {}
    return;
  }
}
