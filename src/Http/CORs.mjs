export const DEFAULT_ALLOWED_ORIGINS = Object.freeze([
  'http://localhost',
  'http://localhost:4000',
  'http://im-jira-import.herokuapp.com',
  'https://localhost',
  'https://localhost:4000',
  'https://im-jira-import.herokuapp.com',
]);

export function getAllowedOrigins(
  configuredOrigins = process.env.CORS_ALLOWED_ORIGINS || '',
) {
  const additionalOrigins = configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...additionalOrigins])];
}

export function isOriginAllowed(
  requestOrigin,
  allowedOrigins = getAllowedOrigins(),
) {
  return allowedOrigins.includes(requestOrigin);
}
