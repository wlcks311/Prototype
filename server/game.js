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
        this.refreshRate = 10;
        this.attackTimer = 0;
        this.attackFrame = 0;
        this.BlockBox = {
            x_right : this.x + this.CanvasLength - 70,
            x_left : this.x + 30,
            y : this.y + 60,
            width : 40,
            height : 70
        }
    }
    updateBlockBox(x_right, x_left, y) {
        this.BlockBox.x_right = x_right;
        this.BlockBox.x_left = x_left;
        this.BlockBox.y = y;
    }

    attack() {
        if (this.vel.isLookingRight == true) {
            if (attackFrame < 30 && (this.attackCount <= 1)) {
                attackFrame+=6;
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }

            else if (attackFrame < 30 && (this.attackCount == 2)) {
                attackFrame+=3;
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
            else if (attackFrame < 30 && (this.attackCount <= 4)) {
                attackFrame+=5
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
            }
            else if (attackFrame < 30 && (this.attackCount == 5)) {
                attackFrame+=3;
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
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
                ctx.drawImage(img_Middle_Attack_full, this.width * this.attackCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
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

    draw() {
        this.updateBlockBox(this.x + this.CanvasLength - 70, this.x + 30, this.y + 60); //플레이어의 움직임에 따라 해당 좌표를 방어 상자에 갱신

        if (this.vel.isAttacking_motion == true) { //공격 하는 경우 -> 움직일 수 없음
            this.attack()
        }

        //플레이어가 몬스터에게 맞은 경우 -> 맞은 모션
        else if(this.isDamaged == true) {
            if (this.vel.isLookingRight == true) { //오른쪽을 보고있다가 맞은 경우
                if (this.damagedCount < 60) {
                    this.damagedCount++;
                    if (this.damagedCount <= 30) {
                        ctx.drawImage(img_Player_attacked, 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else {
                        ctx.drawImage(img_Player_attacked, 500, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
                else if (this.damagedCount == 60) {
                    ctx.drawImage(img_Player_attacked, 500, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    this.isDamaged = false;
                    this.damagedCount = 0;
                }
            }

            else if(this.vel.isLookingRight == false) { //왼쪽을 보고 있다가 맞은 경우
                if (this.damagedCount < 60) {
                    this.damagedCount++;
                    if (this.damagedCount <= 30) {
                        ctx.drawImage(img_Player_attacked_left, 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                    else {
                        ctx.drawImage(img_Player_attacked_left, 500, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
                else if (this.damagedCount == 60) {
                    ctx.drawImage(img_Player_attacked_left, 500, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    this.isDamaged = false;
                    this.damagedCount = 0;
                }
            }
        }

        // 공격중이 아닌 경우
        else {
            if (this.vel.isBlocking == true) {
                ctx.fillStyle = 'blue';
                if(this.vel.isLookingRight == true) { //오른쪽 보고있는 경우 -> 오른쪽 방어
                    ctx.drawImage(img_Block, 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    ctx.fillRect(this.BlockBox.x_right, this.BlockBox.y, this.BlockBox.width, this.BlockBox.height);
                }

                else if (this.vel.isLookingRight == false) { //왼쪽 보고있는 경우 -> 왼쪽 방어
                    ctx.drawImage(img_Block_left, 0, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    ctx.fillRect(this.BlockBox.x_left, this.BlockBox.y, this.BlockBox.width, this.BlockBox.height);
                }
            }

            else if (this.vel.isMoving == true) { //걷는 경우
                if (this.vel.isLookingRight == true) { //오른쪽을 보고있는 경우
                    if (frameCount < refreshRate) {
                        frameCount++;
                        ctx.drawImage(img_Walking_full, this.width * this.walkingCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
            
                    else if(frameCount == refreshRate) {
                        frameCount = 0;
                        if (this.walkingCount == this.walkingLoop - 1) {
                            this.walkingCount = 0;
                        }
                        else {
                            this.walkingCount++;
                        }
                        ctx.drawImage(img_Walking_full, this.width * this.walkingCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
        
                else { // 왼쪽을 보고있는 경우
                    if (frameCount < refreshRate) {
                        frameCount++;
                        ctx.drawImage(img_Walking_full_left, this.width *this.walkingCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
            
                    else if(frameCount == refreshRate) {
                        frameCount = 0;
                        if (this.walkingCount == this.walkingLoop - 1) {
                            this.walkingCount = 0;
                        }
                        else {
                            this.walkingCount++;
                        }
                        ctx.drawImage(img_Walking_full_left, this.width *this.walkingCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
            }
    
            else { // 가만히 서 있는 경우
                if (this.vel.isLookingRight == true) { //오른쪽을 보고있는 경우
                    if (frameCount < refreshRate) {
                        frameCount++;
                        ctx.drawImage(img_Idle_full, this.width * this.idleCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
            
                    else if(frameCount == refreshRate) {
                        frameCount = 0;
                        if (this.idleCount == this.idleLoop - 1) {
                            this.idleCount = 0;
                        }
                        else {
                            this.idleCount++;
                        }
                        ctx.drawImage(img_Idle_full, this.width * this.idleCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
        
                else { // 왼쪽을 보고있는 경우
                    if (frameCount < refreshRate) {
                        frameCount++;
                        ctx.drawImage(img_Idle_full_left, this.width * this.idleCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
            
                    else if(frameCount == refreshRate) {
                        frameCount = 0;
                        if (this.idleCount == this.idleLoop - 1) {
                            this.idleCount = 0;
                        }
                        else {
                            this.idleCount++;
                        }
                        ctx.drawImage(img_Idle_full_left, this.width * this.idleCount, 0, this.width, this.height, this.x, this.y, this.CanvasLength, this.CanvasLength);
                    }
                }
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
    p1 = new MainCharacter(500, 350, 500, 500, 200);
    p1.setLoops(4, 8, 6);
    p2 = new MainCharacter(800, 350, 500, 500, 200);
    p2.setLoops(4, 8, 6);
    return {
        bg,
        players: [p1, p2],
        collisonCheckX,
        activate: true,
    }
}

function gameLoop(state) {
    if (!state) {
        return;
    }

    const p1 = state.players[0];
    const p2 = state.players[1];
    const collisonCheckX = state.collisonCheckX;

    for (var i = 0; i <= p1.CanvasLength - 80; i++) { //플레이어1이 서 있는 곳은 0 으로 표시
        collisonCheckX[p1.x + 40 + i] = 0;
    }

    for (var i = 0; i <= p2.CanvasLength - 80; i++) { //플레이어2가 서 있는 곳은 0 으로 표시
        collisonCheckX[p2.x + 40 + i] = 0;
    }

    //플래이어1 이 왼쪽으로 이동하는 경우
    if ((p1.vel.isMovingLeft == true && collisonCheckX[p1.x + 38] == -1) && (p1.vel.isAttacking == false && p1.vel.isBlocking == false && p1.isDamaged == false)) {
        if (p1.x > 0) {
            collisonCheckX[p1.x + 38] = 0;
            collisonCheckX[p1.x + 39] = 0;
            collisonCheckX[p1.x + p1.CanvasLength - 40] = -1;
            collisonCheckX[p1.x + p1.CanvasLength - 41] = -1;
            p1.x-=2;
            p1.attackBox.position_x-=2;
        }
    }

    //플래이어1이 오른쪽으로 이동하는 경우
    if ((p1.vel.isMovingRight == true && collisonCheckX[p1.x + p1.CanvasLength - 38] == -1) && (p1.vel.isAttacking == false && p1.vel.isBlocking == false && p1.isDamaged == false)) {
        if (p1.x < canvas_width - p1.CanvasLength) {
            collisonCheckX[p1.x + 40] = -1;
            collisonCheckX[p1.x + 41] = -1;
            collisonCheckX[p1.x + p1.CanvasLength - 39] = 0;
            collisonCheckX[p1.x + p1.CanvasLength - 38] = 0;
            p1.x+=2;
            p1.attackBox.position_x+=2;
        }
    }

    //플레이어1이 공격 중인 경우
    if (p1.vel.isAttacking == true) {
        //오른쪽 공격
        if(p1.vel.isLookingRight == true) {
            if (p1.attackTimer >= p1.attackBox.width) {
                p1.isAttacking = false;
                p1.attackTimer = 0;
            }
            else {
                p1.attackTimer+=2;
            }
        }
        //왼쪽 공격
        else if(p1.vel.isLookingRight == false) {
            if (p1.attackTimer >= p1.attackBox.width) {
                p1.isAttacking = false;
                p1.attackTimer = 0;
            }
            else {
                p1.attackTimer+=2;
            }
        }
    }

    //플레이어1이 공격 중인 경우
    if (p1.vel.isAttacking == true) {
        //오른쪽 공격
        if(p1.vel.isLookingRight == true) {
            if (p1.attackTimer >= p1.attackBox.width) {
                p1.isAttacking = false;
                p1.attackTimer = 0;
            }
            else {
                p1.attackTimer+=2;
            }
        }
        //왼쪽 공격
        else if(p1.vel.isLookingRight == false) {
            if (p1.attackTimer >= p1.attackBox.width) {
                p1.isAttacking = false;
                p1.attackTimer = 0;
            }
            else {
                p1.attackTimer+=2;
            }
        }
    }

    //플래이어2 가 왼쪽으로 이동하는 경우
    if ((p2.vel.isMovingLeft == true && collisonCheckX[p2.x + 38] == -1) && (p2.vel.isAttacking == false && p2.vel.isBlocking == false && p2.isDamaged == false)) {
        if (p2.x > 0) {
            collisonCheckX[p2.x + 38] = 0;
            collisonCheckX[p2.x + 39] = 0;
            collisonCheckX[p2.x + p2.CanvasLength - 40] = -1;
            collisonCheckX[p2.x + p2.CanvasLength - 41] = -1;
            p2.x-=2;
            p2.attackBox.position_x-=2;
        }
    }

    //플래이어2가 오른쪽으로 이동하는 경우
    if ((p2.vel.isMovingRight == true && collisonCheckX[p2.x + p2.CanvasLength - 38] == -1) && (p2.vel.isAttacking == false && p2.vel.isBlocking == false && p2.isDamaged == false)) {
        if (p2.x < canvas_width - p2.CanvasLength) {
            collisonCheckX[p2.x + 40] = -1;
            collisonCheckX[p2.x + 41] = -1;
            collisonCheckX[p2.x + p2.CanvasLength - 39] = 0;
            collisonCheckX[p2.x + p2.CanvasLength - 38] = 0;
            p2.x+=2;
            p2.attackBox.position_x+=2;
        }
    }

    //플레이어2가 공격 중인 경우
    if (p2.vel.isAttacking == true) {
        //오른쪽 공격
        if(p2.vel.isLookingRight == true) {
            if (p2.attackTimer >= p2.attackBox.width) {
                p2.isAttacking = false;
                p2.attackTimer = 0;
            }
            else {
                p2.attackTimer+=2;
            }
        }
        //왼쪽 공격
        else if(p2.vel.isLookingRight == false) {
            if (p2.attackTimer >= p2.attackBox.width) {
                p2.isAttacking = false;
                p2.attackTimer = 0;
            }
            else {
                p2.attackTimer+=2;
            }
        }
    }



    return false;
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