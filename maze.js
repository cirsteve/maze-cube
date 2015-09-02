var _ = require('lodash');

var CubedMaze = function (options) {
    this.options=options || {x:4,y:5,z:3};
    this.y= this.options.y;
    this.x= this.options.x;
    this.z= this.options.z;
    this.nodeSize = this.options.nodeSize || 40;
    this.created = new Date();
    this.sets= [];

    this.createMaze();

    return this;
};

CubedMaze.prototype.initNodes= function () {
//create nodes with the formation [x,y,z]
    var y = 0,
        x = 0,
        z = 0,
        nodes = [];
    for (z;z < this.z;z++) {
        nodes.push([]);
        x = 0;
        y = 0;
        for (x;x < this.x;x++) {
            nodes[z].push([]);
            y = 0;
            for (y;y < this.y;y++) {
                nodes[z][x].push({
                        x:x,
                        y:y,
                        z:z});
            }
        }
    }

    return nodes;
};

CubedMaze.prototype.initWalls= function () {
//create walls with the following per level format
//[[x],[y],[z]]
    var y = 0,
        x = 0,
        z = 0,
        walls = [],
        zArray = [[],[],[]],
        xWalls, yWalls, zWalls;
    for (z;z < this.z;z++) {
        x = 0;
        y = 0;
        zArray = [[],[],[]];
        walls.push(zArray);
        for (x;x < this.x;x++) {
            y = 0;
            xWalls = [];
            yWalls = [];
            zWalls = [];
            zArray[0].push(xWalls);
            zArray[1].push(yWalls);
            zArray[2].push(zWalls);
            for (y;y < this.y;y++) {
                if (x < this.x -1) {
                    xWalls.push({
                        x:x,
                        y:y,
                        z:z,
                        dim:'x',
                        exists:true
                    });
                }
                if (y < this.y - 1) {
                    yWalls.push({
                        x:x,
                        y:y,
                        z:z,
                        dim:'y',
                        exists:true
                    });
                }
                if (z < this.z - 1) {
                    zWalls.push({
                        x:x,
                        y:y,
                        z:z,
                        dim:'z',
                        exists:true
                        });
                }
            }
        }
    }

    return walls;
};

CubedMaze.prototype.applyKruskal= function () {
    var rWall = null,
        randWallIndex = null,
        checkedWalls = [],
        flatWalls = [],
        nodeCount = this.y * this.x * this.z,
        length = this.walls.length,
        i,t, w;

    flatWalls = _.flatten(this.walls);
    do  {
        randWallIndex = Math.floor(
                            Math.random()*flatWalls.length);
        rWall = flatWalls.splice(randWallIndex,1)[0];
        checkedWalls.push(rWall);
        this.setWall(rWall);
    } while (this.sets[0].length !== nodeCount)

    return this;

};

CubedMaze.prototype.createMaze = function () {
    this.nodes = this.initNodes();
    this.walls = this.initWalls();
    this.applyKruskal();
    return this;
};

CubedMaze.prototype.evaluateMove = function (start, end) {
    var wall = {exists:true};
    var startX = start[0];
    var startY = start[1];
    var startZ = start[2];
    var endX = end[0];
    var endY = end[1];
    var endZ = end[2];
    //its a lateral move so check an x axis wall
    if (startX !== endX) {
        //if the end node is -1 or one less then the totoal
        //x nodes return false because its a border
        if (endX === -1 || endX === this.x) {
            return wall;
        }
        if (startX < endX) {
            wall = this.walls[startZ][0][startX][startY];
        } else {
            wall = this.walls[startZ][0][endX][startY];
        }
    } else if (startY !== endY) {
        if (endY === -1 || endY === this.y) {
            return wall;
        }
        if (startY < endY) {
            wall = this.walls[startZ][1][startX][startY];
        } else {
            wall = this.walls[startZ][1][startX][endY];
        }
    } else {
        if (endZ === -1 || endZ === this.z) {
            return wall;
        }
        if (startZ < endZ) {
            wall = this.walls[startZ][2][startX][startY];
        } else {
            wall = this.walls[endZ][2][startX][startY];
        }
    }
    return wall.exists;
};

CubedMaze.prototype.getAdjacentNodes= function (wall) {
    if (wall.dim === 'z') {
        //wall.dim:0 denotes a z dimension wall
        //return adjacent nodes are above and below
        return [
                this.nodes[wall.z][wall.x][wall.y],
                this.nodes[wall.z+1][wall.x][wall.y]
                ];
    } else if (wall.dim === 'x') {
        //wall.dim:1 denotes a x dimension wall
        //return adjacent nodes are side by side
        return [
                this.nodes[wall.z][wall.x][wall.y],
                this.nodes[wall.z][wall.x+1][wall.y]
                ];
    } else if (wall.dim === 'y') {
        //wall.dim:2 denotes a y dimension wall
        //return adjacent nodes are top and bottom
        return [
                this.nodes[wall.z][wall.x][wall.y],
                this.nodes[wall.z][wall.x][wall.y+1]
                ];
    }

};

CubedMaze.prototype.getNodeSet= function (node) {
    var i = 0,
        t = 0,
        setsLength = this.sets.length,
        setLength = null,
        testSet = null,
        testNode = null;

    for (i;i<setsLength;i++) {
        testSet = this.sets[i];
        setLength = testSet.length;
        for (t = 0;t<setLength;t++) {
            testNode = testSet[t];
            if (node.x === testNode.x &&
                node.y === testNode.y &&
                node.z === testNode.z) {
                return i;
            }
        }
    }

    return null;
};

CubedMaze.prototype.setWall = function (wall) {
    //set the wall to exists based on its
    //adjacent nodes
    var nodes = this.getAdjacentNodes(wall);

    var set0 = this.getNodeSet(nodes[0]),
        set1 = this.getNodeSet(nodes[1]);

    if (set0 === set1 && set0 === null ) {
        wall.exists = false;
        this.sets.push(nodes);
    } else if (set0 === set1) {
       wall.exists = true;
    } else if (set0 === null && (set1 === 0 || set1)) {
        wall.exists = false;
        this.sets[set1].push(nodes[0])
    } else if (set1 === null && (set0 === 0 || set0)) {
        wall.exists = false;
        this.sets[set0].push(nodes[1])
    } else {
        wall.exists = false;
        this.sets[set0] = this.sets[set0].concat(this.sets[set1]);
        this.sets.splice(set1,1);
    }

    return wall;
};

module.exports = CubedMaze;
