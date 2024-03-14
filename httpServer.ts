import * as http from 'http';
import app from './setup/app';

const httpServer: http.Server = http.createServer(app);

export default httpServer;
