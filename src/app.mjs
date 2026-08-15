import express from 'express';
import { DataLayer } from './JiraToDot/DataLayer.mjs';
import { isOriginAllowed } from './Http/CORs.mjs';

const ROUTES = Object.freeze({
  team: 'currentSprintForTeam',
  project: 'currentSprintForProject',
  version: 'version',
  sprint: 'sprint',
  epic: 'epic',
});

const ALLOWED_HEADERS =
  'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, username, password';

function writeCorsHeaders(request, response) {
  const origin = request.headers.origin || 'http://default';

  if (isOriginAllowed(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }

  response.setHeader('Access-Control-Request-Method', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  response.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
}

export function createApp({
  dataLayerFactory = (login) => new DataLayer(login),
  logger = console,
} = {}) {
  const app = express();
  app.disable('x-powered-by');

  app.use((request, response, next) => {
    writeCorsHeaders(request, response);

    if (request.method === 'OPTIONS') {
      response.status(200).end();
      return;
    }

    next();
  });

  app.get('/health', (_request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ status: 'ok' }));
  });

  app.use(async (request, response) => {
    // Use the raw URL rather than Express's parsed path so the proxy keeps the
    // exact URL-splitting behaviour of the original Node HTTP server.
    const dirs = request.originalUrl.split('/');

    if (dirs.length !== 3 && dirs.length !== 4) {
      response.end(
        `Must have 2 directories (not ${dirs.length} in ${request.originalUrl}) - eg /project/WED`,
      );
      return;
    }

    const path = dirs[1];
    const param = dirs[2];
    const operation = ROUTES[path];

    if (!operation) {
      response.end(
        `Unusual request. Must be team, project, version, sprint or epic. Instead found ${path} in ${request.originalUrl}`,
      );
      return;
    }

    const login = {
      username: request.headers.username,
      password: request.headers.password,
    };

    logger.log(`Request for ${path} with ${param}`);

    try {
      const dataLayer = dataLayerFactory(login);
      const data = await dataLayer[operation](param);
      response.end(JSON.stringify(data));
    } catch (error) {
      response.end(`Error in call ${path} with ${param}: ${error}`);
    }
  });

  return app;
}

export default createApp();
