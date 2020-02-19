const canvas = document.getElementById('canvas-node');
const context = canvas.getContext('2d');
const canvas_size = 1024;
const fpsNode = document.getElementById("fps-node");
const frameTimes = [];

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
}

function render(elapsed) {
    context.clearRect(0, 0, canvas_size, canvas_size);

    renderFPS();
    renderMaze();
}

function updateFrameTimes(elapsed) {
    frameTimes.push(elapsed);
    if (frameTimes.length > 30) {
        frameTimes.shift();
    }
}

function renderFPS() {
    if (frameTimes.length === 0)
        return;
    const fps = 1000 / (frameTimes.reduce((a, b) => a + b) / frameTimes.length);
    fpsNode.innerText = Math.round(fps).toString();
}

function renderMaze() {
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

function Maze(width, height) {
    let cells = [];
    for (let i = 0; i < width; i++) {
        cells.push([]);
        for (let j = 0; j < height; j++) {
            cells[i].push(Cell());
        }
    }
    return {
        width: width,
        height: height,
        cells: cells,
    };
}

function Cell() {
    return {
        north: null,
        east: null,
        south: null,
        west: null,
    };
}

canvas.width = canvas_size;
canvas.height = canvas_size;
let maze = Maze(5, 5);
let last = performance.now();

requestAnimationFrame(gameloop);