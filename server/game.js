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
let canvas_width = 1920;
let canvas_height = 960;


var maxStageNum = 1;

/////////////////////   Classes  /////////////////////////////
class BackGround {
    constructor() {
        this.bg_length = canvas_width;
        this.bg_canvasLength = canvas_height;
        this.bg_x = 0;
        this.bg_count = 3;
        this.bg_xMax = (this.bg_length * this.bg_count) - this.bg_length * (canvas_width / canvas_height);
        this.ratio = this.bg_length / canvas_height;
        this.bgmovingRight = false;
        this.bgmovingLeft = false;
         //주인공이 화면 끝까지 이동할 수 있는 경우는 오른쪽으로 가면서 bg_x == bg_xMax이거나, 왼쪽으로 가면서 bg_x == 0 인 경우. 그 이외에는 화면이 움직여야 함
        this.stageNum = 0;// 스테이지는 0부터 시작, 맵이 바뀔 때 마다 1씩 증가함
    }
    draw() {
        ctx.drawImage(img_bg_test, this.bg_x, 0, this.bg_length * (canvas_width / canvas_height), this.bg_length, 0, 0, canvas_width, canvas_height);
    }
}

// 몹 기본 상위 클래스
class Creature {
    constructor(x, y, width, height, canvasLength) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.canvasLength = canvasLength;
        this.attackBox = {
            position_x : this.x + this.canvasLength / 2,
            position_y : this.y - 50,
            width: 120,
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
            lookingRight : true,

            // 공격하고 있는지 여부
            attacking : false,
            attacking_motion : false,

            //움직이고 있는지 여부
            moving : false,
            movingRight : false,
            movingLeft : false,

            //방어 하고있는지 여부
            blocking : false
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

    setCanvasSize(canvasLength) {
        this.canvasLength = canvasLength;
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
    constructor(x, y, width, height, canvasLength) {
        super(x, y, width, height, canvasLength);
        this.frameCount = 0;
        this.damagedCount = 0;
        this.refreshRate = 10;
        this.attackTimer = 0;
        this.attackFrame = 0;
        this.damagedLoop = 0;
        this.BlockBox = {
            x_right : this.x + this.canvasLength - 10,
            x_left : this.x + 10,
            y : this.y + 60,
            width : 40,
            height : 70
        }
    }

}

class NormalZombie extends Creature { //좀비 클래스
    constructor(x, y, width, height, canvasLength) {
        super(x, y, width, height, canvasLength);
        this.move_range = 100; // 몹이 무작위로 움직이는 최대 범위
        this.move_randNum = 0; // 몹이 무작위로 움직이는 범위
        this.moveCount = 0;
        this.speed = 1;        // 몹 움직이는 속도
        this.xMax_left = 0;
        this.xMax_right = 0;
        this.x_detectLeft = this.x - 150; //몹이 왼쪽에서 플레이어를 감지 할 수 있는 범위
        this.x_detectRight = this.x + this.canvasLength + 150; //몹이 오른쪽에서 플레이어를 감지 할 수 있는 범위
        this.x_attackLeft = this.x + 30; //몹이 왼쪽에서 플레이어를 공격 할 수 있는 범위
        this.x_attackRight = this.x + this.canvasLength - 30;
        this.movingDone = true;
        this.dead = false;
        this.attackFrame = 0;
        this.stunned = false;
        this.stunCount = 0;
        this.stunAnimaitonCount = 0;
        this.stunLoop = 0;
        this.waitCount = 0;
        this.deathFrame = 0;
        this.deathCount = 0;
        this.stageNum = 0; //stage 정보
        this.attackRandomNum = 0; //공격 종류를 결정하는 난수
        //콘솔 확인용 임시 변수
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

    comeBackToPosition(collisonCheckX) {
        this.vel.moving = true;
        if(this.x < (this.xMax_left + this.xMax_right) / 2) { //왼쪽으로 벗어난 경우
            if (this.x != (this.xMax_left + this.xMax_right) / 2) { //가운데로 올 때까지 이동
                this.vel.lookingRight = true;
                collisonCheckX[this.x + 50] = -1;
                collisonCheckX[this.x + this.canvasLength - 49] = 1;
                this.x++;
            }
        }
        else if ((this.xMax_left + this.xMax_right) / 2 < this.x) {  // 오른쪽으로 벗어난 경우
            if (this.x != (this.xMax_left + this.xMax_right) / 2) { //가운데로 올 때까지 이동
                this.vel.lookingRight = false;
                collisonCheckX[this.x + 49] = 1;
                collisonCheckX[this.x + this.canvasLength - 50] = -1;
                this.x--;
            }
        }
    }

    stun() {
        this.vel.moving = false;
        if (this.stunCount < 120) {
            this.stunCount++;
        }
        else {
            this.stunned = false;
            this.stunCount = 0;
        }
    }

    zombieAttack(p1, p2) { //매개변수가 너무 많이 들어가니까 오류가 뜸-> 매개변수의 수를 줄이니 오류 안뜸
        this.vel.moving = false;
        
        if (this.attackRandomNum >= 6) {// 9, 8, 7, 6 -> 일반 공격
            if (this.vel.lookingRight == true) { // 몬스터가 오른쪽 보고있는 경우
                if (this.attackBox.atkTimer <= this.attackBox.width) { //오른쪽 공격 진행중. 공격범위 -> 120, 40프레임 소모
                    //공격 상자 늘리기 전에 플레이어들의 방어 확인
                    if (p1.vel.blocking == true && p1.vel.lookingRight == false && (this.attackBox.position_x + this.attackBox.atkTimer + 6) >= p1.BlockBox.x_left) { 
                        // 플레이어1의 왼쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                        this.stunned = true;
                        this.vel.attacking = false;
                        this.attackBox.atkTimer = 0;
                    }
    
                    if (p2.vel.blocking == true && p2.vel.lookingRight == false && (this.attackBox.position_x + this.attackBox.atkTimer + 6) >= p2.BlockBox.x_left) {
                        //플레이어2의 왼쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                        this.stunned = true;
                        this.vel.attacking = false;
                        this.attackBox.atkTimer = 0;
                    }
                    else {
                        if (this.waitCount < 30) { //몬스터가 공격 하기 전 잠깐 주는 텀
                            this.waitCount++;
                        }
    
                        else if (this.waitCount == 30) {
                            if (this.attackCount >= 2) {
                                this.attackBox.atkTimer += 6;
                            }
                        }
    
    
                        if (collisonCheckX[this.attackBox.position_x + this.attackBox.atkTimer] == 0) { //공격이 플레이어에게 닿은 경우
                            //어느 플레이어에 닿았는지 확인해야 함
                            if (p1.x < this.attackBox.position_x + this.attackBox.atkTimer && this.attackBox.position_x + this.attackBox.atkTimer < p1.x + p1.canvasLength) {
                                // 플레이어 1에 공격이 닿았을 경우
                                p1.isDamaged = true;
                            }
    
                            if (p2.x < this.attackBox.position_x + this.attackBox.atkTimer && this.attackBox.position_x + this.attackBox.atkTimer < p2.x + p2.canvasLength) {
                                // 플레이어 2에 공격이 닿았을 경우
                                p2.isDamaged = true;
                            }
                        }
                        //ctx.fillRect(this.attackBox.position_x, this.attackBox.position_y, this.attackBox.atkTimer, this.attackBox.height);
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
                    this.vel.attacking = false;
                    this.attackRandomNum = Math.floor(Math.random() * 10); // 0~9 정수 난수 발생
                }
            }
    
            else { //왼쪽을 보고 있는 경우
                if (this.attackBox.atkTimer <= this.attackBox.width) { //왼쪽 공격 진행중
                    //공격 상자 늘리기 전에 플레이어의 방어 확인
                    if (p1.vel.blocking == true && p1.vel.lookingRight == true && (this.attackBox.position_x - this.attackBox.atkTimer - 6) <= p1.BlockBox.x_right) {
                        // 플레이어1의 오른쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                        this.stunned = true;
                        this.vel.attacking = false;
                        this.attackBox.atkTimer = 0;
                    }
                    if (p2.vel.blocking == true && p2.vel.lookingRight == true && (this.attackBox.position_x - this.attackBox.atkTimer - 6) <= p2.BlockBox.x_right) {
                        // 플레이어2의 오른쪽 방어가 먼저 활성화 되었을 때 -> 공격 막힘
                        this.stunned = true;
                        this.vel.attacking = false;
                        this.attackBox.atkTimer = 0;
                    }
                    else {
                        if (this.waitCount < 30) { //몬스터가 공격 하기 전 잠깐 주는 텀
                            this.waitCount++;
                        }
    
                        else if (this.waitCount == 30) {
                            if (this.attackCount >= 2) {
                                this.attackBox.atkTimer += 6;
                            }
                        }
                        
                        if (collisonCheckX[this.attackBox.position_x - this.attackBox.atkTimer] == 0) {//공격이 플레이어에게 닿은 경우
                            //어느 플레이어에 공격이 닿았는지 확인 해야함
                            if (p1.x < this.attackBox.position_x - this.attackBox.atkTimer && this.attackBox.position_x - this.attackBox.atkTimer < p1.x + p1.canvasLength) {
                                // 플레이어 1에 공격이 닿았을 경우
                                p1.isDamaged = true;
                            }
    
                            if (p2.x < this.attackBox.position_x - this.attackBox.atkTimer && this.attackBox.position_x - this.attackBox.atkTimer < p2.x + p2.canvasLength) {
                                // 플레이어 2에 공격이 닿았을 경우
                                p2.isDamaged = true;
                            }
                        }
                        //ctx.fillRect(this.attackBox.position_x - this.attackBox.atkTimer, this.attackBox.position_y, this.attackBox.atkTimer, this.attackBox.height);
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
                    this.vel.attacking = false;
                    this.attackRandomNum = Math.floor(Math.random() * 10); // 0~9 정수 난수 발생
                }
            }
        }

        else if (this.attackRandomNum >= 0) { // 5, 4, 3, 2, 1, 0 -> 방어 불가 공격 
            if (this.vel.lookingRight == true) { // 몬스터가 오른쪽 보고있는 경우
                if (this.attackBox.atkTimer <= this.attackBox.width) { //오른쪽 공격 진행중. 공격범위 -> 120, 40프레임 소모
                    //방어 확인 X
                    if (this.waitCount < 30) { //몬스터가 공격 하기 전 잠깐 주는 텀
                        this.waitCount++;
                    }

                    else if (this.waitCount == 30) {
                        if (this.attackCount >= 2) {
                            this.attackBox.atkTimer += 6;
                        }
                    }


                    if (collisonCheckX[this.attackBox.position_x + this.attackBox.atkTimer] == 0) { //공격이 플레이어에게 닿은 경우
                        //어느 플레이어에 닿았는지 확인해야 함
                        if (p1.x < this.attackBox.position_x + this.attackBox.atkTimer && this.attackBox.position_x + this.attackBox.atkTimer < p1.x + p1.canvasLength) {
                            // 플레이어 1에 공격이 닿았을 경우
                            p1.isDamaged = true;
                        }

                        if (p2.x < this.attackBox.position_x + this.attackBox.atkTimer && this.attackBox.position_x + this.attackBox.atkTimer < p2.x + p2.canvasLength) {
                            // 플레이어 2에 공격이 닿았을 경우
                            p2.isDamaged = true;
                        }
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
                    this.vel.attacking = false;
                    this.attackRandomNum = Math.floor(Math.random() * 10); // 0~9 정수 난수 발생
                }
            }
    
            else { //왼쪽을 보고 있는 경우
                if (this.attackBox.atkTimer <= this.attackBox.width) { //왼쪽 공격 진행중
                    //방어 확인 X
                    if (this.waitCount < 30) { //몬스터가 공격 하기 전 잠깐 주는 텀
                        this.waitCount++;
                    }

                    else if (this.waitCount == 30) {
                        if (this.attackCount >= 2) {
                            this.attackBox.atkTimer += 6;
                        }
                    }
                    
                    if (collisonCheckX[this.attackBox.position_x - this.attackBox.atkTimer] == 0) {//공격이 플레이어에게 닿은 경우
                        //어느 플레이어에 공격이 닿았는지 확인 해야함
                        if (p1.x < this.attackBox.position_x - this.attackBox.atkTimer && this.attackBox.position_x - this.attackBox.atkTimer < p1.x + p1.canvasLength) {
                            // 플레이어 1에 공격이 닿았을 경우
                            p1.isDamaged = true;
                        }

                        if (p2.x < this.attackBox.position_x - this.attackBox.atkTimer && this.attackBox.position_x - this.attackBox.atkTimer < p2.x + p2.canvasLength) {
                            // 플레이어 2에 공격이 닿았을 경우
                            p2.isDamaged = true;
                        }
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
                    this.vel.attacking = false;
                    this.attackRandomNum = Math.floor(Math.random() * 10); // 0~9 정수 난수 발생
                }
            }
        }



        
    }

    move(bigX, smallX, collisonCheckX) {

        //몹의 공격 범위 갱신
        this.x_detectLeft = this.x - 150;
        this.x_detectRight = this.x + this.canvasLength + 150;

        this.x_attackLeft = this.x + 10;
        this.x_attackRight = this.x + this.canvasLength - 10;

        this.attackBox.position_x = this.x + this.canvasLength / 2;

        if (this.stunned == true) { //공격이 막혀 잠시 스턴에 걸린 경우
            this.stun();
        }
        if (this.dead == false && this.vel.attacking == false && this.stunned == false) { // 몹이 살아있고, 공격하고 있지 않고, 스턴에 걸리지 않은 상태라면 움직임
            for (var i = 0; i <= this.canvasLength - 100; i++) {
                collisonCheckX[this.x + 50 + i] = 1;
            }


             // 플레이어가 탐지 범위 안에 들어온 경우
            if((this.x_detectLeft <= bigX && bigX <= this.x + 50) || (this.x + this.canvasLength - 50 <= smallX && smallX <= this.x_detectRight)) { 
                //플레이어가 공격 범위 안에 들어온 경우
                if ((this.x_attackLeft <= bigX && bigX <= this.x + 50) || (this.x + this.canvasLength - 50 <= smallX && smallX <= this.x_attackRight)) {
                    if (this.x_attackLeft <= bigX && bigX <= this.x + 50) { // 왼쪽 방향으로 감지 했을 경우
                        this.lookingRight == false;
                    }
                    else { //오른쪽으로 감지 했을 경우
                        this.lookingRight == true;
                    }
                    this.vel.attacking = true; //공격 활성화

                }

                else { //탐지 범위 안에 들어왔지만 공격 범위는 아닌 경우 -> 플레이어 따라가기
                    if (this.x_detectLeft < bigX && bigX < this.x_attackLeft) { //왼쪽으로 이동
                        this.vel.moving = true;
                        this.vel.lookingRight = false;
                        collisonCheckX[this.x + 49] = 1;
                        collisonCheckX[this.x + this.canvasLength - 50] = -1;
                        this.x--;
                    }

                    else if (this.x_attackRight < smallX && smallX <= this.x_detectRight) { //오른쪽으로 이동
                        this.vel.moving = true;
                        this.vel.lookingRight = true;
                        collisonCheckX[this.x + 50] = -1;
                        collisonCheckX[this.x + this.canvasLength - 49] = 1;
                        this.x++;
                    }
                }
            }

            else if((this.x + 50 < this.xMax_left) || (this.xMax_right < this.x + this.canvasLength - 40)) {//지정된 구역을 벗어난 경우
                this.comeBackToPosition(collisonCheckX);
            }

            else { // 탐지가 된것도 아니고, 지정된 구역을 벗어난 경우도 아닌 경우 -> 일반 무작위 움직임
                this.isCommingBackToPosition = false;
                if (this.movingDone == true) { // 움직임이 끝난 상태일 때
                    if (this.moveCount < 90) {// 1.5초 동안 잠시 멈췄다가
                        this.vel.moving = false;
                        this.moveCount++;
                    }
                    
                    else { // 다시 움직임 재개
                        this.moveCount = 0;
                        this.move_randNum = Math.floor(Math.random() * this.move_range);
                        // floor -> 정수로 반올림, random -> 0~1사이 난수 발생 여기선 move_range만큼 곱해줌
            
                        this.movingDone = false;
                    }
        
                }
        
                else { //움직임이 끝나지 않았을 때
                    if (this.move_randNum <= 10 && this.moveCount < this.move_randNum) { //난수가 일정 수보다 작으면 가만히 서 있는 걸로
                        this.vel.moving = false;
                        this.moveCount+=this.speed;
                    }
        
                    else { //움직이는 경우

                        if ((this.move_randNum % 2 == 0) && this.moveCount < this.move_randNum) { //짝수인 경우 -> 오른쪽으로 이동
                            if (this.x + this.canvasLength + this.speed <= this.xMax_right) { //고정 범위 안에 있는 경우
                                this.vel.moving = true;
                                collisonCheckX[this.x + 50] = -1;
                                collisonCheckX[this.x + this.canvasLength -49] = 1;
                                this.vel.lookingRight = true;
                                this.x+=this.speed;
                                this.moveCount+=this.speed;
                            }
                            else { // 고정 범위 끝까지 간 경우 -> 움직임 마쳤다고 판단
                                this.vel.moving = false;
                                this.movingDone = true;
                            }
        
                        }
                        else if ((this.move_randNum % 2 == 1) && this.moveCount < this.move_randNum) {//홀수인 경우 -> 왼쪽으로 이동
                            //console.log(this.x - this.speed);
                            if (this.x - this.speed >= this.xMax_left) { //고정 범위 안에 있는 경우
                                this.vel.moving = true;
                                collisonCheckX[this.x + 49] = 1;
                                collisonCheckX[this.x + this.canvasLength - 50] = -1;
                                this.vel.lookingRight = false;
                                this.x-=this.speed;
                                this.moveCount+=this.speed;
                            }
                            else { // 고정 범위 끝까지 간 경우 -> 움직임 마쳤다고 판단
                                this.vel.moving = false;
                                this.movingDone = true;
                            }
                        }
        
                        else if (this.moveCount >= this.move_randNum) {
                            this.vel.moving = false;
                            this.movingDone = true;
                            this.moveCount = 0;
                        }
                    }
                }
            }
        }

        else if (this.dead == true) { //몹이 죽었을 경우
            for (i = 0; i <= this.width; i++) {
                collisonCheckX[this.x + i] = -1;
            }
        }
    }

    checkAttacked(atkTimer_p1, collisonCheckX) {//공격이 해당 물체에 가해졌는지 확인
        if ((collisonCheckX[atkTimer_p1] == 1) && (this.x <= atkTimer_p1 && atkTimer_p1 <= this.x + this.canvasLength) && this.dead == false) {
            this.healthCount--;
            if (this.healthCount == 0) {
                //console.log('nz1 dead');
                this.dead = true;
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
    //constructor(x, y, width, height, canvasLength)
    p1 = new MainCharacter(200, 664, 500, 500, 200);
    p1.setLoops(4, 8, 6);
    p2 = new MainCharacter(500, 664, 500, 500, 200);
    p2.setLoops(4, 8, 6);
    var currentStageNum = 0;
    nz1 = new NormalZombie(1200, 664, 500, 500, 200);
    nz1.setLoops(6, 7, 4);
    nz1.setFixedRange(1000, 1400);
    nz1.setStunLoop(3);
    return {
        currentStageNum,
        bg,
        players: [p1, p2],
        zombies: [nz1],
        collisonCheckX,
        activate: true,
    }
}

//플레이어 방어 상자 갱신
function updateBlockBox(player, x, y) {
    player.BlockBox.x_right = x + player.canvasLength - 10;
    player.BlockBox.x_left = x + 10;
    player.BlockBox.y = y + 60;
}

function gameLoop(state) {
    if (!state) {
        return;
    }
    const p1 = state.players[0];
    const p2 = state.players[1];
    const nz1 = state.zombies[0];
    const collisonCheckX = state.collisonCheckX;

    var bigX = biggerX(p1.x + p1.canvasLength - 40, p2.x + p2.canvasLength - 40);
    var smallX = smallerX(p1.x + 40, p2.x + 40);

    updateBlockBox(p1, p1.x, p1.y);
    updateBlockBox(p2, p2.x, p2.y);

    if (nz1.vel.attacking == true && nz1.stageNum == state.currentStageNum) {
        nz1.zombieAttack(p1, p2);
    }

    else if (nz1.vel.attacking == false && nz1.stageNum == state.currentStageNum) {
        nz1.move(bigX, smallX, collisonCheckX);
    }
    

    for (var i = 0; i <= p1.canvasLength - 80; i++) { //플레이어1이 서 있는 곳은 0 으로 표시
        collisonCheckX[p1.x + 40 + i] = 0;
    }

    for (var i = 0; i <= p2.canvasLength - 80; i++) { //플레이어2가 서 있는 곳은 0 으로 표시
        collisonCheckX[p2.x + 40 + i] = 0;
    }

    //플레이어 1,2 가 맵 이동을 위해 같은 방향으로 움직일때

    //둘 다 왼쪽으로 움직일 때
    if ((p1.vel.movingLeft == true && collisonCheckX[p1.x + 38] != 1) && (p1.vel.attacking == false && p1.vel.blocking == false && p1.isDamaged == false)) {
        if ((p2.vel.movingLeft == true && collisonCheckX[p2.x + 38] != 1) && (p2.vel.attacking == false && p2.vel.blocking == false && p2.isDamaged == false)) {
            if ((bigX <= 800) && bg.bg_x > 0) { //배경화면 오른쪽으로 이동
                bg.bgmovingRight = true;
                bg.bg_x -= bg.ratio * 2;

                // 플레이어 이외의 물체나 몬스터들
                nz1.x+=2;

                //플레이어 애니메이션 변수
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
            else if (p1.x > 0 && p2.x > 0){ // 그냥 각자 움직이는 경우
                collisonCheckX[p1.x + 38] = 0;
                collisonCheckX[p1.x + 39] = 0;
                collisonCheckX[p1.x + p1.canvasLength - 40] = -1;
                collisonCheckX[p1.x + p1.canvasLength - 41] = -1;
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

                collisonCheckX[p2.x + 38] = 0;
                collisonCheckX[p2.x + 39] = 0;
                collisonCheckX[p2.x + p2.canvasLength - 40] = -1;
                collisonCheckX[p2.x + p2.canvasLength - 41] = -1;
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
    }

    //둘 다 오른쪽으로 움직일 때
    if ((p1.vel.movingRight == true && collisonCheckX[p1.x + p1.canvasLength - 38] != 1) && (p1.vel.attacking == false && p1.vel.blocking == false && p1.isDamaged == false)) {
        if ((p2.vel.movingRight == true && collisonCheckX[p2.x + p2.canvasLength - 38] != 1) && (p2.vel.attacking == false && p2.vel.blocking == false && p2.isDamaged == false)) {
            if ((smallX >= (canvas_width - 700)) && bg.bg_x < bg.bg_xMax) { //배경화면 오른쪽으로 이동
                bg.bgmovingLeft = true;
                bg.bg_x += bg.ratio * 2;

                // 플레이어 이외의 물체나 몬스터들
                nz1.x-=2;

                // 플레이어 애니메이션 변수
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
            else if (p1.x + p1.canvasLength < canvas_width && p2.x + p2.canvasLength < canvas_width){ // 그냥 각자 움직이는 경우
                collisonCheckX[p1.x + 40] = -1;
                collisonCheckX[p1.x + 41] = -1;
                collisonCheckX[p1.x + p1.canvasLength - 39] = 0;
                collisonCheckX[p1.x + p1.canvasLength - 38] = 0;
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
                
                collisonCheckX[p2.x + 40] = -1;
                collisonCheckX[p2.x + 41] = -1;
                collisonCheckX[p2.x + p2.canvasLength - 39] = 0;
                collisonCheckX[p2.x + p2.canvasLength - 38] = 0;
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
    }





    //플레이어1 이 가만히 서 있는 경우
    if (p1.vel.attacking == false && p1.vel.moving == false && p1.vel.blocking == false) {
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

    //플래이어1 이 왼쪽으로 이동하는 경우 (플레이어2는 왼쪽으로 가지 않을 때)
    if ((p1.vel.movingLeft == true && collisonCheckX[p1.x + 38] != 1) && (p1.vel.attacking == false && p1.vel.blocking == false && p1.isDamaged == false)) {
        if (p1.x > 0 && p2.vel.movingLeft == false) {
            collisonCheckX[p1.x + 38] = 0;
            collisonCheckX[p1.x + 39] = 0;
            collisonCheckX[p1.x + p1.canvasLength - 40] = -1;
            collisonCheckX[p1.x + p1.canvasLength - 41] = -1;
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

    //플래이어1이 오른쪽으로 이동하는 경우 (플레이어2는 오른쪽으로 가지 않을 때)
    if ((p1.vel.movingRight == true && collisonCheckX[p1.x + p1.canvasLength - 38] != 1) && (p1.vel.attacking == false && p1.vel.blocking == false && p1.isDamaged == false)) {
        if (p1.x < canvas_width - p1.canvasLength && p2.vel.movingRight == false) {
            collisonCheckX[p1.x + 40] = -1;
            collisonCheckX[p1.x + 41] = -1;
            collisonCheckX[p1.x + p1.canvasLength - 39] = 0;
            collisonCheckX[p1.x + p1.canvasLength - 38] = 0;
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
    if (p1.vel.attacking == true) {
        //오른쪽 공격
        if(p1.vel.lookingRight == true) {
            if (p1.attackTimer >= p1.attackBox.width) { // 공격 범위 120 0.5초 -> 30frmae 1 frame당 4 증가
                nz1.checkAttacked(p1.attackBox.position_x + p1.attackTimer, collisonCheckX);
                p1.vel.attacking = false;
                p1.attackTimer = 0;
            }
            else {
                p1.attackTimer+=4;
            }
        }
        //왼쪽 공격
        else if(p1.vel.lookingRight == false) {
            if (Math.abs(p1.attackTimer) >= p1.attackBox.width) {
                nz1.checkAttacked(p1.attackBox.position_x + p1.attackTimer, collisonCheckX);
                p1.vel.attacking = false;
                p1.attackTimer = 0;
            }
            else {
                p1.attackTimer-=4;
            }
        }
    }
    //플레이어1 공격 애니메이션 변수 attackFrame 이 30이 될때 마다 장면이 바뀜
    if (p1.vel.attacking_motion == true) {
        
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
                p1.vel.attacking_motion = false; //공격 동작 종료
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
    if (p2.vel.attacking == false && p2.vel.moving == false && p2.vel.blocking == false) {
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

    //플래이어2 가 왼쪽으로 이동하는 경우 (플레이어1은 왼쪽으로 가지 않을 때)
    if ((p2.vel.movingLeft == true && collisonCheckX[p2.x + 38] != 1) && (p2.vel.attacking == false && p2.vel.blocking == false && p2.isDamaged == false)) {
        if (p2.x > 0 && p1.vel.movingLeft == false) {
            collisonCheckX[p2.x + 38] = 0;
            collisonCheckX[p2.x + 39] = 0;
            collisonCheckX[p2.x + p2.canvasLength - 40] = -1;
            collisonCheckX[p2.x + p2.canvasLength - 41] = -1;
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

    //플래이어2가 오른쪽으로 이동하는 경우 (플레이어1은 오른쪽으로 가지 않을 때)
    if ((p2.vel.movingRight == true && collisonCheckX[p2.x + p2.canvasLength - 38] != 1) && (p2.vel.attacking == false && p2.vel.blocking == false && p2.isDamaged == false)) {
        if (p2.x < canvas_width - p2.canvasLength && p1.vel.movingRight == false) {
            collisonCheckX[p2.x + 40] = -1;
            collisonCheckX[p2.x + 41] = -1;
            collisonCheckX[p2.x + p2.canvasLength - 39] = 0;
            collisonCheckX[p2.x + p2.canvasLength - 38] = 0;
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
    if (p2.vel.attacking == true) {
        //오른쪽 공격
        if(p2.vel.lookingRight == true) {
            if (p2.attackTimer >= p2.attackBox.width) {
                nz1.checkAttacked(p2.attackBox.position_x + p2.attackTimer, collisonCheckX);
                p2.vel.attacking = false;
                p2.attackTimer = 0;
            }
            else {
                p2.attackTimer+=4;
            }
        }
        //왼쪽 공격
        else if(p2.vel.lookingRight == false) {
            if (Math.abs(p2.attackTimer) >= p2.attackBox.width) {
                nz1.checkAttacked(p2.attackBox.position_x + p2.attackTimer, collisonCheckX);
                p2.vel.attacking = false;
                p2.attackTimer = 0;
            }
            else {
                p2.attackTimer-=4;
            }
        }
    }

    //플레이어2 공격 애니메이션 변수 attackFrame 이 30이 될때 마다 장면이 바뀜
    if (p2.vel.attacking_motion == true) {
        
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
                p2.vel.attacking_motion = false; //공격 동작 종료
            }
            else {
                p2.attackCount++;
            }
        }
    }


    //플레이어2이 공격에 맞은 경우
    if (p2.isDamaged == true) {
        p2.damagedCount++;
        if (p2.damagedCount == 60) {
            p2.isDamaged = false;
            p2.damagedCount = 0;
        }
    }
    

    //NormalZombie 애니메이션 변수
    if (nz1.dead == false && nz1.stageNum == state.currentStageNum) {
        if (nz1.vel.moving == false) {
            //플레이어가 해당 몬스터의 공격을 막았을 경우
           if (nz1.stunned == true) {
               if (nz1.stunCount % 40 == 39) {
                   nz1.stunAnimaitonCount++;
                   nz1.stunAnimaitonCount = nz1.stunAnimaitonCount % nz1.stunLoop;
               }
           }
           //텀이 지나고 다시 공격하는 경우
           else if (nz1.vel.attacking == true && nz1.waitCount == 30) {
               if (nz1.attackFrame < 10) {
                    nz1.attackFrame++;
               }
               else if (nz1.attackFrame == 10) {
                    nz1.attackFrame = 0;
                    if (nz1.attackCount < nz1.attackLoop - 1) {
                        nz1.attackCount++;
                    }
                    else {
                        nz1.attackCount = 0;
                    }
               }
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
   
       else if (nz1.vel.moving == true) {
           if (nz1.walkingCount == 30) {
               nz1.walkingCount = 0;
               nz1.walkingCut++;
               nz1.walkingCut = nz1.walkingCut % nz1.walkingLoop;
           }
           nz1.walkingCount++;
       }
    }
    else if (nz1.dead == true) {
        if (nz1.deathFrame < 30 && nz1.deathCount < 7) {
            nz1.deathFrame++;
        }
        else if (nz1.deathFrame == 30 && nz1.deathCount < 7) {
            nz1.deathFrame = 0;
            nz1.deathCount++;
        }
        else {
            nz1.deathCount = 7;
        }
    }
    



    //스테이지 이동 로직 -> 오른쪽으로만 이동
    if (bg.bg_x == bg.bg_xMax && bigX + 40 == canvas_width - 10) { //둘 중 한명이 맵 오른쪽 끝까지 가는 경우
        p1.x = 100;
        p2.x = 300;
        state.currentStageNum++;
        bg.bg_x = 0;
    }
    
}



function getUpdatedVelocityDown(keyCode, player) { // 키 눌렀을때(누르고 있을 때) 이벤트
    switch (keyCode) {
        //a -> 왼쪽 이동
        case 65:
            if (player.isDamaged == false && player.vel.attacking == false && player.vel.blocking == false) {
                return {
                    // 보고 있는 방향
                    lookingRight : false,

                    // 공격하고 있는지 여부
                    attacking : false,
                    attacking_motion : false,

                    //움직이고 있는지 여부
                    moving : true,
                    movingRight : false,
                    movingLeft : true,
                    
                    //방어하고 있는지 여부
                    blocking: false
                };
            }
            else {
                return;
            }
        //d -> 오른쪽 이동
        case 68:
            if (player.isDamaged == false && player.vel.attacking == false && player.vel.blocking == false) {
                return {
                    // 보고 있는 방향
                    lookingRight : true,

                    // 공격하고 있는지 여부
                    attacking : false,
                    attacking_motion : false,

                    //움직이고 있는지 여부
                    moving : true,
                    movingRight : true,
                    movingLeft : false,

                    //방어하고 있는지 여부
                    blocking: false
                };
            }
            else {
                return;
            }
        // f -> 공격
        case 70:
            if (player.isDamaged == false) {
                if (player.vel.lookingRight == true) { // 오른쪽
                    return {
                        // 보고 있는 방향
                        lookingRight : true,
    
                        // 공격하고 있는지 여부
                        attacking : true,
                        attacking_motion : true,
    
                        //움직이고 있는지 여부
                        moving : false,
                        movingRight : false,
                        movingLeft : false,

                        //방어하고 있는지 여부
                        blocking: false
                    };
                }
                else { //왼쪽
                    return {
                        // 보고 있는 방향
                        lookingRight : false,
    
                        // 공격하고 있는지 여부
                        attacking : true,
                        attacking_motion : true,
    
                        //움직이고 있는지 여부
                        moving : false,
                        movingRight : false,
                        movingLeft : false,

                        //방어하고 있는지 여부
                        blocking: false
                    };
                }
            }
        //r -> 방어
        case 82:
            if (player.vel.lookingRight == true) { //오른쪽 방어
                return {
                    // 보고 있는 방향
                    lookingRight : true,

                    // 공격하고 있는지 여부
                    attacking : false,
                    attacking_motion : false,

                    //움직이고 있는지 여부
                    moving : false,
                    movingRight : false,
                    movingLeft : false,

                    //방어하고 있는지 여부
                    blocking: true
                };
            }
            else {  //왼쪽 방어
                return {
                    // 보고 있는 방향
                    lookingRight : false,

                    // 공격하고 있는지 여부
                    attacking : false,
                    attacking_motion : false,

                    //움직이고 있는지 여부
                    moving : false,
                    movingRight : false,
                    movingLeft : false,

                    //방어하고 있는지 여부
                    blocking: true
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
                lookingRight : false,

                // 공격하고 있는지 여부
                attacking : false,
                attacking_motion : false,

                //움직이고 있는지 여부
                moving : false,
                movingRight : false,
                movingLeft : false,

                //방어하고 있는지 여부
                blocking: false
            };
        //d -> 오른쪽 이동하다가 멈추는 경우
        case 68:
            return {
                // 보고 있는 방향
                lookingRight : true,

                // 공격하고 있는지 여부
                attacking : false,
                attacking_motion : false,

                //움직이고 있는지 여부
                moving : false,
                movingRight : false,
                movingLeft : false,

                //방어하고 있는지 여부
                blocking: false
            };
        //r -> 방어 했다가 푸는 경우
        case 82:
            if (player.vel.lookingRight == true) { //오른쪽 방어였던 경우
                return {
                    // 보고 있는 방향
                    lookingRight : true,
    
                    // 공격하고 있는지 여부
                    attacking : false,
                    attacking_motion : false,
    
                    //움직이고 있는지 여부
                    moving : false,
                    movingRight : false,
                    movingLeft : false,
    
                    //방어하고 있는지 여부
                    blocking: false
                };
            }

            else {
                return {
                    // 보고 있는 방향
                    lookingRight : false,
    
                    // 공격하고 있는지 여부
                    attacking : false,
                    attacking_motion : false,
    
                    //움직이고 있는지 여부
                    moving : false,
                    movingRight : false,
                    movingLeft : false,
    
                    //방어하고 있는지 여부
                    blocking: false
                };
            }
    }
}