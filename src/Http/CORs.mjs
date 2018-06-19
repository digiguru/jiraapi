export function isOriginAllowed (requestOrigin) {
    const allowedHeaders = [
    "http://localhost",
    "http://localhost:4000",
    "http://im-jira-import.herokuapp.com",
    "https://localhost",
    "https://localhost:4000",
    "https://im-jira-import.herokuapp.com"
    ];
    return !!(allowedHeaders.find((v) => v === requestOrigin));
}
