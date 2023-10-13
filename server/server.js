// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join('./frontend')));

// 화면 프레임 -> 60으로 고정
const FRAME_RATE = 60;

const io = require('socket.io')(server);

const { initGame, gameLoop, getUpdatedVelocityUp, getUpdatedVelocityDown,  } = require('./game');
const { makeid } = require('./util');

const state = {};
const clientRooms = {};

// .on 메소드 -> 현재 접속되어 있는 클라이언트로부터 메세지를 수신할 때 사용
io.on('connection', client => { 
    //'connection' : socket.io의 기본 이벤트, 사용자가 웹사이트에 접속하면 자동으로 발생하는 이벤트

    client.on('keydown', handleKeydown); //키 눌렀을때 이벤트
    client.on('keyup', handleKeyUp); //키 눌렀다가 땠을 때 이벤트
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms.get(roomName);
        let allUsers;
        if (room) {
            allUsers = room.size;
        }

        let numClients = 0;
        if(allUsers) {
            numClients = allUsers;
        }

        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = roomName;
        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(roomName);
    }

    function handleNewGame() {
        let roomName = makeid(5); // 5글자 게임 코드 생성
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocityDown(keyCode, state[roomName].players[client.number - 1]);

        if (vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }

    function handleKeyUp(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocityUp(keyCode, state[roomName].players[client.number - 1]);

        if (vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
});


function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const isGameover = gameLoop(state[roomName]);

        if(!isGameover) { //게임이 진행되는 경우
            emitGameState(roomName, state[roomName]);
        } else { //게임 끝나는 경우
            emitGameOver(roomName, state[roomName]);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, state) {
    io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
}