
// 화면 프레임 -> 60으로 고정
const FRAME_RATE = 60;

const io = require("socket.io")({
    cors: {
        origin: "*",
    }
});

const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { makeid } = require('./util');

const state = {};
const clientRooms = {};

// .on 메소드 -> 현재 접속되어 있는 클라이언트로부터 메세지를 수신할 때 사용
io.on('connection', client => { 
    //'connection' : socket.io의 기본 이벤트, 사용자가 웹사이트에 접속하면 자동으로 발생하는 이벤트

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

    }, 1000 / FRAME_RATE);
}

