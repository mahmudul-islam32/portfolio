/**
 * Strapi base URL for browser requests (Docker-friendly).
 */
export const STRAPI_URL = (() => {
  const envUrl = process.env.REACT_APP_STRAPI_URL;
  if (envUrl && envUrl.includes('strapi:')) {
    return envUrl.replace('strapi:', 'localhost:');
  }
  return envUrl || 'http://localhost:1337';
})();
