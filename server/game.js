module.exports ={
    initGame,
    gameLoop,
    getUpdatedVelocityDown,
    getUpdatedVelocityUp,
}

//게임 시작 및 로직 관리

createFillArray = function(len, n) {
    return new Array(len).fill(n);
}

collisonCheckX = createFillArray(2000, -1); //캔버스의 가로 길이만큼의 x좌표계 생성. 기본 원소값은 전부 -1 -> 물체가 없는 상태
// 플레이어가 서 있는 곳 -> 0
// 몬스터가 서 있는 곳 -> 1

function biggerX(p1_x, p2_x) {
    if (p1_x >= p2_x) {
        return p1_x;
    }
    else {
        return p2_x;
    }
}

function smallerX(p1_x, p2_x){
    if (p1_x <= p2_x) {
        return p1_x;
    }
    else {
        return p2_x;
    }
}

//canvas = document.getElementById('canvas'); 문서객체에서 참고할 수 없기때문에
let canvas_width = 2000;
let canvas_height = 1000;

/////////////////////   Classes  /////////////////////////////
class BackGround {
    constructor() {
        this.BG_length = canvas_width;
        this.BG_CanvasLength = canvas_height;
        this.BG_x = 0;
        this.BG_count = 4;
        this.BG_xMax = (this.BG_length * this.BG_count) - this.BG_length * (canvas_width / canvas_height);
        this.ratio = this.BG_length / canvas_height;
        this.isBGmovingRight = false;
        this.isBGmovingLeft = false;
         //주인공이 화면 끝까지 이동할 수 있는 경우는 오른쪽으로 가면서 BG_x == BG_xMax이거나, 왼쪽으로 가면서 BG_x == 0 인 경우. 그 이외에는 화면이 움직여야 함
    }
    draw() {
        ctx.drawImage(img_BG_test, this.BG_x, 0, this.BG_length * (canvas_width / canvas_height), this.BG_length, 0, 0, canvas_width, canvas_height);
    }
}

// 몹 기본 상위 클래스
class Creature {
    constructor(x, y, width, height, CanvasLength) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.CanvasLength = CanvasLength;
        this.attackBox = {
            position_x : this.x + this.CanvasLength / 2,
            position_y : this.y - 50,
            width: 80,
            height: 50,
            atkTimer: 0
        }
        //각 동작의 총 컷 수
        this.idleLoop = 0;
        this.walkingLoop = 0;
        this.attackLoop = 0;

        //각 동작의 현재 몇 번째 컷인지 알려주는 정보
        this.idleCut = 0;
        this.walkingCut = 0;
        this.attackCut = 0;

        //각 동작의 현재 몇 번째 프레임인지 알려주는 정보
        this.idleCount = 0;
        this.walkingCount = 0;
        this.attackCount = 0;


        //해당 플레이어의 키보드 입력에 영향을 받는 속성들
        this.vel = {
            // 보고 있는 방향
            isLookingRight : true,

            // 공격하고 있는지 여부
            isAttacking : false,
            isAttacking_motion : false,

            //움직이고 있는지 여부
            isMoving : false,
            isMovingRight : false,
            isMovingLeft : false,

            //방어 하고있는지 여부
            isBlocking : false
        }



        //맞았는지 여부
        this.isDamaged = false;
        this.damagedCount = 0;

        //체력
        this.healthMax = 3;
        this.healthCount = this.healthMax;
    }

    setLocation(x, y) {
        this.x = x;
        this.y = y;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    setCanvasSize(CanvasLength) {
        this.CanvasLength = CanvasLength;
    }

    setAttackBoxSize(width, height) {
        this.attackBox.width = width;
        this.attackBox.height = height;
    }

    setLoops(idleLoop, walkingLoop, attackLoop) {
        this.idleLoop = idleLoop;
        this.walkingLoop = walkingLoop;
        this.attackLoop = attackLoop;
    }

    setCounts(idleCount, walkingCount, attackCount) {
        this.idleCount = idleCount;
        this.walkingCount = walkingCount;
        this.attackCount = attackCount;
    }
}

class MainCharacter extends Creature {
    constructor(x, y, width, height, CanvasLength) {
        super(x, y, width, height, CanvasLength);
        this.frameCount = 0;
        this.damagedCount = 0;
        this.refreshRate = 10;
        this.attackTimer = 0;
        this.attackFrame = 0;
        this.damagedLoop = 0;
        this.BlockBox = {
            x_right : this.x + this.CanvasLength - 70,
            x_left : this.x + 30,
            y : this.y + 60,
            width : 40,
            height : 70
        }
    }


    attack() {
        if (this.vel.isLookingRight == true) {
            if (attackFrame < 30 && (this.attackCount <= 1)) {
                attackFrame+=6;
            }

            else if (attackFrame < 30 && (this.attackCount == 2)) {
                attackFrame+=3;
            }
            else if (attackFrame < 30 && (this.attackCount <= 4)) {
                attackFrame+=5
            }
            else if (attackFrame < 30 && (this.attackCount == 5)) {
                attackFrame+=3;
            }

            else if(attackFrame == 30) {
                attackFrame = 0;
                if (this.attackCount == this.attackLoop - 1) {
                    this.attackCount = 0;
                    this.isAttacking_motion = false; //공격 동작 종료
                }

                else {
                    this.attackCount++;
                }
            }
        }

        else if (this.vel.isLookingRight == false) {
            if (attackFrame < 30 && (this.attackCount <= 1)) {
                attackFrame+=6;
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }

            else if (attackFrame < 30 && (this.attackCount == 2)) {
                attackFrame+=3;
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
            else if (attackFrame < 30 && (this.attackCount <= 4)) {
                attackFrame+=5
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
            else if (attackFrame < 30 && (this.attackCount == 5)) {
                attackFrame+=3;
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }

            else if(attackFrame == 30) {
                attackFrame = 0;
                if (this.attackCount == this.attackLoop - 1) {
                    this.attackCount = 0;
                    this.isAttacking_motion = false; //공격 동작 종료
                }

                else {
                    this.attackCount++;
                }
                ctx.drawImage(img_Middle_Attack_full_left, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
        }
    }
}

class NormalZombie extends Creature { //좀비 클래스
    constructor(x, y, width, height, CanvasLength) {
        super(x, y, width, height, CanvasLength);
        this.move_range = 100; // 몹이 무작위로 움직이는 최대 범위
        this.move_randNum = 0; // 몹이 무작위로 움직이는 범위
        this.moveCount = 0;
        this.speed = 1;        // 몹 움직이는 속도
        this.xMax_left = 0;
        this.xMax_right = 0;
        this.x_detectLeft = this.x - 150; //몹이 왼쪽에서 플레이어를 감지 할 수 있는 범위
        this.x_detectRight = this.x + this.CanvasLength + 150; //몹이 오른쪽에서 플레이어를 감지 할 수 있는 범위
        this.x_attackLeft = this.x + 30; //몹이 왼쪽에서 플레이어를 공격 할 수 있는 범위
        this.x_attackRight = this.x + this.CanvasLength - 30; 
        this.isMovingDone = true;
        this.isDead = false;
        this.attackBox.width = 100;
        this.attackFrame = 0;
        this.isStunned = false;
        this.stunCount = 0;
        this.stunAnimaitonCount = 0;
        this.stunLoop = 0;
        this.waitCount = 0;
    }

    setSpeed(speed) {
        this.speed = speed;
    }
    setFixedRange(xMax_left, xMax_right) {
        this.xMax_left = xMax_left;
        this.xMax_right = xMax_right;
    }
    setMoveRange(move_range) {
        this.move_range = move_range;
    }

    setStunLoop(stunLoop) {
        this.stunLoop = stunLoop;
    }

    comeBackToPosition() {
        console.log('come back to position');
        this.vel.isMoving = true;
        if(this.x < (this.xMax_left + this.xMax_right) / 2) { //왼쪽으로 벗어난 경우
            if (this.x != (this.xMax_left + this.xMax_right) / 2) { //가운데로 올 때까지 이동
                this.vel.isLookingRight = true;
                collisonCheckX[this.x + 50] = -1;
                collisonCheckX[this.x + this.CanvasLength - 49] = 1;
                this.x++;
            }
        }
        else if ((this.xMax_left + this.xMax_right) / 2 < this.x) {  // 오른쪽으로 벗어난 경우
            if (this.x != (this.xMax_left + this.xMax_right) / 2) { //가운데로 올 때까지 이동
                this.vel.isLookingRight = false;
                collisonCheckX[this.x + 49] = 1;
                collisonCheckX[this.x + this.CanvasLength - 50] = -1;
                this.x--;
            }
        }
    }

    stun() {
        this.vel.isMoving = false;
        if (this.stunCount < 120) {
            this.stunCount++;
        }
        else {
            this.isStunned = false;
            this.stunCount = 0;
        }
    }

    attack(p1, p2) {
        this.vel.isMoving = false;

        if (this.vel.isLookingRight == true) { // 오른쪽 보고있는 경우
            if (this.attackBox.atkTimer <= this.attackBox.width) { //오른쪽 공격 진행중. 공격범위 -> 100, 프레임당 2. 50프레임 소모
                //공격 상자 늘리기 전에 플레이어들의 방어 확인
                if (p1.vel.isBlocking == true && (this.attackBox.position_x + this.attackBox.atkTimer + 1) >= p1.BlockBox.x_left) { 
                    // 플레이어1의 왼쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                    this.isStunned = true;
                    this.vel.isAttacking = false;
                    this.attackBox.atkTimer = 0;
                }

                if (p2.vel.isBlocking == true && (this.attackBox.position_x + this.attackBox.atkTimer + 1) >= p2.BlockBox.x_left) {
                    //플레이어2의 왼쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                    this.isStunned = true;
                    this.vel.isAttacking = false;
                    this.attackBox.atkTimer = 0;
                }
                else {
                    if (this.waitCount < 30) { //몬스터가 공격 하기 전 잠깐 주는 텀
                        this.waitCount++;
                    }

                    else if (this.waitCount == 30) {
                        this.attackBox.atkTimer+=2;
                    }


                    if (collisonCheckX[this.attackBox.position_x + this.attackBox.atkTimer] == 0) { //공격이 플레이어에게 닿은 경우
                        //어느 플레이어에 닿았는지 확인해야 함
                        if (p1.x < this.attackBox.position_x + this.attackBox.atkTimer && this.attackBox.position_x + this.attackBox.atkTimer < p1.x + p1.CanvasLength) {
                            // 플레이어 1에 공격이 닿았을 경우
                            p1.isDamaged = true;
                        }

                        if (p2.x < this.attackBox.position_x + this.attackBox.atkTimer && this.attackBox.position_x + this.attackBox.atkTimer < p2.x + p2.CanvasLength) {
                            // 플레이어 2에 공격이 닿았을 경우
                            p2.isDamaged = true;
                        }
                    }
                    ctx.fillRect(this.attackBox.position_x, this.attackBox.position_y, this.attackBox.atkTimer, this.attackBox.height);
                }
            }

            else { //공격 종료
                if (p1.isDamaged == true) { //플레이어1이 해당 몬스터의 공격을 받았을 경우
                    p1.healthCount--;
                }
                
                if (p2.isDamaged == true) {
                    p2.healthCount--;
                }

                //몬스터 공격 정보 초기화
                this.waitCount = 0;
                this.attackBox.atkTimer = 0;
                this.vel.isAttacking = false;
            }
        }

        else { //왼쪽을 보고 있는 경우
            if (this.attackBox.atkTimer <= this.attackBox.width) { //왼쪽 공격 진행중
                //공격 상자 늘리기 전에 플레이어의 방어 확인
                if (p1.vel.isBlocking == true && (this.attackBox.position_x - this.attackBox.atkTimer - 1) <= p1.BlockBox.x_right) {
                    // 플레이어1의 오른쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                    this.isStunned = true;
                    this.vel.isAttacking = false;
                    this.attackBox.atkTimer = 0;
                }
                if (p2.vel.isBlocking == true && (this.attackBox.position_x - this.attackBox.atkTimer - 1) <= p2.BlockBox.x_right) {
                    // 플레이어2의 오른쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                    this.isStunned = true;
                    this.vel.isAttacking = false;
                    this.attackBox.atkTimer = 0;
                }
                else {
                    if (this.waitCount < 30) { //몬스터가 공격 하기 전 잠깐 주는 텀
                        this.waitCount++;
                    }

                    else if (this.waitCount == 30) {
                        this.attackBox.atkTimer+=2;
                    }
                    
                    if (collisonCheckX[this.attackBox.position_x - this.attackBox.atkTimer] == 0) {//공격이 플레이어에게 닿은 경우
                        //어느 플레이어에 공격이 닿았는지 확인 해야함
                        if (p1.x < this.attackBox.position_x - this.attackBox.atkTimer && this.attackBox.position_x - this.attackBox.atkTimer < p1.x + p1.CanvasLength) {
                            // 플레이어 1에 공격이 닿았을 경우
                            p1.isDamaged = true;
                        }

                        if (p2.x < this.attackBox.position_x - this.attackBox.atkTimer && this.attackBox.position_x - this.attackBox.atkTimer < p2.x + p2.CanvasLength) {
                            // 플레이어 2에 공격이 닿았을 경우
                            p2.isDamaged = true;
                        }
                    }
                    ctx.fillRect(this.attackBox.position_x - this.attackBox.atkTimer, this.attackBox.position_y, this.attackBox.atkTimer, this.attackBox.height);
                }
            }

            else { //공격 종료
                if (p1.isDamaged == true) { //플레이어1이 해당 몬스터의 공격을 받았을 경우
                    p1.healthCount--;
                }
                if (p2.isDamaged == true) { //플레이어2가 해당 몬스터의 공격을 받았을 경우
                    p2.healthCount--;
                }

                //몬스터 공격 정보 초기화
                this.waitCount = 0;
                this.attackBox.atkTimer = 0;
                this.vel.isAttacking = false;
            }
        }
    }

    move(bigX, smallX, p1, p2) {

        //몹의 공격 범위 갱신
        this.x_detectLeft = this.x - 150;
        this.x_detectRight = this.x + this.CanvasLength + 150;

        this.x_attackLeft = this.x + 30;
        this.x_attackRight = this.x + this.CanvasLength - 30;

        this.attackBox.position_x = this.x + this.CanvasLength / 2;

        if (this.isDead == false) { // 몹이 살아있으면 움직임
            for (var i = 0; i <= this.CanvasLength - 100; i++) {
                collisonCheckX[this.x + 50 + i] = 1;
            }

            if (this.vel.isAttacking == true) { // 공격중인 경우
                this.attack(p1, p2);
            }

            else if (this.isStunned == true) { //공격이 막혀 잠시 스턴에 걸린 경우
                this.stun();
            }
             // 플레이어가 탐지 범위 안에 들어온 경우
            else if((this.x_detectLeft <= bigX && bigX < this.x + 50) || (this.x + this.CanvasLength - 50 < smallX && smallX <= this.x_detectRight)) { 
                //플레이어가 공격 범위 안에 들어온 경우
                if ((this.x_attackLeft < bigX && bigX < this.x + 50) || (this.x + this.CanvasLength - 50 < smallX && smallX < this.x_attackRight)) {
                    this.vel.isAttacking = true;
                }

                else { //탐지 범위 안에 들어왔지만 공격 범위는 아닌 경우 -> 플레이어 따라가기
                    if (this.x_detectLeft < bigX && bigX < this.x + 50) { //왼쪽으로 이동
                        this.vel.isMoving = true;
                        this.vel.isLookingRight = false;
                        collisonCheckX[this.x + 49] = 1;
                        collisonCheckX[this.x + this.CanvasLength - 50] = -1;
                        this.x--;
                    }

                    else if (this.x + this.CanvasLength - 50 < smallX && smallX <= this.x_detectRight) { //오른쪽으로 이동
                        this.vel.isMoving = true;
                        this.vel.isLookingRight = true;
                        collisonCheckX[this.x + 50] = -1;
                        collisonCheckX[this.x + this.CanvasLength - 49] = 1;
                        this.x++;
                    }
                }
            }

            else if((this.x + 50 < this.xMax_left) || (this.xMax_right < this.x + this.CanvasLength - 40)) {//지정된 구역을 벗어난 경우
                this.comeBackToPosition();
            }

            else { // 탐지가 된것도 아니고, 지정된 구역을 벗어난 경우도 아닌 경우 -> 일반 무작위 움직임
                if (this.isMovingDone == true) { // 움직임이 끝난 상태일 때
                    if (this.moveCount < 90) {// 1.5초 동안 잠시 멈췄다가
                        this.vel.isMoving = false;
                        this.moveCount++;
                    }
                    
                    else { // 다시 움직임 재개
                        this.moveCount = 0;
                        this.move_randNum = Math.floor(Math.random() * this.move_range);
                        // floor -> 정수로 반올림, random -> 0~1사이 난수 발생 여기선 move_range만큼 곱해줌
            
                        this.isMovingDone = false;
                        console.log('move again');
                    }
        
                }
        
                else { //움직임이 끝나지 않았을 때
                    if (this.move_randNum <= 10 && this.moveCount < this.move_randNum) { //난수가 일정 수보다 작으면 가만히 서 있는 걸로
                        this.vel.isMoving = false;
                        this.moveCount+=this.speed;
                        console.log('small number');
                    }
        
                    else { //움직이는 경우

                        if ((this.move_randNum % 2 == 0) && this.moveCount < this.move_randNum) { //짝수인 경우 -> 오른쪽으로 이동
                            if (this.x + this.CanvasLength + this.speed <= this.xMax_right) { //고정 범위 안에 있는 경우
                                this.vel.isMoving = true;
                                collisonCheckX[this.x + 50] = -1;
                                collisonCheckX[this.x + this.CanvasLength -49] = 1;
                                this.vel.isLookingRight = true;
                                this.x+=this.speed;
                                this.moveCount+=this.speed;
                                console.log('is moving');
                            }
                            else { // 고정 범위 끝까지 간 경우 -> 움직임 마쳤다고 판단
                                this.vel.isMoving = false;
                                this.isMovingDone = true;
                                console.log('is moving done edge');
                            }
        
                        }
                        else if ((this.move_randNum % 2 == 1) && this.moveCount < this.move_randNum) {//홀수인 경우 -> 왼쪽으로 이동
                            console.log(this.x - this.speed);
                            if (this.x - this.speed >= this.xMax_left) { //고정 범위 안에 있는 경우
                                this.vel.isMoving = true;
                                collisonCheckX[this.x + 49] = 1;
                                collisonCheckX[this.x + this.CanvasLength - 50] = -1;
                                this.vel.isLookingRight = false;
                                this.x-=this.speed;
                                this.moveCount+=this.speed;
                                console.log('is moving left');
                            }
                            else { // 고정 범위 끝까지 간 경우 -> 움직임 마쳤다고 판단
                                this.vel.isMoving = false;
                                this.isMovingDone = true;
                                console.log('is moving done edge');
                            }
                        }
        
                        else if (this.moveCount >= this.move_randNum) {
                            this.vel.isMoving = false;
                            this.isMovingDone = true;
                            this.moveCount = 0;
                        }
                    }
                }
            }
        }

        else if (this.isDead == true) { //몹이 죽었을 경우
            for (i = 0; i <= this.width; i++) {
                collisonCheckX[this.x + i] = -1;
            }
        }
    }

    checkAttacked(atkTimer_p1, atkTimer_p2) {//공격이 해당 물체에 가해졌는지 확인
        if ((collisonCheckX[atkTimer_p1] == 1) && (this.x <= atkTimer_p1 && atkTimer_p1 <= this.x + this.CanvasLength)) {
            this.healthCount--;
            if (this.healthCount == 0) {
                console.log('nz1 dead');
                this.isDead = true;
            }
        }

        if ((collisonCheckX[atkTimer_p2] == 1) && (this.x <= atkTimer_p2 && atkTimer_p2 <= this.x + this.CanvasLength)) {
            this.healthCount--;
            if (this.healthCount == 0) {
                console.log('nz1 dead');
                this.isDead = true;
            }
        }
    }
}
////////////////////////////////////////////////////////////////////////////////

function initGame() {
    const state = createGameState();
    return state;
}

function createGameState() {
    bg = new BackGround();
    //constructor(x, y, width, height, CanvasLength)
    p1 = new MainCharacter(200, 800, 500, 500, 200);
    p1.setLoops(4, 8, 6);
    p2 = new MainCharacter(500, 800, 500, 500, 200);
    p2.setLoops(4, 8, 6);

    nz1 = new NormalZombie(1200, 800, 500, 500, 200);
    nz1.setLoops(6, 7, 4);
    nz1.setFixedRange(1000, 1400);
    nz1.setStunLoop(3);
    return {
        bg,
        players: [p1, p2],
        nz1,
        collisonCheckX,
        activate: true,
    }
}

//플레이어 방어 상자 갱신
function updateBlockBox(player, x, y) {
    player.BlockBox.x_right = x + player.CanvasLength - 70;
    player.BlockBox.x_left = x + 30;
    player.BlockBox.y = y + 60;
}

function gameLoop(state) {
    if (!state) {
        return;
    }

    const p1 = state.players[0];
    const p2 = state.players[1];
    const nz1 = state.nz1;
    const collisonCheckX = state.collisonCheckX;

    var bigX = biggerX(p1.x, p2.x);
    var smallX = smallerX(p1.x, p2.x);

    updateBlockBox(p1, p1.x, p1.y);
    updateBlockBox(p2, p2.x, p2.y);

    nz1.move(bigX, smallX, p1, p2);

    for (var i = 0; i <= p1.CanvasLength - 80; i++) { //플레이어1이 서 있는 곳은 0 으로 표시
        collisonCheckX[p1.x + 40 + i] = 0;
    }

    for (var i = 0; i <= p2.CanvasLength - 80; i++) { //플레이어2가 서 있는 곳은 0 으로 표시
        collisonCheckX[p2.x + 40 + i] = 0;
    }

    //플레이어1 이 가만히 서 있는 경우
    if (p1.vel.isAttacking == false && p1.vel.isMoving == false && p1.vel.isBlocking == false) {
        if (p1.frameCount < p1.refreshRate) {
            p1.frameCount++;
        }
        else if (p1.frameCount == p1.refreshRate) {
            p1.frameCount = 0;

            if (p1.idleCount == p1.idleLoop - 1) {
                p1.idleCount = 0;
            }

            else {
                p1.idleCount++;
            }
        }
    }

    //플래이어1 이 왼쪽으로 이동하는 경우
    if ((p1.vel.isMovingLeft == true && collisonCheckX[p1.x + 38] != 1) && (p1.vel.isAttacking == false && p1.vel.isBlocking == false && p1.isDamaged == false)) {
        if (p1.x > 0) {
            collisonCheckX[p1.x + 38] = 0;
            collisonCheckX[p1.x + 39] = 0;
            collisonCheckX[p1.x + p1.CanvasLength - 40] = -1;
            collisonCheckX[p1.x + p1.CanvasLength - 41] = -1;
            p1.x-=2;
            p1.attackBox.position_x-=2;

            // 애니메이션 변수
            if (p1.frameCount < p1.refreshRate) {
                p1.frameCount++;
            }

            else if (p1.frameCount == p1.refreshRate) {
                p1.frameCount = 0;
                if (p1.walkingCount == p1.walkingLoop - 1) {
                    p1.walkingCount = 0;
                }
                else {
                    p1.walkingCount++;
                }
            }
        }
    }

    //플래이어1이 오른쪽으로 이동하는 경우
    if ((p1.vel.isMovingRight == true && collisonCheckX[p1.x + p1.CanvasLength - 38] != 1) && (p1.vel.isAttacking == false && p1.vel.isBlocking == false && p1.isDamaged == false)) {
        if (p1.x < canvas_width - p1.CanvasLength) {
            collisonCheckX[p1.x + 40] = -1;
            collisonCheckX[p1.x + 41] = -1;
            collisonCheckX[p1.x + p1.CanvasLength - 39] = 0;
            collisonCheckX[p1.x + p1.CanvasLength - 38] = 0;
            p1.x+=2;
            p1.attackBox.position_x+=2;

            // 애니메이션 변수
            if (p1.frameCount < p1.refreshRate) {
                p1.frameCount++;
            }

            else if (p1.frameCount == p1.refreshRate) {
                p1.frameCount = 0;
                if (p1.walkingCount == p1.walkingLoop - 1) {
                    p1.walkingCount = 0;
                }
                else {
                    p1.walkingCount++;
                }
            }
        }
    }

    //플레이어1이 공격 중인 경우
    if (p1.vel.isAttacking == true) {
        //오른쪽 공격
        if(p1.vel.isLookingRight == true) {
            if (p1.attackTimer >= p1.attackBox.width) {
                p1.vel.isAttacking = false;
                p1.attackTimer = 0;
            }
            else {
                p1.attackTimer+=2;
            }
        }
        //왼쪽 공격
        else if(p1.vel.isLookingRight == false) {
            if (p1.attackTimer >= p1.attackBox.width) {
                p1.vel.isAttacking = false;
                p1.attackTimer = 0;
            }
            else {
                p1.attackTimer+=2;
            }
        }
    }
    //플레이어1 공격 애니메이션 변수 attackFrame 이 30이 될때 마다 장면이 바뀜
    if (p1.vel.isAttacking_motion == true) {
        
        if (p1.attackFrame < 30 && (p1.attackCount <= 1)) {
            p1.attackFrame+=6;
        }
        
        else if (p1.attackFrame < 30 && (p1.attackCount == 2)) {
            p1.attackFrame+=3;
        }
        else if (p1.attackFrame < 30 && (p1.attackCount <= 4)) {
            p1.attackFrame+=5
        }
        else if (p1.attackFrame < 30 && (p1.attackCount == 5)) {
            p1.attackFrame+=3;
        }
        
        else if(p1.attackFrame == 30) {
            p1.attackFrame = 0;
            if (p1.attackCount == p1.attackLoop - 1) {
                p1.attackCount = 0;
                p1.vel.isAttacking_motion = false; //공격 동작 종료
            }
            else {
                p1.attackCount++;
            }
        }
        
    }

    //플레이어1이 공격에 맞은 경우
    if (p1.isDamaged == true) {
        p1.damagedCount++;
        if (p1.damagedCount == 60) {
            p1.isDamaged = false;
            p1.damagedCount = 0;
        }
    }

    //플레이어2가 가만히 서 있는 경우
    if (p2.vel.isAttacking == false && p2.vel.isMoving == false && p2.vel.isBlocking == false) {
        if (p2.frameCount < p2.refreshRate) {
            p2.frameCount++;
        }
        else if (p2.frameCount == p2.refreshRate) {
            p2.frameCount = 0;

            if (p2.idleCount == p2.idleLoop - 1) {
                p2.idleCount = 0;
            }

            else {
                p2.idleCount++;
            }
        }
    }

    //플래이어2 가 왼쪽으로 이동하는 경우
    if ((p2.vel.isMovingLeft == true && collisonCheckX[p2.x + 38] != 1) && (p2.vel.isAttacking == false && p2.vel.isBlocking == false && p2.isDamaged == false)) {
        if (p2.x > 0) {
            collisonCheckX[p2.x + 38] = 0;
            collisonCheckX[p2.x + 39] = 0;
            collisonCheckX[p2.x + p2.CanvasLength - 40] = -1;
            collisonCheckX[p2.x + p2.CanvasLength - 41] = -1;
            p2.x-=2;
            p2.attackBox.position_x-=2;

            // 애니메이션 변수
            if (p2.frameCount < p2.refreshRate) {
                p2.frameCount++;
            }

            else if (p2.frameCount == p2.refreshRate) {
                p2.frameCount = 0;
                if (p2.walkingCount == p2.walkingLoop - 1) {
                    p2.walkingCount = 0;
                }
                else {
                    p2.walkingCount++;
                }
            }
        }
    }

    //플래이어2가 오른쪽으로 이동하는 경우
    if ((p2.vel.isMovingRight == true && collisonCheckX[p2.x + p2.CanvasLength - 38] != 1) && (p2.vel.isAttacking == false && p2.vel.isBlocking == false && p2.isDamaged == false)) {
        if (p2.x < canvas_width - p2.CanvasLength) {
            collisonCheckX[p2.x + 40] = -1;
            collisonCheckX[p2.x + 41] = -1;
            collisonCheckX[p2.x + p2.CanvasLength - 39] = 0;
            collisonCheckX[p2.x + p2.CanvasLength - 38] = 0;
            p2.x+=2;
            p2.attackBox.position_x+=2;

            // 애니메이션 변수
            if (p2.frameCount < p2.refreshRate) {
                p2.frameCount++;
            }

            else if (p2.frameCount == p2.refreshRate) {
                p2.frameCount = 0;
                if (p2.walkingCount == p2.walkingLoop - 1) {
                    p2.walkingCount = 0;
                }
                else {
                    p2.walkingCount++;
                }
            }
        }
    }

    //플레이어2가 공격 중인 경우
    if (p2.vel.isAttacking == true) {
        //오른쪽 공격
        if(p2.vel.isLookingRight == true) {
            if (p2.attackTimer >= p2.attackBox.width) {
                p2.vel.isAttacking = false;
                p2.attackTimer = 0;
            }
            else {
                p2.attackTimer+=2;
            }
        }
        //왼쪽 공격
        else if(p2.vel.isLookingRight == false) {
            if (p2.attackTimer >= p2.attackBox.width) {
                p2.vel.isAttacking = false;
                p2.attackTimer = 0;
            }
            else {
                p2.attackTimer+=2;
            }
        }
    }

    //플레이어2 공격 애니메이션 변수 attackFrame 이 30이 될때 마다 장면이 바뀜
    if (p2.vel.isAttacking_motion == true) {
        
        if (p2.attackFrame < 30 && (p2.attackCount <= 1)) {
            p2.attackFrame+=6;
        }
        
        else if (p2.attackFrame < 30 && (p2.attackCount == 2)) {
            p2.attackFrame+=3;
        }
        else if (p2.attackFrame < 30 && (p2.attackCount <= 4)) {
            p2.attackFrame+=5
        }
        else if (p2.attackFrame < 30 && (p2.attackCount == 5)) {
            p2.attackFrame+=3;
        }
        
        else if(p2.attackFrame == 30) {
            p2.attackFrame = 0;
            if (p2.attackCount == p2.attackLoop - 1) {
                p2.attackCount = 0;
                p2.vel.isAttacking_motion = false; //공격 동작 종료
            }
            else {
                p2.attackCount++;
            }
        }
    }


    //NormalZombie 애니메이션 변수
    if (nz1.vel.isMoving == false) {
         //플레이어가 해당 몬스터의 공격을 막았을 경우
        if (nz1.isStunned == true) {
            if (nz1.stunCount % 40 == 39) {
                nz1.stunAnimaitonCount++;
                nz1.stunAnimaitonCount = nz1.stunAnimaitonCount % nz1.stunLoop;
            }
        }
        //텀이 지나고 다시 공격하는 경우
        else if (nz1.vel.isAttacking == true && nz1.waitCount == 30) {
            
            if (nz1.attackFrame < 10) {
                nz1.attackCount = 0;
            }
            else if (nz1.attackFrame < 20) {
                nz1.attackCount = 1;
            }
            else if (nz1.attackFrame < 40) {
                nz1.attackCount = 2;
            }
            else if (nz1.attackFrame < 50) {
                nz1.attackCount = 3;
            }
            else if (nz1.attackFrame == 50) {
                nz1.attackCount = 0;
            }
            nz1.attackFrame++;
        }
        //가만히 서 있는 경우
        else {
            if(nz1.idleCount == 30) {
                nz1.idleCount = 0;
                nz1.idleCut++;
                nz1.idleCut = nz1.idleCut % nz1.idleLoop;
            }
            nz1.idleCount++;
        }
    }

    else if (nz1.vel.isMoving == true) {
        if (nz1.walkingCount == 30) {
            nz1.walkingCount = 0;
            nz1.walkingCut++;
            nz1.walkingCut = nz1.walkingCut % nz1.walkingLoop;
        }
        nz1.walkingCount++;
    }
}



function getUpdatedVelocityDown(keyCode, player) { // 키 눌렀을때(누르고 있을 때) 이벤트
    switch (keyCode) {
        //a -> 왼쪽 이동
        case 65:
            if (player.isDamaged == false && player.vel.isAttacking == false && player.vel.isBlocking == false) {
                return {
                    // 보고 있는 방향
                    isLookingRight : false,

                    // 공격하고 있는지 여부
                    isAttacking : false,
                    isAttacking_motion : false,

                    //움직이고 있는지 여부
                    isMoving : true,
                    isMovingRight : false,
                    isMovingLeft : true,
                    
                    //방어하고 있는지 여부
                    isBlocking: false
                };
            }
            else {
                return;
            }
        //d -> 오른쪽 이동
        case 68:
            if (player.isDamaged == false && player.vel.isAttacking == false && player.vel.isBlocking == false) {
                return {
                    // 보고 있는 방향
                    isLookingRight : true,

                    // 공격하고 있는지 여부
                    isAttacking : false,
                    isAttacking_motion : false,

                    //움직이고 있는지 여부
                    isMoving : true,
                    isMovingRight : true,
                    isMovingLeft : false,

                    //방어하고 있는지 여부
                    isBlocking: false
                };
            }
            else {
                return;
            }
        // f -> 공격
        case 70:
            if (player.isDamaged == false) {
                if (player.vel.isLookingRight == true) { // 오른쪽
                    return {
                        // 보고 있는 방향
                        isLookingRight : true,
    
                        // 공격하고 있는지 여부
                        isAttacking : true,
                        isAttacking_motion : true,
    
                        //움직이고 있는지 여부
                        isMoving : false,
                        isMovingRight : false,
                        isMovingLeft : false,

                        //방어하고 있는지 여부
                        isBlocking: false
                    };
                }
                else { //왼쪽
                    return {
                        // 보고 있는 방향
                        isLookingRight : false,
    
                        // 공격하고 있는지 여부
                        isAttacking : true,
                        isAttacking_motion : true,
    
                        //움직이고 있는지 여부
                        isMoving : false,
                        isMovingRight : false,
                        isMovingLeft : false,

                        //방어하고 있는지 여부
                        isBlocking: false
                    };
                }
            }
        //r -> 방어
        case 82:
            if (player.vel.isLookingRight == true) { //오른쪽 방어
                return {
                    // 보고 있는 방향
                    isLookingRight : true,

                    // 공격하고 있는지 여부
                    isAttacking : false,
                    isAttacking_motion : false,

                    //움직이고 있는지 여부
                    isMoving : false,
                    isMovingRight : false,
                    isMovingLeft : false,

                    //방어하고 있는지 여부
                    isBlocking: true
                };
            }
            else {  //왼쪽 방어
                return {
                    // 보고 있는 방향
                    isLookingRight : false,

                    // 공격하고 있는지 여부
                    isAttacking : false,
                    isAttacking_motion : false,

                    //움직이고 있는지 여부
                    isMoving : false,
                    isMovingRight : false,
                    isMovingLeft : false,

                    //방어하고 있는지 여부
                    isBlocking: true
                };
            }
            
    }
}

function getUpdatedVelocityUp(keyCode, player) { // 키 눌렀다가 땠을 때 이벤트
    switch (keyCode) {
        //a -> 왼쪽 이동하다가 멈춤
        case 65:
            return {
                // 보고 있는 방향
                isLookingRight : false,

                // 공격하고 있는지 여부
                isAttacking : false,
                isAttacking_motion : false,

                //움직이고 있는지 여부
                isMoving : false,
                isMovingRight : false,
                isMovingLeft : false,

                //방어하고 있는지 여부
                isBlocking: false
            };
        //d -> 오른쪽 이동하다가 멈추는 경우
        case 68:
            return {
                // 보고 있는 방향
                isLookingRight : true,

                // 공격하고 있는지 여부
                isAttacking : false,
                isAttacking_motion : false,

                //움직이고 있는지 여부
                isMoving : false,
                isMovingRight : false,
                isMovingLeft : false,

                //방어하고 있는지 여부
                isBlocking: false
            };
        //r -> 방어 했다가 푸는 경우
        case 82:
            if (player.vel.isLookingRight == true) { //오른쪽 방어였던 경우
                return {
                    // 보고 있는 방향
                    isLookingRight : true,
    
                    // 공격하고 있는지 여부
                    isAttacking : false,
                    isAttacking_motion : false,
    
                    //움직이고 있는지 여부
                    isMoving : false,
                    isMovingRight : false,
                    isMovingLeft : false,
    
                    //방어하고 있는지 여부
                    isBlocking: false
                };
            }

            else {
                return {
                    // 보고 있는 방향
                    isLookingRight : false,
    
                    // 공격하고 있는지 여부
                    isAttacking : false,
                    isAttacking_motion : false,
    
                    //움직이고 있는지 여부
                    isMoving : false,
                    isMovingRight : false,
                    isMovingLeft : false,
    
                    //방어하고 있는지 여부
                    isBlocking: false
                };
            }
    }
}