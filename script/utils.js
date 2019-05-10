'use strict';

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

class Utils {
    // 寻路
    static findPath(stNode, edNode) {
        console.log('正在寻路中，起点：' + edNode.toString() + ' 终点 ' + stNode.toString());
        let queue = [stNode];
        let visited = new Map();
        let comeFrom = new Map();
        visited.set(stNode.toString(), true);
        while (queue.length > 0) {
            let curNode = queue.shift();
            let neighbors = Utils.getNeighbors(curNode);
            for (let neiNode of neighbors) {
                if (visited.has(neiNode.toString()) === false) {
                    queue.push(neiNode);
                    visited.set(neiNode.toString(), true);
                    comeFrom.set(neiNode.toString(), curNode.toString());
                }
                if (neiNode.toString() === edNode.toString()) {
                    queue = [];
                    break;
                }
            }
        }
        let way = [];
        let cNode = comeFrom.get(edNode.toString());
        if (cNode === undefined) {
            console.log('寻路失败，路径不存在！');
        } else {
            while (cNode.toString() !== stNode.toString()) {
                way.push(cNode);
                cNode = comeFrom.get(cNode.toString());
            }
            way.push(stNode);
            // 因为传入参数时已经把 stNode 和 edNode 对调了，所以不需要再次 reverse 一次
            // way = way.reverse();
            let str = '寻路成功，正在输出寻路路径：';
            for (let i = 0; i < way.length; i++) {
                str = str + " -> " + way[i].toString();
            }
            console.log(str);
        }
        return way;
    };

    static getNeighbors(node) {
        let r = [];
        let neiNodes = [
            new Pos(node.level, 0, node.row - 1, node.col),
            new Pos(node.level, 0, node.row + 1, node.col),
            new Pos(node.level, 0, node.row, node.col - 1),
            new Pos(node.level, 0, node.row, node.col + 1)
        ];
        for (const neiNode of neiNodes) {
            if (Utils.isPosLegal(neiNode)) if (MapData.isEmptyByPos(neiNode)) r.push(neiNode);
        }
        return r;
    };

    static isPosLegal(pos) {
        return (pos.row >= 0 && pos.col >= 0 && pos.row < Config.Map_MaxRow && pos.col < Config.Map_MaxCol);
    };
}
