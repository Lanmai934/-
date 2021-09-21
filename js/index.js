var canvas = document.querySelector('#SnackArea');
//获取画笔
var ctx = canvas.getContext('2d');
//将画布的宽高调整为和css设置的宽高一致,避免出现放大效果
canvas.width = 600;
canvas.height = 360;

// 蛇的数组,默认只有蛇的头部和尾部
var headDir = 2;// 0 下 1 上 2 右  3 左
var snackArr = [new SnackPart(1, 0,headDir,-1), new SnackPart(0,0,headDir,0)];

//定义行走记录数组，用于保存蛇头部走过的位置
var tracks = [];
//保存食物的坐标
var foodLocation = { x: -1, y: -1 };
//用于保存尾部最近一个位置，为贪吃蛇生长做准备
var toAdd = {};
//用于控制定时器
var timer = -1;//用于保存定时器的id，方便控制定时器
//移动速度
var speed = 200;//以毫秒为单位
var GameOver = false;//表示游戏是否结束,默认没有结束
var GameTime = 00;//保存游戏总时间

//分数
var GameScore = '0000';

/**
 * 第一部分
 */

//在js中加载需要绘制的图片
var headimg = document.createElement('img');
var footimg = document.createElement('img');
var bodyimg = document.createElement('img');
var foodimg = document.createElement('img');
//在js中，给图片元素设置src属性浏览器就会自动加载该图片到内存中，js可以操作
headimg.src = '../image/head.png';
footimg.src = '../image/foot.png';
foodimg.src = '../image/egg.png';
bodyimg.src = '../image/body.png';
//在图片加载完成之后再绘制 加载 onload
headimg.onload = function () {
    //图片加载完之后才执行这里的代码
    footimg.onload = function () {
        bodyimg.onload = function () {
            renderSnack();
        }
    }
    
}
foodimg.onload = function () {
    createRandomFood(); 
    renderFood();
}


//绘制贪吃蛇
function renderSnack() {
    // 绘制贪吃蛇的向下部分
    //将40*40的贪吃蛇，缩小一半，显示在画布上
    var head = snackArr[0];
    var foot = snackArr[snackArr.length - 1];
    // ctx.drawImage(img对象, 图片绘制区域的左上角的x坐标, y坐标, 绘制宽度, 高度,
    //     画布绘制区域的x坐标，y坐标，宽度, 高度);
    ctx.drawImage(headimg,headDir*40,0, 40, 40, head.x * 20,head.y* 20,20,20);
    ctx.drawImage(footimg,foot.dir * 40, 0, 40, 40, foot.x * 20, foot.y * 20, 20, 20);
    //绘制蛇的身体
    for (var i = 1; i < snackArr.length - 1; i++){
        var s = snackArr[i];
        ctx.drawImage(bodyimg,0, 0, 40, 40, s.x * 20, s.y * 20, 20, 20);
    }
}


/**
 * 第二部分
 * 键盘监听
 */
// 利用定时器重复进行移动和绘制贪吃蛇
function interval() {
    if (!GameOver) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        move();
        renderSnack();
        renderFood();
        eat();
        out();
        showScore();
        showTime();
    } else {
        //暂停游戏
        pause();
        //播放游戏结束音乐
        document.querySelector('#overmusic').play();
        //关闭背景音乐
        document.querySelector('#bgmusic').pause();
        //显示游戏结束图片
        document.querySelector('#GameOver').className = 'over';
    }
    
}

function start() {
    //每隔一段时间就执行interval函数
    timer = setInterval(interval, speed);
    //播放背景音乐
    document.querySelector('#bgmusic').play();
}
//暂停
function pause() {
    clearInterval(timer);
    timer = -1;
    GameOver = false;
}


//当我按下键盘的时候就会执行该函数
document.body.onkeydown = function (e) {
    //判断上下左右
    //keycode保存了按键 的键码
    
    switch (e.keyCode) {
        case 37:         
            //向左移动
            headDir = 3;
            break;
        case 38:
          
            headDir = 1
            break;
        case 39:
           
            headDir =2
            break;
        case 40:
            
            headDir = 0;
            break;
    }
    console.log(headDir);
}
//控制移动
function move() {

    //头部根据headDir来行走
    var head = snackArr[0];
    //将当前位置追加到tracks里面
    tracks.push(new Track(head.x, head.y, headDir));
     //根据headDir来进行移动
     switch (headDir) {
        case 0:
            //下
            head.y++;
            break;
        case 1:
            //上
            head.y--;
            break;
        case 2:
            //右
            head.x++;
            break;
        case 3:
            //左
            head.x--;
            break;
    }
    //其他部分是跟着运动轨迹数组走
    //吧移动前尾部的位置保存到toADD中
    var foot = snackArr[snackArr.length - 1];
    toAdd = new SnackPart(foot.x, foot.y, foot.dir,foot.next);
    for (var i = 1; i < snackArr.length; i++){
        var s = snackArr[i];
        //先获取下一步要走的位置
        var next = tracks[s.next];
        //吧要走的位置的坐标进行赋值
        s.x = next.x;
        s.y = next.y;
        s.dir = next.dir;
        //指向下一个要走的位置
        s.next++;
    }
}

/**
 * 第三部分，贪吃蛇生长
 * 1. 随机食物
 * 2. 判断位置
 * 3. 贪吃蛇生长
 * 4. 出界
 */
function createRandomFood() {
    //生成一个随机的x和y坐标

    var x = parseInt(Math.random() * 30);
    var y = parseInt(Math.random() * 18);
    //保存到变量里
    foodLocation.x = x;
    foodLocation.y = y;
}
//绘制食物
function renderFood() {
    ctx.drawImage(foodimg, 0, 0, 40, 40, foodLocation.x * 20, foodLocation.y * 20,20,20);
}
//判断是否可以吃食物
function eat() {
    //头部的位置和食物的位置是否一致
    var head = snackArr[0];
    if (head.x == foodLocation.x && head.y == foodLocation.y) {
        //贪吃蛇生长
        snackArr.push(toAdd);
        //重新随机食物
        createRandomFood();
        //播放音乐
        document.querySelector('#addmusic').play();
        //分数加1000
        GameScore = parseInt(GameScore) + 1000;
    }
}

//出界
function out() {
    // 头部是否出界
    var x = snackArr[0].x;
    var y = snackArr[0].y;
    if (x < 0 || y < 0 || x >= 30 || y >= 18) {
        GameOver = true;
        return;
    }
    //是否和自己相遇
    var head = snackArr[0];
    for (var i = 1; i < snackArr.length; i++){
        var s = snackArr[i];
        if (head.x == s.x && head.y == s.y) {
            //头部和自己身体某个部分位置重叠，即相撞
            GameOver = true;
            return;
        }
    }
}


/**
 * 第四部分
 * 1. 音乐
 * 2. 分数和时间
 */

function showScore() {
    document.querySelector('#GameScore').innerHTML = GameScore;
}
function showTime() {
    GameTime += speed / 1000;
    document.querySelector('#GameTime').innerHTML =parseInt (GameTime);
 }