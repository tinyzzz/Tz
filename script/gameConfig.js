const Config_View_Width = 360;
const Config_View_Height = 360;
const Config_MaxRow = 9;
const Config_MaxCol = 9;
const Config_MaxLayer = 3;
const Config_Cell = 32;
const Config_State_Game = 0;
const Config_State_Menu = 1;
const Config_State_PK = 2;
const Config_Render_MapX = 36;
const Config_Render_MapY = 36;
const Config_RoleMoveSpeed = 4;       //玩家移动时间，单位:帧
const Config_GifSpeed = 0.1;          //帧动画播放速度
const Config_PathWidth = 6;           //寻路路线宽
const Config_PathHeight = 6;          //寻路路线高
const Config_PathRadius = 3;          //寻路错误圆圈半径
const Color_Path = 0xAADDDD;          //寻路路线颜色
const Color_ErrPath = 0xDD3333;       //寻路错误颜色

let Global = {
    FPS: 0,
    init: false,
    state: Config_State_Game,

    clickUp: true,                  // 玩家松开了点击
    clickPos: {}                    // 玩家点击的节点
};

let Role = {
    pos: {},
    newPos: {},
    tarPos: {},
    facing: 3,             //玩家朝向，只能是1,2,3,4 W1 A2 S3 D4
    canMove: false,        //玩家是否可以移动
    isMoving: false,       //玩家是否正在移动
    movePath: [],          //玩家移动路线
    minLevel: 0,
    maxLevel: 0
};
