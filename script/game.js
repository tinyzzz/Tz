'use strict';
// 游戏初始化 -- 开始加载JS文件
let Game = {};

// 游戏初始化
Game.init = function () {
    Game.jsList = ['pixi.min', 'gameConfig', 'gameData', 'utils', 'core'];
    Game.dom = {'body': document.body};
    Game.loadJS('script', Game.jsList, function () {
        console.log('全部JS文件加载完毕');
        Game.startGame();
    });
};

// 游戏初始化结束
Game.startGame = function () {
    Game.Core = Core;
    Game.Core.init();
};

// 批量加载JS文件
Game.loadJS = function (dir, jsList, callback) {
    let jsNum = 0;
    for (let i = 0; i < jsList.length; i++) {
        Game.loadSingleJS(dir, jsList[i], function () {
            jsNum++;
            if (jsNum === jsList.length) callback();
        });
    }
};

// 加载单一JS文件
Game.loadSingleJS = function (dir, jsName, callback) {
    let js = document.createElement('script');
    js.type = 'text/javascript';
    js.src = dir + '/' + jsName + '.js';
    js.rel = 'script';
    document.body.appendChild(js);
    js.onload = function () {
        callback();
    };
};

Game.init();
