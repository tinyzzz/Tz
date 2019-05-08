'use strict';

class Core {
    // 全局变量
    static bg = {};       //所有图片资源 - 包括背景等等
    static picSheet = {};  //所有pic图片json - 仅限32x32大小
    static gifSheet = {};  //所有gif图片json - 仅限32x32大小
    static manSheet = {};  //所有人物图片json - 仅限32x32大小
    static mapBox = {};    //地图渲染区域
    static roleBox = {};   //玩家渲染区域


    // 渲染变量
    static app = {};
    static roleMoveTimeLeft = 0;
    static roleGoRight = 0;
    static roleGoDown = 0;

    static  init = function () {
        PIXI.utils.skipHello();
        Core.app = new PIXI.Application({
            width: Config.View_Width,
            height: Config.View_Height,
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
        let resLoader = PIXI.Loader.shared;

        // 图片资源初始化
        Core.bg = new PIXI.Sprite(resLoader.resources['image/bg.png'].texture);
        Core.picSheet = resLoader.resources['image/tile.json'].spritesheet;
        Core.gifSheet = resLoader.resources['image/tile2.json'].spritesheet;
        Core.manSheet = resLoader.resources['image/tile3.json'].spritesheet;

        // 加载背景
        Core.app.stage.addChild(Core.bg);

        // 加载地图mapBox
        Core.mapBox = new PIXI.Container();
        Core.mapBox.x = Config.Render_MapX;
        Core.mapBox.y = Config.Render_MapY;
        Core.mapBox.interactive = true;
        Core.mapBox.hitArea = new PIXI.Rectangle(0, 0, Config.Map_MaxCol * Config.Map_Cell, Config.Map_MaxRow * Config.Map_Cell);
        Core.mapBox.on('pointerdown', Core.onTouchMapBox);
        Core.mapBox.on('pointerup', Core.onTouchMapBoxUp);
        Core.mapBox.on('pointerupoutside', Core.onTouchMapBoxUp);
        Core.app.stage.addChild(Core.mapBox);

        // 开始渲染地图
        Core.renderMap();
        Core.renderRole();
        Core.app.ticker.add(delta => Core.loop(delta));
    };

    // 处理mapBox点击事件
    static  onTouchMapBox = function (event) {
        if (!Config.Render_RoleMoving) {
            Config.ClickRow = parseInt(event.data.getLocalPosition(this).y / Config.Map_Cell);
            Config.ClickCol = parseInt(event.data.getLocalPosition(this).x / Config.Map_Cell);
            //let hitPos = MapData.getData(Role.pos.level, Config.ClickRow, Config.ClickCol);
            //log('now hit on : R' + Config.ClickRow + "C" + Config.ClickCol + ' ' + hitPos[0] + ' ' + hitPos[1] + ' ' + hitPos[2]);
            let a1 = Config.ClickRow + Config.ClickCol - Role.pos.row - Role.pos.col;
            let a2 = Config.ClickRow - Config.ClickCol - Role.pos.row + Role.pos.col;
            if (a1 === 0 && a2 === 0) return;
            if (a1 <= 0 && a2 <= 0) Config.Order = 'W';
            if (a1 <= 0 && a2 > 0) Config.Order = 'A';
            if (a1 > 0 && a2 > 0) Config.Order = 'S';
            if (a1 > 0 && a2 <= 0) Config.Order = 'D';
        }
    };

    // 手指抬起时停止下达指令
    static  onTouchMapBoxUp = function () {
        Config.Order = '';
    };

    // 在mapBox中渲染游戏地图
    static renderMap = function () {
        let level = 0;
        let mapPos;
        let mapVal;
        let imgID;
        let tmpSp;
        for (let layer = 0; layer < Config.Map_MaxLayer; layer++) {
            for (let row = 0; row < Config.Map_MaxRow; row++) {
                for (let col = 0; col < Config.Map_MaxCol; col++) {
                    mapPos = row * Config.Map_MaxCol + col;
                    mapVal = MapData[level].map[layer][mapPos];
                    if (mapVal > 0) {
                        if (layer === 0) imgID = TerrainData[mapVal].imgID;
                        if (layer === 1) imgID = ItemData[mapVal].imgID;
                        if (layer === 2) imgID = MonsterData[mapVal].imgID;
                        if (imgID !== undefined) {
                            tmpSp = Core.getSprite(imgID);
                            if (tmpSp !== undefined) {
                                tmpSp.x = col * Config.Map_Cell;
                                tmpSp.y = row * Config.Map_Cell;
                                Core.mapBox.addChild(tmpSp);
                            }
                        }
                    }
                }
            }
        }
        // Todo
    };

    // 在mapBox中渲染游戏角色
    static renderRole = function () {
        Core.roleBox = new PIXI.AnimatedSprite(Core.manSheet.animations['m' + Config.Render_RoleFacing]);
        Core.roleBox.x = Role.pos.col * Config.Map_Cell;
        Core.roleBox.y = Role.pos.row * Config.Map_Cell;
        if (Core.roleBox.parent !== Core.mapBox) {
            Core.mapBox.addChild(Core.roleBox);
            Core.roleBox.animationSpeed = Config.Render_GifSpeed;
            Core.roleBox.play();
            Core.log('init role -- >>> ');
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
                sp.animationSpeed = Config.Render_GifSpeed;
                sp.play();
                return sp;
            }
        }
        Core.log('[Err] image not found in tile.json and tile2.json: ' + imgID);
        return undefined;
    };

    // 游戏循环
    static loop = function (delta) {
        if (Config.Render_RoleMoving === true) {
            if (Core.roleMoveTimeLeft > -1) {
                // 正在移动
                Core.roleMoveTimeLeft--;
                let per = Core.roleMoveTimeLeft / Config.Render_RoleMoveTime;
                Core.roleBox.x = Config.Map_Cell * ((Role.pos.col - Role.newPos.col) * per + Role.newPos.col);
                Core.roleBox.y = Config.Map_Cell * ((Role.pos.row - Role.newPos.row) * per + Role.newPos.row);
                if (Core.roleMoveTimeLeft <= 0) {
                    // 移动完毕
                    Role.pos.row = Role.newPos.row;
                    Role.pos.col = Role.newPos.col;
                    Core.roleBox.x = Role.pos.col * Config.Map_Cell;
                    Core.roleBox.y = Role.pos.row * Config.Map_Cell;
                    Config.Render_RoleMoving = false;
                    Core.log(' Finish !' + Config.Order);
                    //Config.Order = '';
                }
            }
        } else if (Config.Order !== '') {
            Core.log('Doing order !' + Config.Order);
            if (Config.Order === 'W') Core.goWalk(0, -1);
            if (Config.Order === 'A') Core.goWalk(-1, 0);
            if (Config.Order === 'S') Core.goWalk(0, 1);
            if (Config.Order === 'D') Core.goWalk(1, 0);
            //Config.Order = '';
        }
    };

    static goWalk(goRight, goDown) {
        Core.roleGoRight = goRight;
        Core.roleGoDown = goDown;
        Role.newPos.row = Role.pos.row + goDown;
        Role.newPos.col = Role.pos.col + goRight;
        Config.Render_RoleMoving = true;
        Core.roleMoveTimeLeft = Config.Render_RoleMoveTime;
    }


    // 统一关闭console.log
    static log(msg) {
        console.log(msg)
    }
}



