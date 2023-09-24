const socket = io('http://34.64.160.84:3000'); //서버 킨 측 ip주소

// 클라이언트 -> 서버 
//socket.on 은 해당 이벤트를 받고 콜백함수를 실행
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput'); //들어가고자 하는 방의 코드
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

let canvas, ctx;
let playerNumber;
let gameActive = false;

/////////////////////////////img files
var img_Idle_full = new Image();
img_Idle_full.src = './img/Player_idle.png'

var img_Idle_full_left = new Image();
img_Idle_full_left.src = './img/Player_idle_left.png'

var img_Walking_full = new Image();
img_Walking_full.src = './img/Player_walking.png'

var img_Walking_full_left = new Image();
img_Walking_full_left.src = './img/Player_walking_left.png'

var img_Middle_Attack_full = new Image();
img_Middle_Attack_full.src = './img/Player_attack.png'

var img_Middle_Attack_full_left = new Image();
img_Middle_Attack_full_left.src = './img/Player_attack_left.png'

var img_Block = new Image();
img_Block.src = './img/Player_block.PNG'

var img_Block_left = new Image();
img_Block_left.src = './img/Player_block_left.png'

var img_BG_test = new Image();
img_BG_test.src = './img/BG_test.png'

var img_Player_health = new Image();
img_Player_health.src = './img/Player_healthBar.png'

var img_Zombie_health = new Image();
img_Zombie_health.src = './img/Zombie_healthBar.png'

var img_Player_attacked = new Image();
img_Player_attacked.src = './img/Player_attacked.png'

var img_Player_attacked_left = new Image();
img_Player_attacked_left.src = './img/Player_attacked_left.png'

var img_Zombie_idle = new Image();
img_Zombie_idle.src = './img/Zombie_idle.png'

var img_Zombie_idle_left = new Image();
img_Zombie_idle_left.src = './img/Zombie_idle_left.png'

var img_Zombie_attack = new Image();
img_Zombie_attack.src = './img/Zombie_attack.png'

var img_Zombie_attack_left = new Image();
img_Zombie_attack_left.src = './img/Zombie_attack_left.png'

var img_Zombie_walking = new Image();
img_Zombie_walking.src = './img/Zombie_walking.png'

var img_Zombie_walking_left = new Image();
img_Zombie_walking_left.src = './img/Zombie_walking_left.png'

var img_Zombie_stunned = new Image();
img_Zombie_stunned.src = './img/Zombie_stunned.png'

var img_Zombie_stunned_left = new Image();
img_Zombie_stunned_left.src = './img/Zombie_stunned_left.png'
//////////////////////////////////////

//socket.emit 은 이벤트 명을 지정하고 데이터 전송 (데이터 필요 없을 수도 있음)
function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code); //code 데이터 같이 전송
    init();
}

function init() {
    initialScreen.style.display = "none"; // 초기화면 가리기
    gameScreen.style.display = "block";   // display: block => 요소를 앞 뒤로 줄바꿈 함

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = 2000;
    canvas.height = 1000;

    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);

    gameActive = true;
}

function keydown(e) {// 입력된 키 정보 전송 (키 누른 경우)
    socket.emit('keydown', e.keyCode);
}


function keyup(e) { // 입력된 키 정보 전송 (키 땠을 경우)
    socket.emit('keyup', e.keyCode);
}

function updateBlockBox(x_right, x_left, y, player) {
    player.BlockBox.x_right = x_right;
    player.BlockBox.x_left = x_left;
    player.BlockBox.y = y;
}

function PlayerAttack(player) {
    if (player.vel.isLookingRight == true) {
        ctx.drawImage(img_Middle_Attack_full, player.width * player.attackCount, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
    }

    else if (player.vel.isLookingRight == false) {
        ctx.drawImage(img_Middle_Attack_full_left, player.width * player.attackCount, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
    }
}

function drawPlayer(player) {

        if (player.vel.isAttacking_motion == true) { //공격 하는 경우 -> 움직일 수 없음
            PlayerAttack(player);
            console.log(player.attackFrame);
        }

        //플레이어가 몬스터에게 맞은 경우 -> 맞은 모션
        else if(player.isDamaged == true) {
            if (player.vel.isLookingRight == true) { //오른쪽을 보고있다가 맞은 경우
                if (player.damagedCount < 60) {
                    if (player.damagedCount <= 30) {
                        ctx.drawImage(img_Player_attacked, 0, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                    }
                    else {
                        ctx.drawImage(img_Player_attacked, 500, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                    }
                }
                else if (damagedCount == 60) {
                    ctx.drawImage(img_Player_attacked, 500, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                }
            }

            else if(player.vel.isLookingRight == false) { //왼쪽을 보고 있다가 맞은 경우
                if (player.damagedCount < 60) {
                    if (player.damagedCount <= 30) {
                        ctx.drawImage(img_Player_attacked_left, 0, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                    }
                    else {
                        ctx.drawImage(img_Player_attacked_left, 500, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                    }
                }
                else if (player.damagedCount == 60) {
                    ctx.drawImage(img_Player_attacked_left, 500, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                }
            }
        }

        // 공격중이 아닌 경우
        else {
            if (player.vel.isBlocking == true) {
                ctx.fillStyle = 'blue';
                if(player.vel.isLookingRight == true) { //오른쪽 보고있는 경우 -> 오른쪽 방어
                    ctx.drawImage(img_Block, 0, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                    ctx.fillRect(player.BlockBox.x_right, player.BlockBox.y, player.BlockBox.width, player.BlockBox.height);
                }

                else if (player.vel.isLookingRight == false) { //왼쪽 보고있는 경우 -> 왼쪽 방어
                    ctx.drawImage(img_Block_left, 0, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                    ctx.fillRect(player.BlockBox.x_left, player.BlockBox.y, player.BlockBox.width, player.BlockBox.height);
                }
            }

            else if (player.vel.isMoving == true) { //걷는 경우
                if (player.vel.isLookingRight == true) { //오른쪽을 보고있는 경우
                    ctx.drawImage(img_Walking_full, player.width * player.walkingCount, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                }
        
                else { // 왼쪽을 보고있는 경우
                    ctx.drawImage(img_Walking_full_left, player.width *player.walkingCount, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                }
            }
    
            else { // 가만히 서 있는 경우
                if (player.vel.isLookingRight == true) { //오른쪽을 보고있는 경우
                    ctx.drawImage(img_Idle_full, player.width * player.idleCount, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                }
        
                else { // 왼쪽을 보고있는 경우
                    ctx.drawImage(img_Idle_full_left, player.width * player.idleCount, 0, player.width, player.height, player.x, player.y, player.CanvasLength, player.CanvasLength);
                }
            }
        }
}

function drawBG(BackGround) {
    ctx.drawImage(img_BG_test, BackGround.BG_x, 0, BackGround.BG_length * (canvas.width / canvas.height), BackGround.BG_length, 0, 0, canvas.width, canvas.height);
}

function drawZombie(zombie) {
    //zombie 체력바
    ctx.drawImage(img_Zombie_health, zombie.width * (zombie.healthMax - zombie.healthCount), 0, zombie.width, zombie.height, zombie.x, zombie.y - 40, zombie.CanvasLength, zombie.CanvasLength);
    if (zombie.vel.isMoving == false) { //움직이지 않는 경우
        if (zombie.isStunned == true) {//기절한 경우
            if (zombie.vel.isLookingRight == true) {//오른쪽 기절
                ctx.drawImage(img_Zombie_stunned, zombie.width * zombie.stunAnimaitonCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.CanvasLength, zombie.CanvasLength);
            }
            else {
                ctx.drawImage(img_Zombie_stunned_left, zombie.width * zombie.stunAnimaitonCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.CanvasLength, zombie.CanvasLength);
            }
        }
        //텀이 끝나고 공격하고 있는 중인 경우
        else if (zombie.vel.isAttacking == true && zombie.waitCount == 30) {
            if (zombie.vel.isLookingRight == true) {//오른쪽 공격
                ctx.drawImage(img_Zombie_attack, zombie.width * zombie.attackCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.CanvasLength, zombie.CanvasLength);
            }
            else {//왼쪽 공격
                ctx.drawImage(img_Zombie_attack_left, zombie.width * zombie.attackCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.CanvasLength, zombie.CanvasLength);
            }
        }
        //가만히 서 있는 경우
        else {
            if (zombie.vel.isLookingRight == true) { // 오른쪽
                ctx.drawImage(img_Zombie_idle, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.CanvasLength, zombie.CanvasLength);
            }
            else { //왼쪽
                ctx.drawImage(img_Zombie_idle_left, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.CanvasLength, zombie.CanvasLength);
            }
        }
    }
    else {//움직이는 경우
        if (zombie.vel.isLookingRight == true) {//오른쪽 걷기
            ctx.drawImage(img_Zombie_walking, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.CanvasLength, zombie.CanvasLength);
        }
        else {
            ctx.drawImage(img_Zombie_walking_left, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.CanvasLength, zombie.CanvasLength);
        }
    }
}

function paintGame(state) { //draw 함수를 이용해야 할 듯
    ctx.clearRect(0,0, canvas.width, canvas.height);
    //console.log(state.players[0]); // 속성은 넘어오지만 메소드는 넘어오지 않는다.
    //draw함수가 안먹히는 상황 -> 그렇다면 여기다가 함수를 구현하자.
    console.log(state.nz1.isCommingBackToPosition);
    drawBG(state.bg);
    drawPlayer(state.players[0]);
    drawPlayer(state.players[1]);
    drawZombie(state.nz1);
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) { //게임이 활성화 상태가 아닌경우
        return;
    }

    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }

    data = JSON.parse(data);

    gameActive = false;

    alert("game over");
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
    reset();
    alert("Unknown game code");
}

function handleTooManyPlayers() {
    reset();
    alert("This game is already in progress");
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}