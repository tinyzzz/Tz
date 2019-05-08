'use strict';

class Pos {
    constructor(level, layer, row, col) {
        this.level = level;
        this.layer = layer;
        this.row = row;
        this.col = col;
    }


    toString() {
        return this.row + '#' + this.col;
    }

    toStringAll() {
        return this.level + '#' + this.layer + '#' + this.row + '#' + this.col;
    }
}

class Utils {
    // 寻路
    static findPath(map, srcR, srcC, dstR, dstC) {
        let stNode = new Pos(0, 0, srcR, srcC);
        let edNode = new Pos(0, 0, dstR, dstC);
        let queue = [stNode];
        let visited = new Map();
        let comeFrom = new Map();
        visited.set(stNode, true);
        while (queue.length > 0) {
            let curNode = queue.shift();
            let neighbors = Utils.getNeighbors(map, curNode);
            for (let neiNode of neighbors) {
                if (visited.has(neiNode) === false) {
                    queue.push(neiNode);
                    visited.set(neiNode, true);
                    comeFrom.set(neiNode, curNode);
                }
                if (neiNode.toString() === edNode.toString()) {
                    queue = [];
                    break;
                }
            }
        }
        let way = [];
        let cNode = edNode;
        while (cNode !== undefined && cNode.toString() !== stNode.toString()) {
            way.push(cNode);
            cNode = comeFrom.get(cNode);
        }
        if (way.length === 1) way = [];  // 只有edNode 代表路径不存在
        if (way.length > 1) way.push(stNode); //
        return way;
    }

    static getNeighbors(map, node) {
        let r = [];
        let neiNodes = [
            new Pos(0, 0, node.row - 1, node.col),
            new Pos(0, 0, node.row + 1, node.col),
            new Pos(0, 0, node.row, node.col - 1),
            new Pos(0, 0, node.row, node.col + 1)
        ];
        for (const neiNode of neiNodes) {
            if (Utils.isPosInMap(map, neiNode)) {
                if (Utils.isEmptyPos(map, neiNode)) r.push(neiNode);
            }
        }
        return r;
    };

    static isPosInMap(map, pos) {
        return (pos.row >= 0 && pos.col >= 0 && pos.row < Config.Map_MaxRow && pos.col < Config.Map_MaxCol);
    };

    static isEmptyPos(map, pos) {
        //Todo
        return true;
    }
}
