'use strict';

class Core {
    // 全局变量
    static bg = {};       //所有图片资源 - 包括背景等等
    static picSheet = {};  //所有pic图片json - 仅限32x32大小
    static gifSheet = {};  //所有gif图片json - 仅限32x32大小
    static manSheet = {};  //所有人物图片json - 仅限32x32大小
    static mapBox = {};    //地图渲染区域
    static pathBox = {};   //路径渲染区域
    static roleBox = {};   //玩家渲染区域
    static roleSP = [];

    // 渲染变量
    static app = {};
    static roleMoveTimeLeft = 0;

    // 初始化渲染
    static  init = function () {
        PIXI.utils.skipHello();
        Core.app = new PIXI.Application({
            width: Config_View_Width,
            height: Config_View_Height,
            antialias: true,
            transparent: false,
            resolution: 1,
        });
        Game.dom.body.appendChild(Core.app.view);
        let resLoader = PIXI.Loader.shared;
        // 加载图片资源
        resLoader.add(['image/bg.png',
            'image/tile.json',
            'image/tile2.json',
            'image/tile3.json']);
        resLoader.load(Core.afterLoaded);
    };

    //  图片资源加载完毕后，会自动调用下面这个函数
    static afterLoaded = function () {
        // 其他代码初始化
        Core.initRole();

        // 图片资源初始化
        let resLoader = PIXI.Loader.shared;
        Core.bg = new PIXI.Sprite(resLoader.resources['image/bg.png'].texture);
        Core.picSheet = resLoader.resources['image/tile.json'].spritesheet;
        Core.gifSheet = resLoader.resources['image/tile2.json'].spritesheet;
        Core.manSheet = resLoader.resources['image/tile3.json'].spritesheet;

        // 加载背景
        Core.app.stage.addChild(Core.bg);

        // 加载地图mapBox
        Core.mapBox = new PIXI.Container();
        Core.mapBox.x = Config_Render_MapX;
        Core.mapBox.y = Config_Render_MapY;
        Core.mapBox.interactive = true;
        Core.mapBox.hitArea = new PIXI.Rectangle(0, 0, Config_MaxCol * Config_Cell, Config_MaxRow * Config_Cell);
        Core.mapBox.on('pointerdown', Core.onTouchMapBoxDown);
        Core.mapBox.on('pointerup', Core.onTouchMapBoxUp);
        Core.mapBox.on('pointerupoutside', Core.onTouchMapBoxUp);
        Core.app.stage.addChild(Core.mapBox);

        // 加载路径pathBox
        Core.pathBox = new PIXI.Container();
        Core.pathBox.x = Config_Render_MapX;
        Core.pathBox.y = Config_Render_MapY;
        Core.app.stage.addChild(Core.pathBox);

        // 加载角色roleBox
        Core.roleBox = new PIXI.Container();
        Core.roleBox.x = Role.pos.col * Config_Cell;
        Core.roleBox.y = Role.pos.row * Config_Cell;
        if (Core.roleBox.parent !== Core.mapBox) Core.mapBox.addChild(Core.roleBox);
        for (let f = 1; f <= 4; f++) {
            Core.roleSP[f] = new PIXI.AnimatedSprite(Core.manSheet.animations['m' + f]);
            Core.roleSP[f].animationSpeed = Config_GifSpeed;
            Core.roleSP[f].play();
        }
        Core.roleBox.addChild(Core.roleSP[3]);

        // 开始渲染地图
        Core.renderMap();
        Core.app.ticker.add(delta => Core.loop(delta));
    };

    //初始化角色数据
    static initRole = function () {
        Role.pos = new Pos(0, 0, 5, 5);
        Role.tarPos = new Pos(0, 0, 0, 0);
        Role.newPos = new Pos(0, 0, 0, 0);
        Role.minLevel = 0;
        Role.maxLevel = 0;
    };

    // 手指按下时，开始计算寻路指令
    static  onTouchMapBoxDown = function (event) {
        Global.clickUp = false;
        Global.clickPos = new Pos(Role.pos.level, 0,
            parseInt(event.data.getLocalPosition(this).y / Config_Cell),
            parseInt(event.data.getLocalPosition(this).x / Config_Cell));
        if (Role.movePath.length > 0) {
            // 如果角色正在移动，则完成当前移动后会停止后续移动，在点击的节点处显示一个x
            Role.movePath = [];
            Core.renderPath(Global.clickPos);
        } else {
            // 如果角色没有移动，则计算移动路线
            let way = Utils.findPath(Role.pos, Global.clickPos);
            if (way.length > 0) {
                // 如果有寻路路线，则渲染该路线
                Role.movePath = way;
                Core.renderPath();
            } else {
                // 如果没有寻路路线，则在点击的节点处显示一个x
                Core.renderPath(Global.clickPos);
            }
        }
    };

    // 手指抬起时，开始执行指令
    static  onTouchMapBoxUp = function () {
        Global.clickUp = true;
        Global.clickPos = {};
    };

    // 如果寻路路径长度大于0，则会自动寻路至下个节点
    static autoMoveToNextPos = function () {
        if (Role.movePath.length > 0) {
            let newPos = Role.movePath.shift();
            Role.newPos.row = newPos.row;
            Role.newPos.col = newPos.col;
            Core.roleMoveTimeLeft = Config_RoleMoveSpeed;
            Global.Render_RoleMoving = true;
            //玩家朝向，只能是1,2,3,4 W1 A2 S3 D4
            if (Role.newPos.row < Role.pos.row) {
                Role.facing = 1;
            } else if (Role.newPos.col < Role.pos.col) {
                Role.facing = 2;
            } else if (Role.newPos.row > Role.pos.row) {
                Role.facing = 3;
            } else if (Role.newPos.col > Role.pos.col) {
                Role.facing = 4;
            }
            Core.setRoleSPFacing(Role.facing);
            Core.renderPath();
        }
    };

    // 在mapBox中渲染游戏地图
    static renderMap = function () {
        let level = 0;
        let mapVal;
        let imgID;
        let tmpSp;
        for (let layer = 0; layer < Config_MaxLayer; layer++) {
            for (let row = 0; row < Config_MaxRow; row++) {
                for (let col = 0; col < Config_MaxCol; col++) {
                    mapVal = MapData.getVal(level, layer, row, col);
                    if (mapVal > 0) {
                        imgID = GameData[layer][mapVal].imgID;
                        if (imgID !== undefined) {
                            tmpSp = Core.getSprite(imgID);
                            if (tmpSp !== undefined) {
                                tmpSp.x = col * Config_Cell;
                                tmpSp.y = row * Config_Cell;
                                Core.mapBox.addChild(tmpSp);
                            }
                        }
                    }
                }
            }
        }
        // Todo
    };

    // 在pathBox中渲染寻路路线
    static renderPath = function (stopPos) {
        if (stopPos !== undefined) {
            // 点击了某个导致停止寻路的节点，会在该节点显示一个红点
            let g = new PIXI.Graphics();
            g.beginFill(Color_ErrPath);
            g.drawCircle(stopPos.col * Config_Cell + 16, stopPos.row * Config_Cell + 16, Config_PathRadius);
            g.endFill();
            Core.pathBox.removeChildren();
            Core.pathBox.addChild(g);
        } else {
            // 正常情况下，会清空路径并重新绘制
            let g = new PIXI.Graphics();
            g.beginFill(Color_Path);
            for (let pos of Role.movePath) {
                g.drawRect(pos.col * Config_Cell + 13, pos.row * Config_Cell + 13, Config_PathWidth, Config_PathHeight);
            }
            g.endFill();
            Core.pathBox.removeChildren();
            Core.pathBox.addChild(g);
        }
    };

    // 在roleBox中替换不同方向的SP
    static setRoleSPFacing = function (facing) {
        Core.roleBox.removeChildren();
        Core.roleBox.addChild(Core.roleSP[facing]);
    };

    // 计算Role的实时坐标
    static calcRoleLoc = function () {
        if (Core.roleMoveTimeLeft > -1) {
            // 正在移动
            Core.roleMoveTimeLeft--;
            let per = Core.roleMoveTimeLeft / Config_RoleMoveSpeed;
            Core.roleBox.x = Config_Cell * ((Role.pos.col - Role.newPos.col) * per + Role.newPos.col);
            Core.roleBox.y = Config_Cell * ((Role.pos.row - Role.newPos.row) * per + Role.newPos.row);
            if (Core.roleMoveTimeLeft <= 0) {
                // 移动完毕
                Role.pos.row = Role.newPos.row;
                Role.pos.col = Role.newPos.col;
                Core.roleBox.x = Role.pos.col * Config_Cell;
                Core.roleBox.y = Role.pos.row * Config_Cell;
                Global.Render_RoleMoving = false;
            }
        }
    };

    // 从spriteSheet中获取Sprite，找不到就返回undefined
    static getSprite = function (imgID) {
        if (imgID[0] === 'p') {
            imgID += ".png";
            if (Core.picSheet.textures[imgID] !== undefined) return new PIXI.Sprite(Core.picSheet.textures[imgID]);
        } else if (imgID[0] === 'g') {
            if (Core.gifSheet.animations[imgID] !== undefined) {
                let sp = new PIXI.AnimatedSprite(Core.gifSheet.animations[imgID]);
                sp.animationSpeed = Config_GifSpeed;
                sp.play();
                return sp;
            }
        }
        Core.log('[Err] image not found in tile.json and tile2.json: ' + imgID);
        return undefined;
    };

    // 游戏循环
    static loop = function (delta) {
        // 如果玩家正在移动，那么就继续移动
        if (Global.Render_RoleMoving === true) Core.calcRoleLoc();
        // 如果玩家没有移动，而且松开了点击，而且寻路还没结束，那么继续自动寻路
        else if (Global.clickUp === true) Core.autoMoveToNextPos();
    };

    // 统一关闭console.log
    static log(msg) {
        console.log(msg)
    }
}
