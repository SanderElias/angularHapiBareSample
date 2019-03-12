import { enableProdMode } from '@angular/core';
import { ngHapiEngine } from '@nguniversal/hapi-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import { Request, Server } from 'hapi';
import * as Inert from 'inert';
import { join } from 'path';
import 'zone.js/dist/zone-node.js';

const PORT = process.env.PORT || 4003;
const DIST_FOLDER = join(process.cwd(), 'dist/browser');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {
  AppServerModuleNgFactory,
  LAZY_MODULE_MAP
} = require('./dist/server/main');

const mainApp = require('raw-loader!./dist/browser/index.html');

const server = new Server({ port: PORT, host: 'localhost' });

enableProdMode();

// Keep the browser logs free of errors.
server.route({
  method: 'GET',
  path: '/favicon.ico',
  handler: () => ''
});

server.route({
  method: 'GET',
  path: '/',
  handler: (req: Request) =>
    ngHapiEngine({
      bootstrap: AppServerModuleNgFactory,
      providers: [provideModuleMap(LAZY_MODULE_MAP)],
      req,
      document: mainApp
    })
});

const serverInstance = async () => {
  await server.register(Inert);

  server.route({
    method: 'GET',
    path: '/{file*}',
    handler: {
      directory: {
        path: DIST_FOLDER
      }
    }
  });

  await server.start();
};

serverInstance();
