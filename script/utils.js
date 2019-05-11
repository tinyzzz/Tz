'use strict';

// 坐标类
class Pos {
    constructor(level, layer, row, col) {
        this.level = level;
        this.layer = layer;
        this.row = row;
        this.col = col;
    };

    toString() {
        return this.row + '#' + this.col;
    };
}

// 工具类
class Utils {
    // 从 edNode 反向寻路
    static findPath(stNode, edNode) {
        // console.log('正在寻路中，起点：' + edNode.toString() + ' 终点 ' + stNode.toString());
        let queue = [stNode];
        let visited = new Map();
        let comeFrom = new Map();
        visited.set(stNode.toString(), true);
        while (queue.length > 0) {
            let curNode = queue.shift();
            let neighbors = Utils.getRawNeighbors(curNode);
            for (let neiNode of neighbors) {
                // 不管终点有没有障碍物，都是可以到达的。方便玩家直接点击怪物打怪，直接点击开门。否则只能点击怪前面的一个格子才能自动寻路。
                if (MapData.isEmptyByPos(neiNode) || neiNode.toString() === edNode.toString()) {
                    if (visited.has(neiNode.toString()) === false) {
                        queue.push(neiNode);
                        visited.set(neiNode.toString(), true);
                        comeFrom.set(neiNode.toString(), curNode);
                    }
                    if (neiNode.toString() === edNode.toString()) {
                        queue = [];
                        break;
                    }
                }
            }
        }
        let way = [];
        let cNode = comeFrom.get(edNode.toString());
        if (cNode === undefined) {
            // console.log('寻路失败，路径不存在！');
        } else {
            way.push(edNode);
            while (cNode.toString() !== stNode.toString()) {
                way.push(cNode);
                cNode = comeFrom.get(cNode.toString());
            }
            way = way.reverse();
            // let str = '寻路成功，正在输出寻路路径：';
            // for (let i = 0; i < way.length; i++) {
            //     str = str + " -> " + way[i].toString();
            // }
            // console.log(str);
        }
        return way;
    };

    // 获取四周节点，只判断四周是否还在地图内部
    static getRawNeighbors(node) {
        let r = [];
        if (node.row > 0) r.push(new Pos(node.level, 0, node.row - 1, node.col));
        if (node.col > 0) r.push(new Pos(node.level, 0, node.row, node.col - 1));
        if (node.row < Config_MaxRow - 1) r.push(new Pos(node.level, 0, node.row + 1, node.col));
        if (node.col < Config_MaxCol - 1) r.push(new Pos(node.level, 0, node.row, node.col + 1));
        return r;
    };
}
