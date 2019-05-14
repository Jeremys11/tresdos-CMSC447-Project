/* Property of Team Tres-Dos
** This File controls the logic for Conway's Game of Life and manipulates GUI elements **
*/




//Minimum & Maximum User-Allowable Size (in Pixels Squared) of a Individual Cell
const MIN_DIM = 9;
const MAX_DIM = 100;

const CELL_GRID_ID = "cell-grid" //id-name of graphic cell
const RESIZE_TIME_DELAY = 50; //delay time (in milliseconds) the program should wait before rendering new grid after resize ends
var CELL_DIMENSION = 40; //20 X 20 PIXEL SQUARE
var PADDING = 10;

var ROUND_NUM = 0;
var cellGrid = []; //2-D array that hollds all cell objects in game "abstraction of game"


var COLORS = ["rgba(177, 177, 177, 1)", "rgba(0,153,255, 1)", "rgba(10, 10, 10, 1)", "rgba(255, 204, 153, 1)", "rgb(78, 140, 167)"]; // [DEAD, ALIVE, FIXED-DEAD, FIXED-ALIVE, GRIDLINES] for GUI
var MAIN_BACKGROUND_COLOR = "rgb(236, 208, 208)"



var playState = false; //is game played or paused
var tick_freq = 10 //speed of game (in milliseconds)



var numAlive = 0;
var numDead = 0;
var numFixedAlive = 0;
var numFixedDead = 0;



const mainPanel = document.getElementById('main');
const canvasGrid = document.getElementById(CELL_GRID_ID);
const context = canvasGrid.getContext('2d');


var topPadding = CELL_DIMENSION; //topPadding between grid's first row and the canvas
var leftPadding = CELL_DIMENSION; //leftPadding between grid's first column and the canvas



mainPanel.style.backgroundColor = MAIN_BACKGROUND_COLOR; //assign background color for main panel in GUI


//Emily's color updating function
function updateDead(picker) {
    var newColor = picker.toRGBString();
    COLORS[0] = newColor;
    world.resize(CELL_DIMENSION);
}

function updateAlive(picker) {
    var newColor = picker.toRGBString();
    COLORS[1] = newColor;
    world.resize(CELL_DIMENSION);
}

function updateFDead(picker) {
    var newColor = picker.toRGBString();
    COLORS[2] = newColor;
    world.resize(CELL_DIMENSION);
}

function updateFAlive(picker) {
    var newColor = picker.toRGBString();
    COLORS[3] = newColor;
    world.resize(CELL_DIMENSION);
}

function updateBackground(picker) {
    var newColor = picker.toRGBString();
    COLORS[4] = newColor;
    mainPanel.style.backgroundColor = newColor;
}


const squareMap = {}; //holds map of imagedata of already rendered squares for performance boost


/*
@function       createSquareImageData
@description    Returns image data of requested square (size/color)

@param1         red-value (0-255)
@param2         green-value (0-255)
@param3         blue-value (0-255) 
@param4         size of square (in pixels squared)
@param5         opacity of square (0-1)

@returns        image-data object of desired square
*/
function createSquareImageData(r, g, b, s, opacity) {
    if (opacity === undefined) opacity = 255;
    var req = r + "," + g + "," + b + "," + s + "," + opacity;
    if (!squareMap[req]) {
        var imgData = context.createImageData(s, s);
        var len = imgData.data.length;
        for (var i = 0; i < len; i += 4) {
            imgData.data[i + 0] = r;
            imgData.data[i + 1] = g;
            imgData.data[i + 2] = b;
            imgData.data[i + 3] = opacity;
        }
        squareMap[req] = imgData;
    }
    return squareMap[req];
}

/*
@function       addSquareToCanvas
@description    adds a square (cell) to the graphic interface

@param1         y-coordinate of cell location in grid
@param2         x-coordinate of cell locaiton in grid
@param3         the rgb value of the square
@param4         the opacity of the square

@returns        NONE
*/
function addSquareToCanvas(y, x, rgbColor, opacity) {
    rgbColor = stringToRGB(rgbColor);
    const square = createSquareImageData(rgbColor[0], rgbColor[1], rgbColor[2], CELL_DIMENSION, opacity);
    context.putImageData(square, leftPadding + (x * CELL_DIMENSION) + x, topPadding + (y * CELL_DIMENSION) + y);
}


/*
@function       stringToRGB
@description    this returns an rgb array [r, g, b, opacity]

@param          string of RGBcolor

@returns        rbg color array
*/
function stringToRGB(color) {
    color = color.substring(color.indexOf('(') + 1, color.indexOf(')'));
    color = color.split(',');
    return color;
}



var curHov = false; //cell currently being hovered over by cursor. If no cell is hovered over then = false
const HIGHLIGHT_OPACITY = 102; //hex-value of desired opacity for hovering

/*
@function       onCellHover
@description    Manges the event in which the grid is being hovered over

@param          event

@returns        NONE
*/
function onCellHover(e) {
    const mousePos = { //cursor position of cell relative to canvas
        x: e.clientX - mainPanel.offsetLeft,
        y: e.clientY - mainPanel.offsetTop
    };

    var x = Math.floor((mousePos.x - leftPadding) / CELL_DIMENSION);
    var y = Math.floor((mousePos.y - topPadding) / CELL_DIMENSION);

    if (curHov !== false && curHov[0] === y && curHov[1] === x) {
        return;
    } //nothing
    offCellHover();
    if (isCellInBounds(y, x) === true) {
        curHov = [y, x];
        addSquareToCanvas(y, x, cellGrid[y][x].getColor(), HIGHLIGHT_OPACITY)
    }
    else curHov = false;
}

/*
@function       offCellHover
@description    Is called when cell is no longer being hovered over and manages event
*/
function offCellHover() {
    if (curHov !== false) clearSquare(curHov[0], curHov[1]);
    curHov = false;
}

/* 
@function       clearSquare
@description    clears the desired squares image data for later rerendering

@param1         the y-coordinate of the cell in the grid
@param2         the x-coordinate of the cell in the grid

@returns        NONE    
*/
function clearSquare(y, x) {
    context.beginPath();
    context.clearRect(leftPadding + (x * CELL_DIMENSION) + x, topPadding + (y * CELL_DIMENSION) + y, CELL_DIMENSION, CELL_DIMENSION);
    cellGrid[y][x].updateAppearance();
}


/*
@function       onCellClick
@description    Manages the event in which the grid (and potentially) a cell is clicked on

@param          event

@returns        NONE
*/
function onCellClick(e) {
    const mousePos = {
        x: e.clientX - mainPanel.offsetLeft,
        y: e.clientY - mainPanel.offsetTop
    };
    var x = Math.floor((mousePos.x - leftPadding) / CELL_DIMENSION);
    var y = Math.floor((mousePos.y - topPadding) / CELL_DIMENSION);
    var val = document.getElementById('colorSelBox').value;
    var cell = cellGrid[y][x];
    if (val === 'a') { // alive & NOT fixed
        cell.isAlive = true;
        cell.isFixed = false;
    }
    if (val === "b") { // dead & NOT fixed
        cell.isAlive = false;
        cell.isFixed = false;
    }
    if (val === "c") { // alive & fixed
        cell.isAlive = true;
        cell.isFixed = true;
    }
    if (val === "d") { // dead & fixed
        cell.isAlive = false;
        cell.isFixed = true;
    }

    world.resize(CELL_DIMENSION); //RE-RENDERS GRID
}




/*
@class          cellUniverse
@description    Calculates the dimensions of the game. Calculates Game States. Manages Cell's states and ticks.
*/
function cellUniverse() {
    this.leftBound = 0;
    this.topBound = 0;
    this.rightBound = 0; 
    this.bottomBound = 0; 

    /*
    @function       cellUniverse.generateCells
    @description    Generates the cells on the grid based on the allowed dimensioned calculated by the universe. If a cell does
                    not already exist, then it is generated and set as dead. Once cell is determined to be within the viewable region
                    of the grid it is called to render itself on the GUI. Updates Counter (Game-Stats)
    */
    this.generateCells = function () {
        resetCounter();
        for (var i = 0; i <= this.bottomBound; i++) {
            if (cellGrid[i] == undefined) cellGrid.push([]);
            for (var j = 0; j <= this.rightBound; j++) {
                if (cellGrid[i][j] == undefined) {
                    cellGrid[i].push(new Cell(i, j));
                    cellGrid[i][j].isAlive = false;
                }
                cellGrid[i][j].updateAppearance();
                countCell(i, j);
            }
        }
        updateCounter();
    }

    /*
    @function       cellUniverse.tick
    @description    ticks the game forward one-round. Calls on each viewable cell to calculate its state in the next round, and then calls each cell to tick itself
    */
    this.tick = function () {
        for (var i = 0; i <= this.bottomBound; i++) {
            for (var j = 0; j <= this.rightBound; j++) {
                cellGrid[i][j].calculateIsAliveNextRound();
            }
        }
        for (var i = 0; i <= this.bottomBound; i++) {
            for (var j = 0; j <= this.rightBound; j++) {
                cellGrid[i][j].tick();
            }
        }
    }
    
    /*
    @function       cellUniverse.resize
    @description    Recalculates --> rerenders grid based on the new size dimensions. Updates Boundaries for new Cell Size.

    @param          Pixel Size (Squared) of desired cell
    */
    this.resize = function (newDim) {
        if (newDim > MAX_DIM) {
            alert("Too Big. Can't be bigger than: " + MAX_DIM + " square pixels");
            return;
        }
        else if (newDim < MIN_DIM) {
            alert("Too Small. Can't be smaller than: " + MIN_DIM + " square pixels");
            return;
        }
        CELL_DIMENSION = newDim; //assigns global variable new dimension value
        this.updateBounds();
        this.generateCells();
    }

    /* 
    @function       cellUniverse.reverseTick
    @description    Undo's to previous grid-state
    */
    this.reverseTick = function () {
        if (ROUND_NUM == 0) return;
        disableButtons(); //while for loop is calculating states, remove users ability to press interfering buttons
        ROUND_NUM--;
        for (var i = 0; i <= this.bottomBound; i++) {
            for (var j = 0; j <= this.rightBound; j++) {
                cellGrid[i][j].reverseTick(ROUND_NUM);
            }
            this.generateCells();
        }
        enableButtons(); //while loop is finished calculating state, permit use to press all buttons
    }

    /*
    @function       cellUniverse.updateBounds
    @description    calculates and updates the boundaries of the viewable region of the grid based on GUI dimensions.
    */
    this.updateBounds = function () {
        leftPadding = CELL_DIMENSION;
        topPadding = CELL_DIMENSION;
        var bw = mainPanel.offsetWidth - 1;
        var bh = mainPanel.offsetHeight - 1;

        bw = bw
        bh = bh

        canvasGrid.setAttribute("width", bw);
        canvasGrid.setAttribute("height", bh);

        var numCols = ((bw - leftPadding) / (CELL_DIMENSION + 1)) - 1.5;
        var numRows = ((bh - topPadding) / (CELL_DIMENSION + 1)) - 1.5;
        this.leftBound = 0;
        this.topBound = 0;

        this.rightBound = Math.floor(numCols); //TODO: Calculate rightBound
        this.bottomBound = Math.floor(numRows); //TODO: Calculate bottomBound
    }
}



/*
@class          Cell
@description    cell object that holds cells state, previous states, location within grid, and abilities to calulcate future states and update appearance
*/
function Cell(y, x) {
    this.isAlive = true;
    this.isFixed = false;
    this.isAliveNextRound = true;
    this.yCoordinate = y;
    this.xCoordinate = x;
    this.cellState = []; //previous cell states

    /*****Getters*****/
    this.getIsAlive = function () {
        return this.isAlive;
    }

    this.getIsFixed = function () {
        return this.isFixed;
    }

    this.getIsAliveNextRound = function () {
        return this.isAliveNextRound;
    }

    this.getYCoordinate = function () {
        return this.yCoordinate;
    }
    this.getXCoordinate = function () {
        return this.xCoordinate
    }

    /*****Setters*****/
    this.setIsAlive = function (toggle) {
        this.isAlive = toggle;
    }

    this.setIsFixed = function (toggle) {
        this.isFixed = toggle;
    }

    this.setIsAliveNextRound = function (toggle) {
        this.isAliveNextRound = toggle;
    }

    this.setYCoordinate = function (yCord) {
        this.yCoordinate = yCord;
    }

    this.setXCoordinate = function (xCord) {
        this.xCoordinate = xCord;
    }


    /*****Methods*****/
    
    /* 
    @function       cell.updateAppearance
    @description    Calls global updateAppearnce method passing its location within the grid and its color
    */  
    this.updateAppearance = function () {
        addSquareToCanvas(this.getYCoordinate(), this.getXCoordinate(), this.getColor());
    }

    /*
    @function       cell.calculateIsAliveNextRound
    @description    Calculates the cell's next state by checking neighbors
    */ 
    this.calculateIsAliveNextRound = function () {
        if (this.isFixed == true) {
            this.isAliveNextRound = this.isAlive;
            return;
        }
        var adjAlive = this.calculateAdjAliveCount();
        if (adjAlive < 2 || adjAlive > 3) this.isAliveNextRound = false;
        else if (adjAlive == 3) this.isAliveNextRound = true;
        else this.isAliveNextRound = this.isAlive;
    }

    /*
    @function       cell.calculatedAdjAliveCount
    @description    calculate number of alive neighbors
    */
    this.calculateAdjAliveCount = function () {
        var countAlive = Number(this.checkTop()) + Number(this.checkBottom()) + Number(this.checkLeft()) + Number(this.checkRight()) + Number(this.checkTopLeft()) + Number(this.checkTopRight()) + Number(this.checkBottomLeft()) + Number(this.checkBottomRight());
        return countAlive;
    }

    /****** Check Status of Neighbors *****/
    this.checkTop = function () {
        var topAdjY = this.getYCoordinate() - 1;
        if (topAdjY < world.topBound) topAdjY = world.bottomBound;
        return cellGrid[topAdjY][this.xCoordinate].getIsAlive();
    }

    this.checkBottom = function () {
        var bottomAdjY = this.getYCoordinate() + 1;
        if (bottomAdjY > world.bottomBound) bottomAdjY = world.topBound;
        return cellGrid[bottomAdjY][this.getXCoordinate()].getIsAlive();
    }

    this.checkLeft = function () {
        var leftAdjX = this.getXCoordinate() - 1;
        if (leftAdjX < world.leftBound) leftAdjX = world.rightBound;
        return cellGrid[this.getYCoordinate()][leftAdjX].getIsAlive();
    }

    this.checkRight = function () {
        var rightAdjX = this.getXCoordinate() + 1;
        if (rightAdjX > world.rightBound) rightAdjX = world.leftBound;
        return cellGrid[this.getYCoordinate()][rightAdjX].getIsAlive();
    }

    this.checkTopLeft = function () {
        var topAdjY = this.getYCoordinate() - 1;
        if (topAdjY < world.topBound) topAdjY = world.bottomBound;
        var leftAdjX = this.getXCoordinate() - 1;
        if (leftAdjX < world.leftBound) leftAdjX = world.rightBound;
        return cellGrid[topAdjY][leftAdjX].getIsAlive();
    }

    this.checkTopRight = function () {
        var topAdjY = this.getYCoordinate() - 1;
        if (topAdjY < world.topBound) topAdjY = world.bottomBound;
        var rightAdjX = this.getXCoordinate() + 1;
        if (rightAdjX > world.rightBound) rightAdjX = world.leftBound;
        return cellGrid[topAdjY][rightAdjX].getIsAlive();
    }

    this.checkBottomLeft = function () {
        var bottomAdjY = this.getYCoordinate() + 1;
        if (bottomAdjY > world.bottomBound) bottomAdjY = world.topBound;
        var leftAdjX = this.getXCoordinate() - 1;
        if (leftAdjX < world.leftBound) leftAdjX = world.rightBound;
        return cellGrid[bottomAdjY][leftAdjX].getIsAlive();
    }

    this.checkBottomRight = function () {
        var bottomAdjY = this.getYCoordinate() + 1;
        if (bottomAdjY > world.bottomBound) bottomAdjY = world.topBound;
        var rightAdjX = this.getXCoordinate() + 1;
        if (rightAdjX > world.rightBound) rightAdjX = world.leftBound;
        return cellGrid[bottomAdjY][rightAdjX].getIsAlive();
    }



    /*
    @function       cell.tick
    @description    ticks itself for and saves current state in state-cell to revert to later (manages cell-state array)
    */
    this.tick = function () {
        if (ROUND_NUM > 1 && this.cellState[ROUND_NUM - 2] === undefined) {
            var lastStatus = this.cellState[this.cellState.length - 1];
            if (lastStatus !== undefined && (lastStatus[0] === true || lastStatus[1] === true)) {
                this.cellState = fillArray(this.cellState, lastStatus, this.cellState.length, ROUND_NUM - 2);
            }
        }
        this.cellState[ROUND_NUM - 1] = [this.getIsAlive(), this.getIsFixed()];
        this.isAlive = this.isAliveNextRound;
        this.updateAppearance();
    }
    /*
    @function       cell.reverseTick
    @description    manages the states of previous cells.
    */
    this.reverseTick = function (oldRoundNum) {
        if (this.cellState[oldRoundNum] === undefined) {
            this.isAlive = false;
            this.isFixed = false;
        }
        else {
            this.isAlive = this.cellState[oldRoundNum][0];
            this.isFixed = this.cellState[oldRoundNum][1];
        }

        this.updateAppearance();
    }
    
    /*
    @function       cell.getColor
    @description    returns the color of the cell based of the state of the cell
    
    @returns        color of cell in rgb string format
    */
    this.getColor = function () {
        if (this.isAlive == true) {
            if (this.isFixed == true) return COLORS[3]; //alive and fixed
            else return COLORS[1]; //alive not fixed
        }
        else if (this.isFixed == true) return COLORS[2]; //dead and fixed
        else return COLORS[0]; //dead not fixed;
    }

}


/* 
@function       fillArray
@description    fills an array with a given value from a range of indecies (inclusive)

@param1         the array in which to fill
@param2         the value in which to fill the array with
@param3         the first index in which to fill the array with the given value
@param4         th last index in the which to fill the array with the given value

@returns        the newly filled array
*/
function fillArray(arr, val, start, end) {
    for (i = start; i <= end; i++) {
        arr[i] = val;
    }
    return arr;
}


/*
@function       resetCounter
@description    resets the counter for game stats
*/
function resetCounter() {
    numAlive = 0;
    numDead = 0;
    numFixedAlive = 0;
    numFixedDead = 0;
}

/*
@function       updateCounter
@description    Updates the game-stats in the GUI
*/
function updateCounter() {
    if (document.getElementById('langNow').value === "de") {
        document.getElementById("alive-text").innerText = "Leben: " + numAlive + " (" + numFixedAlive + ")";
        document.getElementById("dead-text").innerText = "Tot: " + numDead + " (" + numFixedDead + ")";
    }
    else {
        document.getElementById("alive-text").innerText = "Alive: " + numAlive + " (" + numFixedAlive + ")";
        document.getElementById("dead-text").innerText = "Dead: " + numDead + " (" + numFixedDead + ")";
    }

}


/*
@function       countCell
@description    takes in the location of a cell and updates the counters for each stat based off the cell's status

@param1         y-coordiante of cell in grid
@param2         x-coordinate of cell in grid

@returns        NONE
*/
function countCell(y, x) {
    var cell = cellGrid[y][x];
    if (cell.getIsAlive() == true) {
        numAlive++;
        if (cell.isFixed == true) numFixedAlive++;
    }
    else {
        numDead++;
        if (cell.isFixed == true) numFixedDead++;
    }
}


/*
@function       setAllStatus
@description    sets the status of all cells in grid to the inputted status and rerenders grid

@param1         alive/dead status of all the cells
@param2         non/fixed status of all the cells

@returns        NONE
*/
function setAllStatus(newAliveStatus, newFixedStatus) {
    event.preventDefault();
    var rows = cellGrid.length;
    var cols = cellGrid[0].length;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {

            cellGrid[i][j].isAlive = newAliveStatus;
            cellGrid[i][j].isFixed = newFixedStatus;

        }
    }
    world.resize(CELL_DIMENSION);
}

/*
@function       tick
@description    global tick method increments the round number and ticks the cellUniverse forward
*/
function tick() {
    ROUND_NUM++;
    world.tick();
}

/*
@function       dragFunction
@description    unimplemented drag function
*/
function dragFunction(e) {

}

/*
@function       reverseTick
@description    global reverseTick method calls world.
*/
function reverseTick() {
    world.reverseTick();
}


var finishedResizing; //holds interval (time-between) for window resizes

/*
@function       windowResize
@description    resizes the Window after certain time period
*/
function windowResize() {
    clearTimeout(finishedResizing); //assures that resizing doesnt happen to quickly.
    finishedResizing = setTimeout(function () { world.resize(CELL_DIMENSION) }, RESIZE_TIME_DELAY); //only resizes after 10 milliseconds of not resizing
}


/*
@function       isCellInBounds
@description    returns if the inputted cell is within the viewable region of the grid

@param1         y-coordinate of cell
@param2         x-coordinate of cell

@returns        boolean 
*/
function isCellInBounds(y, x) {
    if (y < world.topBound || y > world.bottomBound || x < world.leftBound || x > world.rightBound) return false;
    return true;
}


var playInterval;


/* Button/Graphic Manipulation */
function disableButtons() {
    document.getElementById('restore-btn').style.visibility = "hidden";
    document.getElementById('skip-btn').style.visibility = "hidden";
}

function enableButtons() {
    document.getElementById('restore-btn').style.visibility = "visible";
    document.getElementById('skip-btn').style.visibility = "visible";

}

function showPlayButton() {
    document.getElementById('play-btn').children[0].innerHTML = "play_arrow"
}

function showPauseButton() {
    document.getElementById('play-btn').children[0].innerHTML = "pause"
}

function onPlay() {
    if (playState == false) playGame();
    else pauseGame();
}


var playInterval; //the interval control time between ticks

/*
@function       playGame
@description    allows game to tick, progress game forward
*/
function playGame() {
    playState = true;
    disableButtons()
    showPauseButton();
    playInterval = setInterval(tick, tick_freq);
}

/*
@function       pauseGame
@description    pauses game, stops game progression
*/
function pauseGame() {
    clearInterval(playInterval);
    playState = false;
    enableButtons();
    showPlayButton();
}


const speedTable = [3000, 2500, 2000, 1500, 1000, 800, 500, 250, 80, 10]; //SPEED OPTIONS FOR SLIDER (IN MILLISECONDS)

/*
@function       changeSpeed
@description    changes speed of game (via slider)
*/
function changeSpeed() {
    var state = playState;
    if (state === true) onPlay();
    var sliderValue = document.getElementById('speed-slider').value;
    tick_freq = speedTable[Math.floor(sliderValue / 10) - 1];
    if (sliderValue == 0) tick_freq = speedTable[0];

    if (state === true) onPlay();
}


/*
@function       changeGridHeight
@description    changes gridHeight of grid (via slider)
*/
function changeGridHeight() {//make Width
    var h = document.getElementById('grid-slider').value;
    h = (7 / 10) * h;
    mainPanel.style.height = h + "%";
    world.resize(CELL_DIMENSION);
}


/*
@function       changeCellSize
@description    changes cellSize of grid (via slider)
*/
function changeCellSize() {
    var newSize = document.getElementById('size-slider').value;
    newSize = Number(newSize);
    world.resize(newSize);
}

canvasGrid.addEventListener('mousemove', onCellHover);
canvasGrid.addEventListener('mouseleave', offCellHover);
canvasGrid.addEventListener('click', onCellClick);
document.getElementById('play-btn').addEventListener('click', onPlay);
document.getElementById('skip-btn').addEventListener('click', tick);
document.getElementById('speed-slider').addEventListener('change', changeSpeed);
document.getElementById('grid-slider').addEventListener('change', changeGridHeight);
document.getElementById('size-slider').addEventListener('change', changeCellSize);
document.getElementById('langNow').addEventListener('change', updateCounter);
 


//Demo Function
function demo() {
    cellGrid[4][5].isAlive = true;
    cellGrid[5][6].isAlive = true;
    cellGrid[6][4].isAlive = true;
    cellGrid[6][5].isAlive = true;
    cellGrid[6][6].isAlive = true;

    cellGrid[4][5].updateAppearance();
    cellGrid[5][6].updateAppearance();
    cellGrid[6][4].updateAppearance();
    cellGrid[6][5].updateAppearance();
    cellGrid[6][6].updateAppearance();
    world.resize(CELL_DIMENSION);
}




var world = new cellUniverse();
world.resize(CELL_DIMENSION);
changeSpeed();
demo();

