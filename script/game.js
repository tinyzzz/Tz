'use strict';

class Game {
    // 静态属性
    static jsList = ['pixi.min', 'gameConfig', 'gameData', 'utils', 'core'];
    static dom = {'body': document.body};

    // 游戏初始化
    static init() {
        Game.loadJS('script', Game.jsList, function () {
            console.log('全部JS文件加载完毕');
            Game.startGame();
        });
    }

    // 游戏初始化完毕
    static startGame() {
        console.log('AAA');
        Game.Core = Core;
        Game.Core.init();
    }

    // 按顺序加载所有JS文件
    static loadJS = function (dir, jsList, callback) {
        let jsNum = 0;
        for (let i = 0; i < jsList.length; i++) {
            Game.loadSingleJS(dir, jsList[i], function () {
                jsNum++;
                if (jsNum === jsList.length) callback();
            });
        }
    };

    // 加载单一JS文件
    static loadSingleJS = function (dir, jsName, callback) {
        let js = document.createElement('script');
        js.src = dir + '/' + jsName + '.js';
        Game.dom.body.appendChild(js);
        js.onload = function () {
            callback();
        };
    };
}

Game.init();
