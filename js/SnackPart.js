class SnackPart{
    constructor(x, y,dir,next) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        //表示下一步要走的位置，数据来自于行走记录数组
        this.next = next;
    }
}