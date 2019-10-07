import React from 'react';

import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKETIO);

const SocketContext = React.createContext(socket);

export { SocketContext, socket as ConnectedSocket };