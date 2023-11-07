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

var gameOver = document.getElementById('gameOver');

newGameBtn.addEventListener('click', newGame); //create room 누를시 -> newGame함수 실행
joinGameBtn.addEventListener('click', joinGame);

let canvas, ctx;
let playerNumber;
let gameActive = false;

let gameMatched = false;

function audioStop(audio) { // 오디오 멈춤 함수 -> stop역할
    audio.pause();
    audio.currentTime = 0;
}

//////////////////////////////stage Information
var stageInfo = document.getElementById('stageInfo');

const arr_stageName = ["   명동역 승강장 입구 ->", "   명동역 승강장 ->", "   명동역 - 회현역 통로 ->", "<- 회현역 승강장   ", "   회현역 승강장 입구 ->",
"   회현역 - 서울역 사이 열차 ->", "서울역"];

//////////////////////////////text dialogue 

var dialogueWindow = document.getElementById('dialogueWindow');
var dialogueText = document.getElementById('dialogueText');
var portrait = document.getElementById('portrait');

//대화가 있는 스테이지인지 확인하는 정보 -> 1이면 대화 있음
var checkStageNum = 0; // 0부터 시작



const arr_dialogueCheck = [1, 0, 0, 0, 0, 0, 0];
const arr_textIndex = [0, 0, 0, 0, 0, 0, 0];
const arr_dialogues = [
    ["원재: 서울역 까지 앞으로 2개 남았군...",
 "두혁: 정말 끝까지 갈만한 가치가 있는 거야?", 
 "원재: 보호소에 있는 보급품도 거의 다 떨어졌어.",
 "원재: 서울역에 대량의 보급품이 방치돼 있다는 정보가 있어. 반드시 우리가 가져와야 해.",
 "원재: 너도 우리 조직에 잘 보일 수 있는 기회라고.",
 "두혁: 살아 돌아간다면 말이지...",
 "원재: 이봐, 앞으로 정신 바짝 차리고 다녀야 할거야.",
 "원재: 저 시체들이랑 싸워본 적 있나?",
 "두혁: 옆에서 본 적은 있어. 직접 싸워보진 않았지.",
 "원재: 다짜고짜 달려든다면 바로 죽을거다. 녀석들은 공격을 당하던 신경쓰지 않아.",
 "원재: 녀석들은 공격에 온힘을 실어. 타이밍을 봐서 잘 막으면 잠깐동안 행동이 느려진다.",
 "원재: 그 때 가격하는게 좋을 거야.",
 "두혁: ...명심할게.",
 "- 'a', 'd' 키로 움직입니다. 'f'키를 눌러 공격합니다",
 "'r' 키를 누르면 방어가 활성화 됩니다.",
 "- 방어에 성공한다면 공격이 더 수월해집니다.",
 "- 맵 진행 방향은 스테이지 정보의 화살표 방향입니다."], // stage 0
 [], //stage 1 대화 없음
 [], //stage 2 대화 없음
 [], //stage3 대화 없음
 [], //stage4 대화 없음
 [], //stage5 대화 없음
 []];

var textIndex = 0;
var dialogueOnGoing = false;
var dialogueFinished = false;

var talking = false;

function checkStageChanged(checkStageNum, stageNum) {
    if (stageNum > checkStageNum) {
        dialogueFinished = false;
        checkStageNum++;
    }
}

var player1_talking = new Audio('./sfx/dialogue/player1_talking.mp3');
player1_talking.volume = 0.5;
var player2_talking = new Audio('./sfx/dialogue/player2_talking.mp3');
player2_talking.volume = 0.5;
var instruction_talking = new Audio('./sfx/dialogue/instruction_talking.mp3');
instruction_talking.volume = 0.5;


function textAnimation(tag, text) {
    tag.innerHTML='';
    dialogueOnGoing = true;
    for(let i=0; i < text.length; i++) {

        if (i == 0) { // 초상화 확인
            if (text[i] == '원') {
                portrait.src = "img/dialogue/player1.png";
                player1_talking.play();
            }
            else if (text[i] == '두') {
                portrait.src = "img/dialogue/player2.png";
                player2_talking.play();
            }
            else if (text[i] == '-') {
                portrait.src = "img/dialogue/instructionPortrait.png";
                instruction_talking.play();
            }
        }
        setTimeout(function(){
            talking = true;
            if (i == text.length - 1) {
                talking = false;
            }
            tag.innerHTML += text[i];
        } , (i+1)*100);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key ==='x' && dialogueOnGoing == true && talking == false) {
        if (textIndex < arr_dialogues[checkStageNum].length - 1) {
            textIndex++;
            textAnimation(dialogueText, arr_dialogues[checkStageNum][textIndex]);
        }
        else {
            textIndex = 0;
            dialogueFinished = true;
            dialogueOnGoing = false;
            dialogueWindow.style.display = "none";
        }
        
    }
})

/////////////////////////////audio files - 소리는 중복 실행 할 수 없기 때문에, 배열로 여러 객체를 생성해줘야 함.


//players
var arr_playerWalkingSfx = [];

for (let i = 0; i < 2; i++) {//플레이어가 2명이므로 2개 생성
    var playerWalking = new Audio('./sfx/player/WalkingTest.mp3');
    playerWalking.loop = true; //걷는 소리는 걷는동안 계속 반복 되어야 함
    arr_playerWalkingSfx.push(playerWalking);
}

var arr_playerAttackSfx = [];

for (let i = 0; i < 2; i++) {//플레이어가 2명이므로 2개 생성
    var playerAttack = new Audio('./sfx/player/playerAttack.mp3');
    arr_playerAttackSfx.push(playerAttack);
}

//NormalZombie
var normalZombieTotalNum = 9;

var arr_normalZombieMoving1Sfx = [];//왼쪽으로 움직일때 내는 소리

for (let i = 0; i < normalZombieTotalNum; i++) { 
    var normalZombieMoving1 = new Audio('./sfx/NormalZombie/NormalZombie_moving1.mp3');
    normalZombieMoving1.volume = 0.5;
    arr_normalZombieMoving1Sfx.push(normalZombieMoving1);
}

var arr_normalZombieMoving2Sfx = [];//오른쪽으로 움직일때 내는 소리

for (let i = 0; i < normalZombieTotalNum; i++) { 
    var normalZombieMoving2 = new Audio('./sfx/NormalZombie/NormalZombie_moving2.mp3');
    normalZombieMoving2.volume = 0.5;
    arr_normalZombieMoving2Sfx.push(normalZombieMoving2);
}

var arr_normalZombieAttackSfx = []; // 공격소리

for (let i = 0; i < normalZombieTotalNum; i++) { 
    var normalZombieAttack = new Audio('./sfx/NormalZombie/NormalZombie_attack.mp3');
    normalZombieAttack.volume = 0.5;
    arr_normalZombieAttackSfx.push(normalZombieAttack);
}

//RunningZombie
var runningZombieTotalNum = 3;

var arr_runningZombieWalking1Sfx = [];

for (let i = 0; i < runningZombieTotalNum; i++) { 
    var runningZombieWalking1 = new Audio('./sfx/RunningZombie/RunningZombie_walking1.mp3');
    arr_runningZombieWalking1Sfx.push(runningZombieWalking1);
}

var arr_runningZombieWalking2Sfx = [];

for (let i = 0; i < runningZombieTotalNum; i++) { 
    var runningZombieWalking2 = new Audio('./sfx/RunningZombie/RunningZombie_walking2.mp3');
    arr_runningZombieWalking2Sfx.push(runningZombieWalking2);
}

var arr_runningZombieAttackSfx = []; // 공격소리

for (let i = 0; i < runningZombieTotalNum; i++) { 
    var runningZombieAttack = new Audio('./sfx/RunningZombie/RunningZombie_attack.mp3');
    runningZombieAttack.volume = 0.5;
    arr_runningZombieAttackSfx.push(normalZombieAttack);
}

var arr_runningZombieRunningSfx = []; // 뛰는소리

for (let i = 0; i < runningZombieTotalNum; i++) { 
    var runningZombieRunning = new Audio('./sfx/RunningZombie/RunningZombie_running.mp3');
    runningZombieRunning.volume = 0.5;
    arr_runningZombieRunningSfx.push(runningZombieRunning);
}

//CrawlingZombie
var crawlingZombieTotalNum = 3;

var arr_crawlingZombieMoving1Sfx = [];//왼쪽으로 움직일때 내는 소리

for (let i = 0; i < crawlingZombieTotalNum; i++) { 
    var crawlingZombieMoving1 = new Audio('./sfx/CrawlingZombie/CrawlingZombie_moving1.mp3');
    arr_crawlingZombieMoving1Sfx.push(crawlingZombieMoving1);
}

var arr_crawlingZombieMoving2Sfx = [];//오른쪽으로 움직일때 내는 소리

for (let i = 0; i < crawlingZombieTotalNum; i++) { 
    var crawlingZombieMoving2 = new Audio('./sfx/CrawlingZombie/CrawlingZombie_moving2.mp3');
    arr_crawlingZombieMoving2Sfx.push(crawlingZombieMoving2);
}

var arr_crawlingZombieAttackSfx = []; // 공격소리

for (let i = 0; i < crawlingZombieTotalNum; i++) { 
    var crawlingZombieAttack = new Audio('./sfx/CrawlingZombie/CrawlingZombie_attack.mp3');
    crawlingZombieAttack.volume = 0.5;
    arr_crawlingZombieAttackSfx.push(crawlingZombieAttack);
}

var arr_crawlingZombieSpitSfx = []; // 원거리 공격 소리

for (let i = 0; i < crawlingZombieTotalNum; i++) { 
    var crawlingZombieSpit = new Audio('./sfx/CrawlingZombie/CrawlingZombie_spit.mp3');
    crawlingZombieSpit.volume = 0.5;
    arr_crawlingZombieSpitSfx.push(crawlingZombieSpit);
}

//BossZombie
var BossZombieNormalAttackSfx = new Audio('./sfx/BossZombie/BossZombieNormalAttack.mp3');
var BossZombieCombo1Sfx = new Audio('./sfx/BossZombie/BossZombieCombo1.mp3');
var BossZombieCombo2Sfx = new Audio('./sfx/BossZombie/BossZombieCombo2.mp3');
var BossZombieCombo3Sfx = new Audio('./sfx/BossZombie/BossZombieCombo3.mp3');
var BossZombieLandingSfx = new Audio('./sfx/BossZombie/BossZombieLanding.mp3');

//hit sound
var hitSfx = new Audio('./sfx/hit.mp3');

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
var img_bg_tutorial = new Image();
img_bg_tutorial.src = './img/BackGrounds/bg_tutorial.png'

var img_bg_station_1 = new Image();
img_bg_station_1.src = './img/BackGrounds/bg_station_1.png'

var img_bg_rail = new Image();
img_bg_rail.src = './img/BackGrounds/bg_rail.png'

var bgArray = [img_bg_tutorial, img_bg_rail, img_bg_station_1, img_bg_rail];

//utils
var img_Player_health = new Image();
img_Player_health.src = './img/Player_healthBar.png'

var img_Zombie_health = new Image();
img_Zombie_health.src = './img/Zombie_healthBar.png'

var img_attack_warning = new Image();
img_attack_warning.src = './img/Attack_warning.png'

var img_interaction_instruction = new Image();
img_interaction_instruction.src = './img/Interaction_instruction.png'

var img_RangedAttack_warning = new Image();
img_RangedAttack_warning.src = './img/RangedAttack_warning.png'

var img_RangedAttack_falling = new Image();
img_RangedAttack_falling.src = './img/RangedAttack_falling.png'

var img_Boss_fallingWarning = new Image();
img_Boss_fallingWarning.src = './img/Boss_fallingWarning.png'

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

//StuckedZombie

var img_StuckedZombie_attack = new Image();
img_StuckedZombie_attack.src = './img/StuckedZombieAttack.png'

var img_StuckedZombie_stunned = new Image();
img_StuckedZombie_stunned.src = './img/StuckedZombieStunned.png'

var img_StuckedZombie_death = new Image();
img_StuckedZombie_death.src = './img/StuckedZombieDeath.png'

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

//CrawlingZombie
var img_CrawlingZombie_idle = new Image();
img_CrawlingZombie_idle.src = './img/CrawlingZombie_idle.png'

var img_CrawlingZombie_idle_left = new Image();
img_CrawlingZombie_idle_left.src = './img/CrawlingZombie_idle_left.png'

var img_CrawlingZombie_attack = new Image();
img_CrawlingZombie_attack.src = './img/CrawlingZombie_attack.png'

var img_CrawlingZombie_attack_left = new Image();
img_CrawlingZombie_attack_left.src = './img/CrawlingZombie_attack_left.png'

var img_CrawlingZombie_rangedAttack = new Image();
img_CrawlingZombie_rangedAttack.src = './img/CrawlingZombie_rangedAttack.png'

var img_CrawlingZombie_rangedAttack_left = new Image();
img_CrawlingZombie_rangedAttack_left.src = './img/CrawlingZombie_rangedAttack_left.png'

var img_CrawlingZombie_walking = new Image();
img_CrawlingZombie_walking.src = './img/CrawlingZombie_walking.png'

var img_CrawlingZombie_walking_left = new Image();
img_CrawlingZombie_walking_left.src = './img/CrawlingZombie_walking_left.png'

var img_CrawlingZombie_stunned = new Image();
img_CrawlingZombie_stunned.src = './img/CrawlingZombie_stunned.png'

var img_CrawlingZombie_stunned_left = new Image();
img_CrawlingZombie_stunned_left.src = './img/CrawlingZombie_stunned_left.png'

var img_CrawlingZombie_death = new Image();
img_CrawlingZombie_death.src = './img/CrawlingZombie_death.png'

var img_CrawlingZombie_death_left = new Image();
img_CrawlingZombie_death_left.src = './img/CrawlingZombie_death_left.png'

//BossZombie

var img_BossZombie_idle = new Image();
img_BossZombie_idle.src = './img/BossZombie_idle.png';

var img_BossZombie_idle_left = new Image();
img_BossZombie_idle_left.src = './img/BossZombie_idle_left.png';

var img_BossZombie_walking = new Image();
img_BossZombie_walking.src = './img/BossZombie_walking.png';

var img_BossZombie_walking_left = new Image();
img_BossZombie_walking_left.src = './img/BossZombie_walking_left.png';

var img_BossZombie_attack = new Image();
img_BossZombie_attack.src = './img/BossZombie_attack.png';

var img_BossZombie_attack_left = new Image();
img_BossZombie_attack_left.src = './img/BossZombie_attack_left.png';

var img_BossZombie_comboAttack = new Image();
img_BossZombie_comboAttack.src = './img/BossZombie_comboAttack.png';

var img_BossZombie_comboAttack_left = new Image();
img_BossZombie_comboAttack_left.src = './img/BossZombie_comboAttack_left.png';

var img_BossZombie_jump = new Image();
img_BossZombie_jump.src = './img/BossZombie_jump.png';

var img_BossZombie_jump_left = new Image();
img_BossZombie_jump_left.src = './img/BossZombie_jump_left.png';

var img_BossZombie_land = new Image();
img_BossZombie_land.src = './img/BossZombie_land.png';

var img_BossZombie_land_left = new Image();
img_BossZombie_land_left.src = './img/BossZombie_land_left.png';

var img_BossZombie_death = new Image();
img_BossZombie_death.src = './img/BossZombie_death.png';

var img_BossZombie_death_left = new Image();
img_BossZombie_death_left.src = './img/BossZombie_death_left.png';

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
    gameScreen.style.display = "inline";   // display: block => 요소를 앞 뒤로 줄바꿈 함

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
    if (player.attackCount == 3) {//3번째 컷에서 공격 소리 재생
        arr_playerAttackSfx[0].play();
    }
    if (player.vel.lookingRight == true) {
        ctx.drawImage(img_Middle_Attack_full, player.width * player.attackCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
    }

    else if (player.vel.lookingRight == false) {
        ctx.drawImage(img_Middle_Attack_full_left, player.width * player.attackCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
    }
}

function Player2Attack(player) {//player 2 그림
    if (player.attackCount == 3) {//3번째 컷에서 공격 소리 재생
        arr_playerAttackSfx[1].play();
    }
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
            ctx.drawImage(img_interaction_instruction, player.interactionCut * 250, 0, 250, 250, player.x + 70, player.y - 30, 60, 60);
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
                arr_playerWalkingSfx[0].play();
                if (player.vel.lookingRight == true) { //오른쪽을 보고있는 경우
                    ctx.drawImage(img_Walking_full, player.width * player.walkingCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
        
                else { // 왼쪽을 보고있는 경우
                    ctx.drawImage(img_Walking_full_left, player.width *player.walkingCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
                }
            }
    
            else { // 가만히 서 있는 경우
                audioStop(arr_playerWalkingSfx[0]);
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
        ctx.drawImage(img_interaction_instruction, player.interactionCut * 250, 0, 250, 250, player.x + 70, player.y - 30, 60, 60);
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
            arr_playerWalkingSfx[1].play();
            if (player.vel.lookingRight == true) { //오른쪽을 보고있는 경우
                ctx.drawImage(img_Walking_full2, player.width * player.walkingCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
    
            else { // 왼쪽을 보고있는 경우
                ctx.drawImage(img_Walking_full_left2, player.width *player.walkingCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
        }

        else { // 가만히 서 있는 경우
            audioStop(arr_playerWalkingSfx[1]);
            if (player.vel.lookingRight == true) { //오른쪽을 보고있는 경우
                ctx.drawImage(img_Idle_full2, player.width * player.idleCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
    
            else { // 왼쪽을 보고있는 경우
                ctx.drawImage(img_Idle_full_left2, player.width * player.idleCount, 0, player.width, player.height, player.x, player.y, player.canvasLength, player.canvasLength);
            }
        }
    }
}
//임시로 1만
function drawbg(BackGround, currentStageNum) {
    ctx.drawImage(bgArray[currentStageNum], BackGround.bg_x, 0, BackGround.bg_length * (canvas.width / canvas.height), BackGround.bg_length, 0, 0, canvas.width, canvas.height);
}

function drawStuckedZombie(zombie, currentStageNum) {
    if (zombie.stageNum == currentStageNum) {
        if (zombie.stunned == false && zombie.dead == false) {
            ctx.drawImage(img_StuckedZombie_attack, zombie.width * zombie.attackCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
        }
        else if (zombie.stunned == true && zombie.dead == false) {
            ctx.drawImage(img_StuckedZombie_stunned, zombie.width * zombie.stunCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
        }
        else if (zombie.dead == true) {
            if (zombie.deathCut == 0) {
                hitSfx.play();
            }
            ctx.drawImage(img_StuckedZombie_death, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
        }
    }
}

function drawNormalZombie(zombie, currentStageNum) {
    if (zombie.stageNum == currentStageNum) {
        if (zombie.hitCheck == true && zombie.dead == false) {
            hitSfx.play();
        }
        //공격 경고 알림
        if (zombie.vel.attacking == true) {
            if (zombie.attackRandomNum >= 2 || zombie.dead == true) {// 일반 공격 혹은 사망한 상태
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
                    if (zombie.attackCount == 1) {
                        arr_normalZombieAttackSfx[zombie.sfxIndex].play();
                    }
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
                    if (zombie.walkingCut == 1 && zombie.x < 1900 && zombie.x > 10) {
                        arr_normalZombieMoving1Sfx[zombie.sfxIndex].play();
                    }
                    ctx.drawImage(img_Zombie_walking, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
                else {
                    if (zombie.walkingCut == 1 && zombie.x < 1900 && zombie.x > 10) {
                        arr_normalZombieMoving2Sfx[zombie.sfxIndex].play();
                    }
                    ctx.drawImage(img_Zombie_walking_left, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
            }
        }
        else { //죽는 경우
            if (zombie.deathCut == 0) {
                hitSfx.play();
            }
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
        if (zombie.hitCheck == true && zombie.dead == false) {
            hitSfx.play();
        }
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
                    if (zombie.attackCount == 1) {
                        arr_runningZombieAttackSfx[zombie.sfxIndex].play();
                    }
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
                        arr_runningZombieRunningSfx[zombie.sfxIndex].play();
                        ctx.drawImage(img_RunningZombie_running, zombie.width * zombie.runningCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {//오른쪽 걷기
                        if (zombie.walkingCut == 1 && zombie.x < 1900 && zombie.x > 10) {
                            arr_runningZombieWalking1Sfx[zombie.sfxIndex].play();
                        }
                        ctx.drawImage(img_RunningZombie_walking, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
                else {
                    if (zombie.running == true) {//왼쪽 뛰기
                        arr_runningZombieRunningSfx[zombie.sfxIndex].play();
                        ctx.drawImage(img_RunningZombie_running_left, zombie.width * zombie.runningCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {//왼쪽 걷기
                        if (zombie.walkingCut == 1 && zombie.x < 1900 && zombie.x > 10) {
                            arr_runningZombieWalking2Sfx[zombie.sfxIndex].play();
                        }
                        ctx.drawImage(img_RunningZombie_walking_left, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
            }
        }
        else { //죽는 경우
            if (zombie.deathCut == 0) {
                hitSfx.play();
            }
            if (zombie.lookingRight == true) {
                ctx.drawImage(img_RunningZombie_death, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
            else {
                ctx.drawImage(img_RunningZombie_death_left, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
        }
    }

}

function drawCrawlingZombie(zombie, currentStageNum) {
    if (zombie.stageNum == currentStageNum) { //해당 스테이지일 경우 그리기
        if (zombie.hitCheck == true && zombie.dead == false) {
            hitSfx.play();
        }
        //체력바
        ctx.drawImage(img_Zombie_health, zombie.width * (zombie.healthMax - zombie.healthCount), 0, zombie.width, zombie.height, zombie.x, zombie.y + zombie.canvasLength, zombie.canvasLength, zombie.canvasLength);
        if (zombie.dead == false) {
            ////////////좀비 애니메이션
            if (zombie.spitting == true && zombie.waitCount >= 60 && zombie.waitCount <= 90) {//발사모션
                if (zombie.spittingCut == 1) {
                    arr_crawlingZombieSpitSfx[zombie.sfxIndex].play();
                }
                if (zombie.vel.lookingRight == true) {//오른쪽 보고있는 경우
                    ctx.drawImage(img_CrawlingZombie_rangedAttack, zombie.width * zombie.spittingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
                else {//왼쪽
                    ctx.drawImage(img_CrawlingZombie_rangedAttack_left, zombie.width * zombie.spittingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
            }

            else if (zombie.spitting == false && zombie.vel.attacking == true && zombie.waitCount == 30) { // 근거리 공격
                if (zombie.attackCount == 1) {
                    arr_crawlingZombieAttackSfx[zombie.sfxIndex].play();
                }
                if (zombie.vel.lookingRight == true) {//오른쪽 보고있는 경우
                    ctx.drawImage(img_CrawlingZombie_attack, zombie.width * zombie.attackCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
                else {//왼쪽
                    ctx.drawImage(img_CrawlingZombie_attack_left, zombie.width * zombie.attackCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
            }

            else if (zombie.vel.moving == false) {// 가만히 서있는 경우
                if (zombie.vel.lookingRight == true) { // 오른쪽
                    ctx.drawImage(img_CrawlingZombie_idle, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
                else { //왼쪽
                    ctx.drawImage(img_CrawlingZombie_idle_left, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
            }

            else if (zombie.stunned == true) {//기절한 경우
                if (zombie.vel.lookingRight == true) {//오른쪽 기절
                    ctx.drawImage(img_CrawlingZombie_stunned, zombie.width * zombie.stunAnimaitonCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
                else {
                    ctx.drawImage(img_CrawlingZombie_stunned_left, zombie.width * zombie.stunAnimaitonCount, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
            }

            else if (zombie.vel.moving == true){//움직이는 경우
                if (zombie.vel.lookingRight == true) {//오른쪽 걷기
                    if (zombie.walkingCut == 1 && zombie.x < 1900 && zombie.x > 10) {
                        arr_crawlingZombieMoving1Sfx[zombie.sfxIndex].play();
                    }
                    ctx.drawImage(img_CrawlingZombie_walking, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
                else {
                    if (zombie.walkingCut == 1 && zombie.x < 1900 && zombie.x > 10) {
                        arr_crawlingZombieMoving2Sfx[zombie.sfxIndex].play();
                    }
                    ctx.drawImage(img_CrawlingZombie_walking_left, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                }
            }
            //////////// 발사체 애니메이션
            if (zombie.waitCount > 90 && zombie.waitCount < 110) {//경고 표시
                ctx.drawImage(img_RangedAttack_warning, 0, 0, zombie.width, zombie.height, zombie.rangedAttackTarget - 100, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
            else if (zombie.waitCount >= 110 && zombie.waitCount < 120) {//투사체 떨어지는 첫번째 컷
                ctx.drawImage(img_RangedAttack_falling, 0, 0, zombie.width, zombie.height, zombie.rangedAttackTarget - 100, zombie.y - 100, zombie.canvasLength, zombie.canvasLength);
            }
            else if (zombie.waitCount == 120) {//그 이후의 투사체 떨어지는 컷들
                ctx.drawImage(img_RangedAttack_falling, zombie.width * zombie.poisonFallingCut, 0, zombie.width, zombie.height, zombie.rangedAttackTarget - 100, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
        }
        else {//죽는 경우
            if (zombie.deathCut == 0) {
                hitSfx.play();
            }
            if (zombie.lookingRight == true) {
                ctx.drawImage(img_CrawlingZombie_death, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
            else {
                ctx.drawImage(img_CrawlingZombie_death_left, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
        }
    }
}

function drawBossZombie(zombie, currentStageNum) {
    if (zombie.stageNum == currentStageNum) {
        if (zombie.hitCheck == true && zombie.dead == false) {
            hitSfx.play();
        }
        //공격 경고 알림
        if (zombie.vel.attacking == true) {
            if (zombie.attackRandomNum <= 6 || zombie.dead == true) {// 일반 공격 혹은 사망한 상태
                ctx.drawImage(img_attack_warning, 0, 0, 250, 250, zombie.x + 70, zombie.y - 50, 60, 60);
            }
    
            else if (zombie.attackRandomNum > 6) {// 연속 공격
                ctx.drawImage(img_attack_warning, 250, 0, 250, 250, zombie.x + 70, zombie.y - 50, 60, 60);
            }
        }
        //zombie 체력바
        ctx.drawImage(img_Zombie_health, zombie.width * (zombie.healthMax - zombie.healthCount), 0, zombie.width, zombie.height, zombie.x, zombie.y + zombie.canvasLength, zombie.canvasLength, zombie.canvasLength);
        if (zombie.dead == false) {
            if (zombie.vel.moving == false) { //움직이지 않는 경우
                //텀이 끝나고 공격하고 있는 중인 경우
                if (zombie.vel.attacking == true && zombie.waitCount == 120) {
                    if (zombie.attackRandomNum <= 6) { //일반 공격
                        if (zombie.attackCut == 1) {
                            BossZombieNormalAttackSfx.play();
                        }
                        if (zombie.vel.lookingRight == true) {//오른쪽 공격
                            ctx.drawImage(img_BossZombie_attack, zombie.width * zombie.attackCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                        }
                        else {//왼쪽 공격
                            ctx.drawImage(img_BossZombie_attack_left, zombie.width * zombie.attackCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                        }
                    }
                    else { // 연속 공격
                        if (zombie.comboAttackCut == 0 && zombie.waitCount == 120) {
                            BossZombieCombo1Sfx.play();
                        }
                        if (zombie.comboAttackCut == 4) {
                            BossZombieCombo2Sfx.play();
                        }
                        if (zombie.comboAttackCut == 8) {
                            BossZombieCombo2Sfx.play();
                        }

                        if (zombie.vel.lookingRight == true) {//오른쪽 공격
                            ctx.drawImage(img_BossZombie_comboAttack, zombie.width * zombie.attackCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                        }
                        else {//왼쪽 공격
                            ctx.drawImage(img_BossZombie_comboAttack_left, zombie.width * zombie.attackCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                        }
                    }
                    
                }
                //가만히 서 있는 경우
                else {
                    if (zombie.vel.lookingRight == true) { // 오른쪽
                        ctx.drawImage(img_BossZombie_idle, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else { //왼쪽
                        ctx.drawImage(img_BossZombie_idle_left, zombie.width * zombie.idleCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
            }
            else {//움직이는 경우
                if (zombie.moveRandNum >= 8) {// 공중 이동
                    if (zombie.vel.lookingRight == true) {//오른쪽
                        if (zombie.jumpCount < 60) {//점프 동작
                            if (zombie.jumpCount < 10) {
                                ctx.drawImage(img_BossZombie_jump, zombie.width * zombie.jumpCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                            }
                            else if (zombie.jumpCut < 20) {
                                ctx.drawImage(img_BossZombie_jump, zombie.width * zombie.jumpCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 250, zombie.canvasLength, zombie.canvasLength);
                            }

                            else if (zombie.jumpCount < 30) {
                                ctx.drawImage(img_BossZombie_jump, zombie.width * zombie.jumpCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 450, zombie.canvasLength, zombie.canvasLength);
                            }
                            else {
                                ctx.drawImage(img_BossZombie_jump, zombie.width * zombie.jumpCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 450, zombie.canvasLength, zombie.canvasLength);
                            }
                        }
                        else if (zombie.jumpCount == 60 && zombie.delayCount == 60 && zombie.fallingWarningCount < 150) { // 경고 표시
                            if ((zombie.fallingWarningCount / 30) % 2 == 0) {
                                ctx.drawImage(img_Boss_fallingWarning, 0, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                            }
                        }
                        else if (zombie.fallingCount < 90 && zombie.fallingWarningCount == 150) { //착지
                            if (zombie.fallingCount < 10) {
                                ctx.drawImage(img_BossZombie_land, zombie.width * zombie.landCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 450, zombie.canvasLength, zombie.canvasLength);
                            }
                            else if (zombie.fallingCount < 20) {
                                ctx.drawImage(img_BossZombie_land, zombie.width * zombie.landCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 250, zombie.canvasLength, zombie.canvasLength);
                            }
                            else if (zombie.fallingCount < 90) {
                                if (zombie.fallingCount == 30) {
                                    BossZombieLandingSfx.play();
                                }
                                ctx.drawImage(img_BossZombie_land, zombie.width * zombie.landCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                            }
                        }
                    }
                    else {//왼쪽
                        if (zombie.jumpCount < 60) {//점프 동작
                            if (zombie.jumpCount < 10) {
                                ctx.drawImage(img_BossZombie_jump_left, zombie.width * zombie.jumpCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                            }
                            else if (zombie.jumpCut < 20) {
                                ctx.drawImage(img_BossZombie_jump_left, zombie.width * zombie.jumpCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 250, zombie.canvasLength, zombie.canvasLength);
                            }

                            else if (zombie.jumpCount < 30) {
                                ctx.drawImage(img_BossZombie_jump_left, zombie.width * zombie.jumpCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 450, zombie.canvasLength, zombie.canvasLength);
                            }
                            else {
                                ctx.drawImage(img_BossZombie_jump_left, zombie.width * zombie.jumpCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 450, zombie.canvasLength, zombie.canvasLength);
                            }
                        }
                        else if (zombie.jumpCount == 60 && zombie.delayCount == 60 && zombie.fallingWarningCount < 150) { // 경고 표시
                            if ((zombie.fallingWarningCount / 30) % 2 == 0) {
                                ctx.drawImage(img_Boss_fallingWarning, 0, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                            }
                        }
                        else if (zombie.fallingCount < 90 && zombie.fallingWarningCount == 150) { //착지
                            if (zombie.fallingCount < 10) {
                                ctx.drawImage(img_BossZombie_land_left, zombie.width * zombie.landCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 450, zombie.canvasLength, zombie.canvasLength);
                            }
                            else if (zombie.fallingCount < 20) {
                                ctx.drawImage(img_BossZombie_land_left, zombie.width * zombie.landCut, 0, zombie.width, zombie.height, zombie.x, zombie.y - 250, zombie.canvasLength, zombie.canvasLength);
                            }
                            else if (zombie.fallingCount < 90) {
                                if (zombie.fallingCount == 30) {
                                    BossZombieLandingSfx.play();
                                }
                                ctx.drawImage(img_BossZombie_land_left, zombie.width * zombie.landCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                            }
                        }
                    }
                }
                else {//일반 이동
                    if (zombie.vel.lookingRight == true) {//오른쪽 걷기
                        ctx.drawImage(img_BossZombie_walking, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                    else {
                        ctx.drawImage(img_BossZombie_walking_left, zombie.width * zombie.walkingCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
                    }
                }
            }
        }
        else { //죽는 경우
            if (zombie.deathCut == 0) {
                hitSfx.play();
            }
            if (zombie.lookingRight == true) {
                ctx.drawImage(img_Zombie_death, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
            else {
                ctx.drawImage(img_Zombie_death_left, zombie.width * zombie.deathCut, 0, zombie.width, zombie.height, zombie.x, zombie.y, zombie.canvasLength, zombie.canvasLength);
            }
        }
    }
}

///////////////////////////////////painting Game

function paintGame(state) { //draw 함수를 이용해야 할 듯
    gameCodeScreen.style.display = "none";

    checkStageChanged(checkStageNum, state.currentStageNum);
    

    if (dialogueOnGoing == false && dialogueFinished == false && arr_dialogueCheck[state.currentStageNum] == 1) { // 대화 시작
        dialogueWindow.style.display = "block";
        textAnimation(dialogueText, arr_dialogues[state.currentStageNum][textIndex]);
    }
    ctx.clearRect(0,0, canvas.width, canvas.height);
    //////////////////////////
    drawbg(state.bg, state.currentStageNum);
    //drawbg(state.bg);
    if(state.players[0].dead == false) {
        drawPlayer(state.players[0]);
    }
    if(state.players[1].dead == false) {
        drawPlayer2(state.players[1]);
    }

    if (state.players[0].dead == true && state.players[1].dead == true) {//game over
        gameOver.style.display = "block";
    }

    drawStuckedZombie(state.sz, state.currentStageNum);
    
    for (let i =0; i < state.normalZombies.length; i++) {
        drawNormalZombie(state.normalZombies[i], state.currentStageNum);
    }

    for (let i =0; i < state.runningZombies.length; i++) {
        drawRunningZombie(state.runningZombies[i], state.currentStageNum);
    }

    for (let i =0; i < state.crawlingZombies.length; i++) {
        drawCrawlingZombie(state.crawlingZombies[i], state.currentStageNum);
    }

    drawBossZombie(state.bz, state.currentStageNum);


    stageInfo.style.display = "block";
    stageInfo.style.innerHTML = arr_stageName[state.currentStageNum];


    //for test
}




//////////////////////////////////////////////

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
    gameMatched = false;

    alert("game over");

    reset();
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