Multi dimensional maze generation library. Uses the Kruskal maze generation algorithm.

Provides an object which can be initialized with an argument object, {x:10,y:10,z:5}, with 3 attributes:

x- the number of x axis nodes
y- the number of y axis nodes
z- the number of levels, vertically aligned

```js
var CubeMaze = require('cube-maze');

var maze = new CubeMaze({x:10,y:10,z:10});


