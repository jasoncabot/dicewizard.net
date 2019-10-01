import React from 'react';

// TODO: read name and table from local storage?

const SessionContext = React.createContext({
    name: '',
    table: '',
    updateName: (name) => {},
    updateTable: (table) => {},
});

export { SessionContext };