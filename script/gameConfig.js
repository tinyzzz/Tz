const Config = {
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

    Render_RoleMoveTime: 2,     //玩家移动时间，单位:帧
    Render_GifSpeed: 0.1        //帧动画播放速度
};


let Global = {
    FPS: 0,
    init: false,
    state: Config.State_Game,

    clickPos: {},
    Order: '',                //玩家下达的指令 W A S D 移动
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
