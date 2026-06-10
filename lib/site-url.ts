export function getBrowserAppUrl() {
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
