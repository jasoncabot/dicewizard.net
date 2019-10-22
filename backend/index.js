const server = require('http').createServer((req, res) => {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end("{\"status\": \"ok\"}\n");
});
const io = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

const guid = () => {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

const randomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const roll = (count, size) => {
    var total = 0;
    for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * size) + 1;
    }
    return total;
};

let tables = {};
let messages = {};

const name = (id) => {
    return (tables[id] || {}).name;
}

const table = (id) => {
    return (tables[id] || {}).table;
}

const rollInBounds = ({ size, count }) => {
    if (size > 100) return false;
    if (size < 1) return false;
    if (count > 999) return false;
    if (count < 1) return false;
    return true;
}

const log = (socket, action, data) => {
    console.log(JSON.stringify({
        id: socket.id, action, data
    }));
}

const appendText = (table, text) => {
    let message = {
        id: guid(),
        msg: text,
        table: table,
        at: Date.now()
    };
    io.to(table).emit('message', message);

    const updatedMessages = messages[table] || [];
    updatedMessages.unshift(message);
    messages[table] = updatedMessages;
}

const normalise = (tableId) => {
    return (tableId || '').toUpperCase();
}

io.on('connection', (socket) => {
    log(socket, 'connected');

    socket.on('join', (data) => {
        if (data.table.length !== 4) {
            log(socket, 'join', { error: 'invalid table' });
            return;
        }

        let tableId = normalise(data.table);

        if (!table(tableId)) {
            log(socket, 'join', { error: 'table not found' });
            return;
        }

        log(socket, 'joined', data);
        tables[socket.id] = {
            table: tableId, // table id
            name: data.name // person name
        };

        socket.join(tableId);
        appendText(tableId, name(socket.id) + ' joined');

        io.to(socket.id).emit('table_changed', {
            name: data.name,
            table: tableId,
            log: messages[tableId] || []
        });
    });

    socket.on('create', (data) => {
        log(socket, 'create', data);
        const tableId = randomString(4);
        tables[socket.id] = {
            table: tableId,
            name: data.name // person name
        };
        socket.join(tableId);
        appendText(data.table, name(socket.id) + ' started');

        io.to(socket.id).emit('table_changed', {
            name: data.name,
            table: tableId,
            log: messages[tableId] || []
        });
    });

    socket.on('leave', (data) => {
        log(socket, 'leave', data);

        io.to(data.table).emit('message', {
            id: guid(),
            msg: name(socket.id) + ' left',
            table: data.table,
            at: Date.now()
        });

        tables[socket.id] = {};
        socket.leave(data.table);

        io.to(socket.id).emit('table_changed', {
            name: data.name,
            table: '',
            log: []
        });
    });

    socket.on('roll', (data) => {
        log(socket, 'roll', data);
        if (!rollInBounds(data)) {
            log(socket, 'roll', { error: 'data not in bounds' });
            return;
        }
        const text = name(socket.id) + ' rolled ' + roll(data.count, data.size) + ' (' + data.count + 'd' + data.size + ')'
        appendText(table(socket.id), text);
    });
});

server.listen(process.env.PORT || 4500);
