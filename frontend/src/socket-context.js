import React from 'react';

import io from 'socket.io-client';

const socket = io('localhost:4500');

const SocketContext = React.createContext(socket);

export { SocketContext, socket as ConnectedSocket };