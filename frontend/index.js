//const socket = io('http://34.64.160.84:3000'); //서버 킨 측 ip주소
const socket = io('http://192.168.35.111:3000');// localhost
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

const gameCodeScreen = document.getElementById('gameCode');

newGameBtn.addEventListener('click', newGame); //create room 누를시 -> newGame함수 실행
joinGameBtn.addEventListener('click', joinGame);

let canvas, ctx;
let playerNumber;
let gameActive = false;

/////////////////////////////img files

//player 1
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

var img_Player_attacked = new Image();
img_Player_attacked.src = './img/Player_attacked.png'

var img_Player_attacked_left = new Image();
img_Player_attacked_left.src = './img/Player_attacked_left.png'

var img_Player_grabbed = new Image();
img_Player_grabbed.src = './img/Player_grabbed.png'

var img_Player_grabbed_left = new Image();
img_Player_grabbed_left.src = './img/Player_grabbed_left.png'

//player 2
var img_Idle_full2 = new Image();
img_Idle_full2.src = './img/Player2_idle.png'

var img_Idle_full_left2 = new Image();
img_Idle_full_left2.src = './img/Player2_idle_left.png'

var img_Walking_full2 = new Image();
img_Walking_full2.src = './img/Player2_walking.png'

var img_Walking_full_left2 = new Image();
img_Walking_full_left2.src = './img/Player2_walking_left.png'

var img_Middle_Attack_full2 = new Image();
img_Middle_Attack_full2.src = './img/Player2_attack.png'

var img_Middle_Attack_full_left2 = new Image();
img_Middle_Attack_full_left2.src = './img/Player2_attack_left.png'

var img_Block2 = new Image();
img_Block2.src = './img/Player2_block.PNG'

var img_Block_left2 = new Image();
img_Block_left2.src = './img/Player2_block_left.png'

var img_Player_attacked2 = new Image();
img_Player_attacked2.src = './img/Player2_attacked.png'

var img_Player_attacked_left2 = new Image();
img_Player_attacked_left2.src = './img/Player2_attacked_left.png'

var img_Player_grabbed2 = new Image();
img_Player_grabbed2.src = './img/Player2_grabbed.png'

var img_Player_grabbed_left2 = new Image();
img_Player_grabbed_left2.src = './img/Player2_grabbed_left.png'

//BackGrounds
var img_bg_test = new Image();
img_bg_test.src = './img/BG_test.png'

var img_bg_test1 = new Image();
img_bg_test1.src = './img/Bg_test1.png'

var img_bg_test2 = new Image();
img_bg_test2.src = './img/Bg_test2.png'

var img_bg_station = new Image();
img_bg_station.src = './img/bg_station.png'

var bgArray = [ img_bg_test1, img_bg_station ];

//utils
var img_Player_health = new Image();
img_Player_health.src = './img/Player_healthBar.png'

var img_Zombie_health = new Image();
img_Zombie_health.src = './img/Zombie_healthBar.png'

var img_attack_warning = new Image();
img_attack_warning.src = './img/Attack_warning.png'

var img_interaction_instruction = new Image();
img_interaction_instruction.src = './img/Interaction_instruction.png'

//zombies
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

var img_Zombie_death = new Image();
img_Zombie_death.src = './img/Zombie_death.png'

var img_Zombie_death_left = new Image();
img_Zombie_death_left.src = './img/Zombie_death_left.png'

//runningZombie
var img_RunningZombie_idle = new Image();
img_RunningZombie_idle.src = './img/RunningZombie_idle.png'

var img_RunningZombie_idle_left = new Image();
img_RunningZombie_idle_left.src = './img/RunningZombie_idle_left.png'

var img_RunningZombie_attack = new Image();
img_RunningZombie_attack.src = './img/RunningZombie_attack.png'

var img_RunningZombie_attack_left = new Image();
img_RunningZombie_attack_left.src = './img/RunningZombie_attack_left.png'

var img_RunningZombie_walking = new Image();
img_RunningZombie_walking.src = './img/RunningZombie_walking.png'

var img_RunningZombie_walking_left = new Image();
img_RunningZombie_walking_left.src = './img/RunningZombie_walking_left.png'

var img_RunningZombie_stunned = new Image();
img_RunningZombie_stunned.src = './img/RunningZombie_stunned.png'

var img_RunningZombie_stunned_left = new Image();
img_RunningZombie_stunned_left.src = './img/RunningZombie_stunned_left.png'

var img_RunningZombie_death = new Image();
img_RunningZombie_death.src = './img/RunningZombie_death.png'

var img_RunningZombie_death_left = new Image();
img_RunningZombie_death_left.src = './img/RunningZombie_death_left.png'

var img_RunningZombie_running = new Image();
img_RunningZombie_running.src = './img/RunningZombie_running.png'

var img_RunningZombie_running_left = new Image();
img_RunningZombie_running_left.src = './img/RunningZombie_running_left.png'

var img_RunningZombie_grabbing = new Image();
img_RunningZombie_grabbing.src = './img/RunningZombie_grabbing.png'

var img_RunningZombie_grabbing_left = new Image();
img_RunningZombie_grabbing_left.src = './img/RunningZombie_grabbing_left.png'


//////////////////////////////////////

//socket.emit 은 이벤트 명을 지정하고 데이터 전송 (데이터 필요 없을 수도 있음)
function newGame() { //create room 누를때 발생되는 함수
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

    canvas.width = 1920;
    canvas.height = 960;

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

function PlayerAttack(player) {//player 1 그림
    if (player.vel.lookingRight == true) {
        ctx.drawImage(img_Middle_Attack_full, player.width * player.attackCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
    }

    else if (player.vel.lookingRight == false) {
        ctx.drawImage(img_Middle_Attack_full_left, player.width * player.attackCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
    }
}

function Player2Attack(player) {//player 2 그림
    if (player.vel.lookingRight == true) {
        ctx.drawImage(img_Middle_Attack_full2, player.width * player.attackCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
    }

    else if (player.vel.lookingRight == false) {
        ctx.drawImage(img_Middle_Attack_full_left2, player.width * player.attackCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
    }
}

function drawPlayer(player) { //player 1 그림
        ctx.drawImage(img_Player_health, player.width * (player.healthMax - player.healthCount), 0, player.width, player.height, player.x, player.y + player.canvasLength, player.canvasLength, player.canvasLength);
        if (player.vel.attacking_motion == true) { //공격 하는 경우 -> 움직일 수 없음
            PlayerAttack(player);
        }

        //플레이어가 몬스터에게 맞은 경우 -> 맞은 모션
        else if(player.damaged == true) {
            if (player.vel.lookingRight == true) { //오른쪽을 보고있다가 맞은 경우
                if (player.damagedCount < 60) {
                    if (player.damagedCount <= 30) {
                        ctx.drawImage(img_Player_attacked, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                    }
                    else {
                        ctx.drawImage(img_Player_attacked, 500, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                    }
                }
                else if (damagedCount == 60) {
                    ctx.drawImage(img_Player_attacked, 500, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
            }

            else if(player.vel.lookingRight == false) { //왼쪽을 보고 있다가 맞은 경우
                if (player.damagedCount < 60) {
                    if (player.damagedCount <= 30) {
                        ctx.drawImage(img_Player_attacked_left, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                    }
                    else {
                        ctx.drawImage(img_Player_attacked_left, 500, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                    }
                }
                else if (player.damagedCount == 60) {
                    ctx.drawImage(img_Player_attacked_left, 500, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
            }
        }

        else if (player.grabbed == true) { //잡혀 있는 경우
            ctx.drawImage(img_interaction_instruction, player.interactionCut * 250, 0, player.width, player.height, player.x + 70, player.y - 30, 60, 60);
            if (player.vel.lookingRight == true) {
                ctx.drawImage(img_Player_grabbed, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
            else {
                ctx.drawImage(img_Player_grabbed_left, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
        }

        // 공격중이 아닌 경우
        else {
            if (player.vel.blocking == true) {
                ctx.fillStyle = 'blue';
                if(player.vel.lookingRight == true) { //오른쪽 보고있는 경우 -> 오른쪽 방어
                    ctx.drawImage(img_Block, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }

                else if (player.vel.lookingRight == false) { //왼쪽 보고있는 경우 -> 왼쪽 방어
                    ctx.drawImage(img_Block_left, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
            }

            else if (player.vel.moving == true) { //걷는 경우
                if (player.vel.lookingRight == true) { //오른쪽을 보고있는 경우
                    ctx.drawImage(img_Walking_full, player.width * player.walkingCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
        
                else { // 왼쪽을 보고있는 경우
                    ctx.drawImage(img_Walking_full_left, player.width *player.walkingCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
            }
    
            else { // 가만히 서 있는 경우
                if (player.vel.lookingRight == true) { //오른쪽을 보고있는 경우
                    ctx.drawImage(img_Idle_full, player.width * player.idleCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
        
                else { // 왼쪽을 보고있는 경우
                    ctx.drawImage(img_Idle_full_left, player.width * player.idleCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
            }
        }
}

function drawPlayer2(player) {
    ctx.drawImage(img_Player_health, player.width * (player.healthMax - player.healthCount), 0, player.width, player.height, player.x, player.y + player.canvasLength, player.canvasLength, player.canvasLength);
    if (player.vel.attacking_motion == true) { //공격 하는 경우 -> 움직일 수 없음
        Player2Attack(player);
    }

    //플레이어가 몬스터에게 맞은 경우 -> 맞은 모션
    else if(player.damaged == true) {
        if (player.vel.lookingRight == true) { //오른쪽을 보고있다가 맞은 경우
            if (player.damagedCount < 60) {
                if (player.damagedCount <= 30) {
                    ctx.drawImage(img_Player_attacked2, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
                else {
                    ctx.drawImage(img_Player_attacked2, 500, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
            }
            else if (damagedCount == 60) {
                ctx.drawImage(img_Player_attacked2, 500, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
        }

        else if(player.vel.lookingRight == false) { //왼쪽을 보고 있다가 맞은 경우
            if (player.damagedCount < 60) {
                if (player.damagedCount <= 30) {
                    ctx.drawImage(img_Player_attacked_left2, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
                else {
                    ctx.drawImage(img_Player_attacked_left2, 500, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
            }
            else if (player.damagedCount == 60) {
                ctx.drawImage(img_Player_attacked_left2, 500, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
        }
    }

    else if (player.grabbed == true) { //잡혀 있는 경우
        ctx.drawImage(img_interaction_instruction, player.interactionCut * 250, 0, player.width, player.height, player.x + 70, player.y - 30, 60, 60);
        if (player.vel.lookingRight == true) {
            ctx.drawImage(img_Player_grabbed2, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
        }
        else {
            ctx.drawImage(img_Player_grabbed_left2, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
        }
    }

    // 공격중이 아닌 경우
    else {
        if (player.vel.blocking == true) {
            ctx.fillStyle = 'blue';
            if(player.vel.lookingRight == true) { //오른쪽 보고있는 경우 -> 오른쪽 방어
                ctx.drawImage(img_Block2, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }

            else if (player.vel.lookingRight == false) { //왼쪽 보고있는 경우 -> 왼쪽 방어
                ctx.drawImage(img_Block_left2, 0, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
        }

        else if (player.vel.moving == true) { //걷는 경우
            if (player.vel.lookingRight == true) { //오른쪽을 보고있는 경우
                ctx.drawImage(img_Walking_full2, player.width * player.walkingCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
    
            else { // 왼쪽을 보고있는 경우
                ctx.drawImage(img_Walking_full_left2, player.width *player.walkingCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
        }

        else { // 가만히 서 있는 경우
            if (player.vel.lookingRight == true) { //오른쪽을 보고있는 경우
                ctx.drawImage(img_Idle_full2, player.width * player.idleCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
    
            else { // 왼쪽을 보고있는 경우
                ctx.drawImage(img_Idle_full_left2, player.width * player.idleCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
        }
    }
}

function drawbg(BackGround, currentStageNum) {
    ctx.drawImage(bgArray[currentStageNum], BackGround.bg_x, 420, BackGround.bg_length * (canvas.width / canvas.height), BackGround.bg_length, 0, 0, canvas.width, canvas.height);
}

function drawNormalZombie(zombie, currentStageNum) {
    if (zombie.stageNum == currentStageNum) {
        //공격 경고 알림
        if (zombie.vel.attacking == true) {
            if (zombie.attackRandomNum >= 6 || zombie.dead == true) {// 일반 공격 혹은 사망한 상태
                ctx.drawImage(img_attack_warning, 0, 0, 250, 250, zombie.x + 70, zombie.y - 50, 60, 60);
            }
    
            else if (zombie.attackRandomNum >= 0) {// 가드 불가 공격
                ctx.drawImage(img_attack_warning, 250, 0, 250, 250, zombie.x + 70, zombie.y - 50, 60, 60);
            }
        }
        //zombie 체력바
        ctx.drawImage(img_Zombie_health, zombie.width * (zombie.healthMax - zombie.healthCount), 0, zombie.width, zombie.height, zombie.x, zombie.y + zombie.canvasLength, zombie.canvasLength, zombie.canvasLength);
        if (zombie.dead == false) {
            if (zombie.vel.moving == false) { //움직이지 않는 경우
                if (zombie.stunned == true) {//기절한 경우
                    if (zombie.vel.lookingRight == true) {//오른쪽 기절
                        ctx.drawImage(img_Zombie_stunned, zombie.width * zombie.stunAnimaitonCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {
                        ctx.drawImage(img_Zombie_stunned_left, zombie.width * zombie.stunAnimaitonCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
                //텀이 끝나고 공격하고 있는 중인 경우
                else if (zombie.vel.attacking == true && zombie.waitCount == 30) {
                    if (zombie.vel.lookingRight == true) {//오른쪽 공격
                        ctx.drawImage(img_Zombie_attack, zombie.width * zombie.attackCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {//왼쪽 공격
                        ctx.drawImage(img_Zombie_attack_left, zombie.width * zombie.attackCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
                //가만히 서 있는 경우
                else {
                    if (zombie.vel.lookingRight == true) { // 오른쪽
                        ctx.drawImage(img_Zombie_idle, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else { //왼쪽
                        ctx.drawImage(img_Zombie_idle_left, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
            }
            else {//움직이는 경우
                if (zombie.vel.lookingRight == true) {//오른쪽 걷기
                    ctx.drawImage(img_Zombie_walking, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
                else {
                    ctx.drawImage(img_Zombie_walking_left, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
            }
        }
        else { //죽는 경우
            if (zombie.lookingRight == true) {
                ctx.drawImage(img_Zombie_death, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
            else {
                ctx.drawImage(img_Zombie_death_left, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
        }
    }


    
}

function drawRunningZombie (zombie, currentStageNum) {

    if (zombie.stageNum == currentStageNum) {
        //공격 경고 알림
        if (zombie.vel.attacking == true) {
            if (zombie.attackRandomNum >= 6 || zombie.dead == true) {// 일반 공격 혹은 사망한 상태
                ctx.drawImage(img_attack_warning, 0, 0, 250, 250, zombie.x + 70, zombie.y - 50, 60, 60);
            }
    
            else if (zombie.attackRandomNum >= 0) {// 잡기 공격
                ctx.drawImage(img_attack_warning, 500, 0, 250, 250, zombie.x + 70, zombie.y - 50, 60, 60);
            }
        }

        //zombie 체력바
        ctx.drawImage(img_Zombie_health, zombie.width * (zombie.healthMax - zombie.healthCount), 0, zombie.width, zombie.height, zombie.x, zombie.y + zombie.canvasLength, zombie.canvasLength, zombie.canvasLength);
        if (zombie.dead == false) {
            if (zombie.vel.moving == false) { //움직이지 않는 경우
                if (zombie.stunned == true) {//기절한 경우
                    if (zombie.vel.lookingRight == true) {//오른쪽 기절
                        ctx.drawImage(img_RunningZombie_stunned, zombie.width * zombie.stunAnimaitonCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {
                        ctx.drawImage(img_RunningZombie_stunned_left, zombie.width * zombie.stunAnimaitonCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }

                //특정 플레이어를 잡고 있는 경우
                else if (zombie.grabbing == true) {
                    if (zombie.vel.lookingRight == true) {//오른쪽 잡기
                        ctx.drawImage(img_RunningZombie_grabbing, 0, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {//왼쪽 잡기
                        ctx.drawImage(img_RunningZombie_grabbing_left, 0, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
                //텀이 끝나고 공격하고 있는 중인 경우
                else if (zombie.vel.attacking == true && zombie.waitCount == 30 && zombie.vel.grabbing == false) {
                    if (zombie.vel.lookingRight == true) {//오른쪽 공격
                        ctx.drawImage(img_RunningZombie_attack, zombie.width * zombie.attackCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {//왼쪽 공격
                        ctx.drawImage(img_RunningZombie_attack_left, zombie.width * zombie.attackCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
                //가만히 서 있는 경우
                else {
                    if (zombie.vel.lookingRight == true) { // 오른쪽
                        ctx.drawImage(img_RunningZombie_idle, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else { //왼쪽
                        ctx.drawImage(img_RunningZombie_idle_left, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
            }
            else {//움직이는 경우
                if (zombie.vel.lookingRight == true ) {
                    if (zombie.running == true) {//오른쪽 뛰기
                        ctx.drawImage(img_RunningZombie_running, zombie.width * zombie.runningCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {//오른쪽 걷기
                        ctx.drawImage(img_RunningZombie_walking, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
                else {
                    if (zombie.running == true) {//왼쪽 뛰기
                        ctx.drawImage(img_RunningZombie_running_left, zombie.width * zombie.runningCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {//왼쪽 걷기
                        ctx.drawImage(img_RunningZombie_walking_left, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
            }
        }
        else { //죽는 경우
            if (zombie.lookingRight == true) {
                ctx.drawImage(img_RunningZombie_death, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
            else {
                ctx.drawImage(img_RunningZombie_death_left, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
        }
    }

}

function paintGame(state) { //draw 함수를 이용해야 할 듯
    gameCodeScreen.style.display = "none";
    ctx.clearRect(0,0, canvas.width, canvas.height);
    //console.log(state.players[0]); // 속성은 넘어오지만 메소드는 넘어오지 않는다.
    //draw함수가 안먹히는 상황 -> 그렇다면 여기다가 함수를 구현하자.

    //////////// 범위 확인 용 fillRect
    // //플레이어 -> 파란색
    // ctx.fillStyle = 'blue';
    // ctx.fillRect(state.players[0].x + 40, 800, 5, 30);
    // ctx.fillRect(state.players[0].x + state.players[0].canvasLength - 40, 800, 5, 30);
    
    // ctx.fillRect(state.players[1].x + 40, 800, 5, 30);
    // ctx.fillRect(state.players[1].x + state.players[1].canvasLength - 40, 800, 5, 30);

    // //몬스터 -> 빨간색
    // ctx.fillStyle = 'red';
    // ctx.fillRect(state.zombies[0].x + 40, 800, 5, 30);
    // ctx.fillRect(state.zombies[0].x + state.zombies[0].canvasLength - 40, 800, 5, 30);

    // //몬스터 감지 범위, 공격 범위 -> 노란색
    // ctx.fillStyle = 'yellow';
    // ctx.fillRect(state.zombies[0].x_detectLeft, 800, 5, 30);
    // ctx.fillRect(state.zombies[0].x_detectRight, 800, 5, 30);

    // ctx.fillRect(state.zombies[0].x_attackLeft, 800, 5, 30);
    // ctx.fillRect(state.zombies[0].x_attackRight, 800, 5, 30);
    //////////////////////////
    drawbg(state.bg, state.currentStageNum);
    if(state.players[0].dead == false) {
        drawPlayer(state.players[0]);
    }
    if(state.players[1].dead == false) {
        drawPlayer2(state.players[1]);
    }
    drawNormalZombie(state.zombies[0], state.currentStageNum);
    drawRunningZombie(state.zombies[1], state.currentStageNum);
    console.log(state.players[1].grabbed);
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