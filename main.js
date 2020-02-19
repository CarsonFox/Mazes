const canvas = document.getElementById('canvas-node');
const context = canvas.getContext('2d');
const canvas_size = 1024;
const fpsNode = document.getElementById("fps-node");
const frameTimes = [];
const timer = document.getElementById("timer");
const background = loadImage("background.webp");
const character = loadImage("keen.png");
const star = loadImage("star.png");

const directions = {
    north: 1,
    south: 2,
    east: 3,
    west: 4,
};

function gameloop(timestamp) {
    const elapsed = timestamp - last;
    last = timestamp;

    handleinput(elapsed);
    update(elapsed);
    render(elapsed);

    requestAnimationFrame(gameloop)
}

function handleinput(elapsed) {
}

function update(elapsed) {
    updateFrameTimes(elapsed);
    updateTimer(elapsed);
}

function render() {
    context.clearRect(0, 0, canvas_size, canvas_size);

    renderFPS();
    renderBackground();
    renderMaze();
    renderTimer();
    renderPath();
    renderCharacter();
}

function updateFrameTimes(elapsed) {
    frameTimes.push(elapsed);
    if (frameTimes.length > 30) {
        frameTimes.shift();
    }
}

function updateTimer(elapsed) {
    gameTime += elapsed;
}

function moveCharacter(d) {
    const [i, j] = characterPos;
    const currentCell = maze.cells[i][j];

    if (d === directions.east && currentCell.east !== null) {
        characterPos = [currentCell.east.i, currentCell.east.j];
        updatePath();
    } else if (d === directions.west && currentCell.west !== null) {
        characterPos = [currentCell.west.i, currentCell.west.j];
        updatePath();
    } else if (d === directions.north && currentCell.north !== null) {
        characterPos = [currentCell.north.i, currentCell.north.j];
        updatePath();
    } else if (d === directions.south && currentCell.south !== null) {
        characterPos = [currentCell.south.i, currentCell.south.j];
        updatePath();
    }
}

function updatePath() {
    for (let row of maze.cells)
        for (let c of row)
            c.visited = false;

    let [i, j] = characterPos;
    let begin = maze.cells[i][j];
    let end = maze.cells[maze.width - 1][maze.height - 1];
    let render = path.render;
    path = shortestPath(begin, end);
    path.render = render;
}

function renderPath() {
    if (!path.render)
        return;

    let [i, j] = characterPos;
    for (let c of path) {
        if (c.i !== i || c.j !== j)
            renderStar(c.i, c.j);
    }
}

function renderStar(i, j) {
    if (!star.ready)
        return;

    const width = canvas_size / maze.width;
    const height = canvas_size / maze.height;
    let x = i * width;
    let y = j * height;
    context.drawImage(star.image, x + 25, y + 25, width - 50, height - 50);
}

function renderCharacter() {
    if (!character.ready)
        return;

    let [x, y] = characterPos;
    const width = canvas_size / maze.width;
    const height = canvas_size / maze.height;
    x *= width;
    y *= height;
    context.drawImage(character.image, x + 10, y + 10, width - 20, height - 20);
}

function renderTimer() {
    timer.innerText = `Time: ${Math.round(gameTime / 1000)}`;
}

function renderFPS() {
    if (frameTimes.length === 0)
        return;
    const fps = 1000 / (frameTimes.reduce((a, b) => a + b) / frameTimes.length);
    fpsNode.innerText = Math.round(fps).toString();
}

function renderBackground() {
    if (background.ready)
        context.drawImage(background.image, 0, 0, canvas_size - 1, canvas_size - 1);
}

function renderMaze() {
    context.strokeStyle = 'rgb(255, 255, 255)';
    context.lineWidth = 6;

    for (let i = 0; i < maze.width; i++) {
        for (let j = 0; j < maze.height; j++) {
            renderCell(i, j);
        }
    }
}

function renderCell(i, j) {
    const cell = maze.cells[i][j];
    const wallWidth = canvas_size / maze.width;
    const wallHeight = canvas_size / maze.height;

    let x = i * wallWidth;
    let y = j * wallHeight;

    context.beginPath();

    if (cell.north === null) {
        context.moveTo(x, y);
        context.lineTo(x + wallWidth, y);
    }

    if (cell.south === null) {
        context.moveTo(x, y + wallHeight);
        context.lineTo(x + wallWidth, y + wallHeight);
    }

    if (cell.west === null) {
        context.moveTo(x, y);
        context.lineTo(x, y + wallHeight);
    }

    if (cell.east === null) {
        context.moveTo(x + wallWidth, y);
        context.lineTo(x + wallWidth, y + wallHeight);
    }

    context.closePath();
    context.stroke();
}

function loadImage(src) {
    const i = {
        image: new Image(),
        ready: false,
    };
    i.image.onload = function () {
        i.ready = true;
        console.log("Loaded " + src);
    };
    i.image.src = src;
    return i;
}

function shortestPath(a, b) {
    //mark a visited
    a.visited = true;

    //The shortest path from b to b is just b
    if (a.i === b.i && a.j === b.j)
        return [a];

    //Which neighbor is part of the shortest path?
    for (let c of connectedNeighbors(a)) {
        if (!c.visited) {
            let p = shortestPath(c, b);
            if (p !== null) {
                p.push(a);
                return p;
            }
        }
    }

    //This node isn't part of the shortest path if its neighbors aren't
    return null;
}

function connectedNeighbors(cell) {
    return [cell.north, cell.east, cell.south, cell.west].filter(c => c !== null);
}

function prim() {
    let walls = [];

    let i = getRandomInt(0, maze.width);
    let j = getRandomInt(0, maze.height);
    let cell = maze.cells[i][j];
    cell.inMaze = true;

    for (let n of neighbors(i, j))
        walls.push([cell, n]);

    while (walls.length > 0) {
        let rand = getRandomInt(0, walls.length);
        let wall = walls[rand];
        cell = unvisited(wall);

        if (cell !== null) {
            connect(wall);
            for (let n of neighbors(cell.i, cell.j))
                walls.push([cell, n]);
        }

        walls.splice(rand, 1);
    }
}

function connect(wall) {
    let [a, b] = wall;
    a.inMaze = b.inMaze = true;

    if (a.i > b.i) {
        a.west = b;
        b.east = a;
    } else if (a.i < b.i) {
        a.east = b;
        b.west = a;
    } else if (a.j > b.j) {
        a.north = b;
        b.south = a;
    } else {
        a.south = b;
        b.north = a;
    }
}

function unvisited(wall) {
    let [a, b] = wall;
    if (!a.inMaze)
        return a;
    if (!b.inMaze)
        return b;
    return null;
}

function neighbors(i, j) {
    let n = [];

    if (i > 0)
        n.push(maze.cells[i - 1][j]);
    if (j > 0)
        n.push(maze.cells[i][j - 1]);
    if (i + 1 < maze.width)
        n.push(maze.cells[i + 1][j]);
    if (j + 1 < maze.height)
        n.push(maze.cells[i][j + 1]);

    return n;
}

//Yoinked from the MDN page on Math.random()
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function Maze(width, height) {
    let cells = [];
    for (let i = 0; i < width; i++) {
        cells.push([]);
        for (let j = 0; j < height; j++) {
            cells[i].push(Cell(i, j));
        }
    }
    return {
        width: width,
        height: height,
        cells: cells,
    };
}

function Cell(i, j) {
    return {
        inMaze: false,
        visited: false,
        i: i,
        j: j,
        north: null,
        east: null,
        south: null,
        west: null,
    };
}

canvas.width = canvas_size;
canvas.height = canvas_size;

let maze = Maze(5, 5);
prim();

let path = shortestPath(maze.cells[0][0], maze.cells[maze.width - 1][maze.height - 1]);
path.render = false;

let last = performance.now();
let gameTime = 0;

let characterPos = [0, 0];

requestAnimationFrame(gameloop);
