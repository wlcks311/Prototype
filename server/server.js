const io = require("socket.io")({
    cors: {
        origin: "*",
    }
});

const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { makeid } = require('./util');

const state = {};
const clientRooms = {};

io.on('connection', client => {

    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName) {

    }

    function handleNewGame() {

    }

    function handleKeydown(keyCode) {

    }
});


function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);
    })
}

