const Config = {
    Show_DebugLog: true,
    Order:'',                //玩家下达的指令 W A S D 移动

    View_Width: 360,
    View_Height: 360,

    Map_MaxRow: 9,
    Map_MaxCol: 9,
    Map_MaxLayer: 3,
    Map_Cell: 32,

    State_Game: 0,
    State_Menu: 1,
    State_PK: 2,

    Render_MapX: 36,
    Render_MapY: 36,

    Render_GifSpeed: 0.1,      //帧动画播放速度
    Render_RoleFacing: 3,      //玩家朝向，只能是1,2,3,4 W1 A2 S3 D4
    Render_RoleMoving: false,  //玩家是否在移动
    Render_RoleMoveTime: 2,   //玩家移动时间，单位:帧

    ClickRow: 0,              //在mapBox内部的点击时: clickRow = position.y/map_Cell
    ClickCol: 0               //在mapBox内部的点击时：clickCol = position.x/map_Cell
};

let Global = {
    FPS: 0,
    init: false,
    state: Config.State_Game,
    canMove: false
};

let Role = {
    pos: {level: 0, layer: 0, row: 5, col: 5},
    newPos: {level: 0, layer: 0, row: 0, col: 0},
    tarPos: {level: 0, layer: 0, row: 0, col: 0},

    minLevel:0,
    maxLevel:0
};
