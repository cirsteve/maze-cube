var _ = require('lodash');

var CubedMaze = function (options) {
    this.options= options || {x:4,y:5,z:3};
    this.y= this.options.y;
    this.x= this.options.x;
    this.z= this.options.z;
    this.created = new Date();
    this.sets= [];

    this.createMaze();

    return this;
};

CubedMaze.prototype.initNodes= function () {
//create nodes with the formation [x,y,z]
    var z = 0;
    var nodes = [];
    var x,y;
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
    var z = 0;
    var walls = [];
    var zArray, xWalls, yWalls, zWalls, x, y;
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
    var rWall = null;
    var randWallIndex = null;
    var checkedWalls = [];
    var flatWalls = [];
    var nodeCount = this.y * this.x * this.z;
    var length = this.walls.length;
    var i,t, w;

    flatWalls = _.flattenDeep(this.walls);
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
    var i = 0;
    var t = 0;
    var setsLength = this.sets.length;
    var setLength = null;
    var testSet = null;
    var testNode = null;

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

CubedMaze.prototype.wallObjsToStrings = function () {
    //return a more efficient string based represenation of the maze walls instead of the object representation
    //of the form [x, y, z] for each level, a '0' char indicates no wall and '1' indicatina a wall progressing over the y axis
    //eg['010', '101', '110']
    return this.walls.map(
        level=>level.map(
            dim=>dim.map(
                col=>col.map(
                    wall=>wall.exists ? '1' : '0').join('')
                )
            )
        );
};


function* getNeighbors(n) {
    var west = p => {
        var n = p.slice();
        n[0] -= 1;
        return n;
    };
    var east = p => {
        var n = p.slice();
        n[0] += 1;
        return n;
    };
    var north = p => {
        var n = p.slice();
        n[1] += 1;
        return n;
    };
    var south = p => {
        var n = p.slice();
        n[1] -= 1;
        return n;
    };
    var up = p => {
        var n = p.slice();
        n[2] += 1;
        return n;
    };
    var down = p => {
        var n = p.slice();
        n[2] -= 1;
        return n;
    };
    var i = 0;
    var progression = [north, east, down, south, west, up];
    var nextNode;
    while (i<progression.length) {
        nextNode = progression[i++](n);
        yield nextNode;
    }
    yield false;
};

function outOfBound(walls, node) {
    return node[2] > walls.length -1 ||
        node[0] > walls[0][0][0].length ||
        node[1] > walls[0][1][0].length;
}
function pad(a) {
    while(a.length<3) {
        a.unshift(0);
    }
    return a;
}

var BOUNDARY_MAP = {
    //check current position x wall
    '322':'west',
    //check current position y wall
    '232':'north',
    //check current position z wall
    '223':'down',
    //check position east x wall
    '122':'east',
    //check position south y wall
    '212':'south',
    //check position level up z wall
    '221':'up'
}

var prepProposed = function (proposed) {
    return pad(proposed).filter(d=>d>=0);
};

var testProposed = function (walls, proposed) {
    if (proposed.length !== 3 || outOfBound(walls, proposed)) {
        return false;
    }
    return true;
}

var getDelta = function(current, proposed) {
    return _.map(_.zip(current, proposed), p=>p[1]-p[0]+2).join('');
};

var getBoundary = function(current, proposed) {
    return BOUNDARY_MAP[getDelta(current, proposed)];
};

function evaluateMove (walls, current, proposed) {
    //takes an an array of wall arrays [[level][column][row]] and start node and end node of the form [x, y, z]
    //returns true if no wall or boundary separates the two nodes and the move is permitted else return false
    var moveMap = {
        //check current position x wall
        'west':()=>walls[current[2]][0][current[0]][current[1]],
        //check current position y wall
        'north':()=>walls[current[2]][1][current[0]][current[1]],
        //check current position z wall
        'down':()=>walls[current[2]][2][current[0]][current[1]],
        //check position east x wall
        'east':()=>walls[current[2]][0][current[0]-1] && walls[current[2]][0][current[0]-1][current[1]],
        //check position south y wall
        'south':()=>walls[current[2]][1][current[0]] && walls[current[2]][1][current[0]][current[1]-1],
        //check position level up z wall
        'up':()=>walls[current[2]-1] && walls[current[2]-1][2][current[0]][current[1]]
    }

    proposed = prepProposed(proposed);
    if (!testProposed(walls, proposed)) {
        return false
    }
    var delta = getDelta(current, proposed);
    return moveMap[BOUNDARY_MAP[delta]]() === '0';
}

var freshNode = function (walls, node, prevNode, record) {
    //add untracked node to record map
    //return its first neighbor or false if no valid neighbors exists
    var nodeStr = node.join('');
    var neighbors = getNeighbors(node);
    var neighbor = false;
    var test = null;
    var moves = 6;
    var sameNode = 1;
    for (var i = 0; i<moves;i++) {
        test = neighbors.next().value;
        sameNode = parseInt(prevNode.join(''), 10) - parseInt(test.join(''), 10);
        if (sameNode !== 0 && evaluateMove(walls, node, test)) {
            record[nodeStr] = neighbors;
            return test
        }
    }
    record[nodeStr] = 'deadEnd'
    return false;
};


var atGoal = function (current, goal) {
    return parseInt(current.join('')) - parseInt(goal.join('')) === 0;
};


function getPath (walls, start, goal) {
    //perform DFS of maze and return a path of nodes
    var path = [start];
    var record = {};
    var nextNode, ultimate, ultimateStr, validMove, prevNode, sameNode, evalMove;


    do {
        ultimate = path[0];
        ultimateStr = ultimate.join('');
        if (!record[ultimateStr]) {

            //if ultimate node in path is unvisited add it
            prevNode = path[1] || [1,1,1,1];
            validMove = freshNode(walls, ultimate,prevNode, record);
            //if there are no valid moves from a node it is a dead end
            //remove it from the path
            if (validMove === false) {
                var de = path.shift();
            } else {
                path.unshift(validMove);
            }
        } else {
            do {

            //get the next value for the ultimate node in path
                nextNode = record[ultimateStr].next().value;
                sameNode = nextNode && path[1] ?
                    parseInt(path[1].join(''), 10) - parseInt(nextNode.join(''), 10) : 1;

            //iterate through neighbors until valid move is discovered
        } while(nextNode && !evaluateMove(walls, ultimate, nextNode)|| sameNode === 0 )
            //if node exists add it to path
            if (nextNode) {
                path.unshift(nextNode);

            //else remove ultimate node as dead end
            } else {
                path.shift()
            }
        }
    } while (!atGoal(path[0], goal))
    return path;
};

module.exports = {
    Maze:CubedMaze,
    evaluate: evaluateMove,
    path: getPath,
    getBoundary: getBoundary,
    padPosition: pad};
