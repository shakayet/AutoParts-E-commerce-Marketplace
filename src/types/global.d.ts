import { Server } from 'socket.io';

declare global {
  let io: Server;
}
