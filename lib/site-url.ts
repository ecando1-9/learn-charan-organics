export function getServerAppUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configuredUrl) {
    return configuredUrl;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://learn.charanorganics.com";
}

export function getBrowserAppUrl(): string {
  if (typeof window === "undefined") {
    return getServerAppUrl();
  }

  const currentOrigin = window.location.origin;
  const currentHost = window.location.hostname;

  if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    return currentOrigin;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configuredUrl) {
    return configuredUrl;
  }

  return currentOrigin;
}

export function getAppUrl(): string {
  return typeof window === "undefined" ? getServerAppUrl() : getBrowserAppUrl();
}
