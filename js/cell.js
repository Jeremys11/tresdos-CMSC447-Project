const MIN_DIM = 9;
const MAX_DIM = 100;
const CELL_GRID_ID = "cell-grid"
const RESIZE_TIME_DELAY = 50; //IN MILLISECONDS
var CELL_DIMENSION = 40; //20 X 20 PIXEL SQUARE
var PADDING = 10;

var ROUND_NUM = 0;
var selectedCells = [];
var cellGrid = [];
var COLORS = ["rgba(177, 177, 177, 1)", "rgba(0,153,255, 1)", "rgba(10, 10, 10, 1)", "rgba(255, 204, 153, 1)", "rgb(78, 140, 167)"]; // [DEAD, ALIVE, FIXED-DEAD, FIXED-ALIVE, GRIDLINES]



var playState = false;
var tick_freq = 10 //1 second default

const MAKE_OPAQUE_SIG = 15;
const REMOVE_OPAQUE_SIG = 16;


//TODO: stop RESIZING AFTER CERTAIN SIZE;

var numAlive = 0;
var numDead = 0;
var numFixedAlive = 0;
var numFixedDead = 0;

const mainPanel = document.getElementById('main');

const canvasGrid = document.getElementById(CELL_GRID_ID);
const context = canvasGrid.getContext('2d');

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

function updateCellAppearance(y, x, status, colorKey) {
    return;

   
    var WIDTH_PAD = 10 + ((mainPanel.offsetWidth % CELL_DIMENSION) / 2);
    var HEIGHT_PAD = 10 + ((mainPanel.offsetHeight % CELL_DIMENSION) / 2);

    context.fillStyle = COLORS[status];

    context.fillRect((x * CELL_DIMENSION + 1 + WIDTH_PAD), (y * CELL_DIMENSION + 1 + HEIGHT_PAD), CELL_DIMENSION - 1, CELL_DIMENSION - 1);
    
    //console.log("cell: ", y * CELL_DIMENSION + 1 + HEIGHT_PAD, x * CELL_DIMENSION + 1 + WIDTH_PAD), (y * CELL_DIMENSION + 1 + HEIGHT_PAD);
}
const squareMap = {};


function createSquare(r, g, b, s, opacity) {
    

    if(opacity === undefined) opacity = 255;
    var req = r + "," + g + "," + b + "," + s + "," + opacity;
    if(!squareMap[req]) {
    var imgData = context.createImageData(s, s);
    var len = imgData.data.length;
    for(var i = 0; i < len; i += 4) {
        imgData.data[i+0] = r;
        imgData.data[i+1] = g;
        imgData.data[i+2] = b;
        imgData.data[i+3] = opacity;
    }
    squareMap[req] = imgData;
}
    return squareMap[req];
}

var topPadding = CELL_DIMENSION;
var leftPadding = CELL_DIMENSION;

function addSquareToCanvas(y, x, rgbColor, opacity) {
    rgbColor = stringToRGB(rgbColor);
    const square = createSquare(rgbColor[0], rgbColor[1], rgbColor[2], CELL_DIMENSION, opacity);
    context.putImageData(square, leftPadding + (x*CELL_DIMENSION) + x, topPadding + (y*CELL_DIMENSION) + y);
}

function stringToRGB(color) {
    color = color.substring(color.indexOf('(') + 1, color.indexOf(')'));
    color = color.split(',');
    return color;
}

const highlightColor = "orange";
const highlightWidth = "1";

function drawBorder(y, x, strokeColor, lineWidth) {
    context.beginPath();
    context.strokeStyle = strokeColor;
    context.lineWidth = lineWidth;
    context.rect(leftPadding + (x*CELL_DIMENSION) + x, topPadding + (y*CELL_DIMENSION) + y, CELL_DIMENSION, CELL_DIMENSION);
    
    context.stroke();

}

var curHov = false;
const HIGHLIGHT_OPACITY = 102;
function onCellHover(e) {
    const mousePos = {
        x: e.clientX - mainPanel.offsetLeft,
        y: e.clientY - mainPanel.offsetTop
    };
    var x = Math.floor((mousePos.x - leftPadding) / CELL_DIMENSION);
    var y = Math.floor((mousePos.y - topPadding) / CELL_DIMENSION);

    if (curHov !== false && curHov[0] === y && curHov[1] === x) {
        return;
    } //nothing
    offCellHover();
    if(isCellInBounds(y, x) === true) {
        curHov = [y, x];
        //drawBorder(y, x, highlightColor, highlightWidth);
        addSquareToCanvas(y, x, cellGrid[y][x].getColor(), HIGHLIGHT_OPACITY)
    }
    else curHov = false;
}

function offCellHover() {
    if(curHov !== false) clearBorder(curHov[0], curHov[1]);
    curHov = false;
}

function clearBorder(y, x) {
    context.beginPath();
    context.clearRect(leftPadding + (x*CELL_DIMENSION) + x, topPadding + (y*CELL_DIMENSION) + y, CELL_DIMENSION, CELL_DIMENSION);
    cellGrid[y][x].updateAppearance();
}


canvasGrid.addEventListener('mousemove', onCellHover);
canvasGrid.addEventListener('mouseleave', offCellHover);
canvasGrid.addEventListener('click', onCellClick);


function onCellClick(e) {
    const mousePos = {
        x: e.clientX - mainPanel.offsetLeft,
        y: e.clientY - mainPanel.offsetTop
    };
    var x = Math.floor((mousePos.x - leftPadding) / CELL_DIMENSION);
    var y = Math.floor((mousePos.y - topPadding) / CELL_DIMENSION);
    var val = document.getElementById('colorSelBox').value;
    console.log(val)
    var cell = cellGrid[y][x];
    if(val === 'a') {
        cell.isAlive = true; 
        cell.isFixed = false;
    }
    if(val === "b") {
        cell.isAlive = false;
        cell.isFixed = false;
    }
    if(val ==="c") {
        cell.isAlive = true;
        cell.isFixed = true;
    }
    if(val === "d") {
        cell.isAlive = false;
        cell.isFixed = true;
    }

    world.resize(CELL_DIMENSION);
}

function onCanvasClick(e) {
    
    console.log(mousePos.y, mousePos.x)
   
    console.log("x:", x, "y:", y);
   // drawBorder(y, x, highlightColor, "1");

}

var MAIN_BACKGROUND_COLOR = "rgb(236, 208, 208)"
mainPanel.style.backgroundColor = MAIN_BACKGROUND_COLOR;














    var totalRounds = 0;


function cellUniverse() {
    this.leftBound = 0;
    this.topBound = 0;

    this.rightBound = 0; //TODO: Calculate rightBound
    this.bottomBound = 0; //TODO: Calculate bottomBound

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
                //drawBorder(j, i, MAIN_BACKGROUND_COLOR, highlightWidth);

                countCell(i, j);
            }

        }
        updateCounter();
    }

    this.tick = function () {
        for (var i = 0; i <= this.bottomBound; i++) {
            for (var j = 0; j <= this.rightBound; j++) {
                cellGrid[i][j].calculateIsAliveNextRound();
            
            }
        } 
        console.log(cellGrid[0][0])
        for (var i = 0; i <= this.bottomBound; i++) {
            for (var j = 0; j <= this.rightBound; j++) {
                cellGrid[i][j].tick();
            }
        }
    }

    this.resize = function (newDim) {
        if (newDim > MAX_DIM) {
            alert("Too Big. Can't be bigger than: " + MAX_DIM + " square pixels");
            return;
        }
        else if (newDim < MIN_DIM) {
            alert("Too Small. Can't be smaller than: " + MIN_DIM + " square pixels");
            return;
        }
        CELL_DIMENSION = newDim;
        this.updateBounds();

        this.generateCells();
        
    }
    this.reverseTick = function() {
        if(ROUND_NUM == 0) {
            return;
        }
        document.getElementById('restore-btn').disabled = true;
        ROUND_NUM--;
        for (var i = 0; i <= this.bottomBound; i++) {
            for (var j = 0; j <= this.rightBound; j++) {
                cellGrid[i][j].reverseTick(ROUND_NUM);
            
            }
            this.generateCells();
        } 
        document.getElementById('restore-btn').disabled = false;
    }
    this.updateBounds = function () {
        leftPadding = CELL_DIMENSION;
        topPadding = CELL_DIMENSION;
        var bw = mainPanel.offsetWidth - 1;
        var bh = mainPanel.offsetHeight - 1;
        console.log(bw, bh);
  
        bw = bw
        bh = bh


        canvasGrid.setAttribute("width", bw);
        canvasGrid.setAttribute("height", bh);
    

        var evenWidth = bw - (bw % CELL_DIMENSION);
        var evenHeight = bh - (bh % CELL_DIMENSION);

       
        var numCols = ((bw - leftPadding) / (CELL_DIMENSION + 1)) - 1.5;
        var numRows = ((bh - topPadding) / (CELL_DIMENSION + 1)) - 1.5;
        this.leftBound = 0;
        this.topBound = 0;

        this.rightBound = Math.floor(numCols); //TODO: Calculate rightBound
        this.bottomBound = Math.floor(numRows); //TODO: Calculate bottomBound
    }
}



function Cell(y, x) {
    this.isAlive = true;
    this.isFixed = false;
    this.isAliveNextRound = true;
    this.yCoordinate = y;
    this.xCoordinate = x;
    this.isSelected = false;
    this.cellState = [];




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

    this.updateAppearance = function () {
        addSquareToCanvas(this.getYCoordinate(), this.getXCoordinate(), this.getColor());
    }

    this.calculateIsAliveNextRound = function () {
        if (this.isFixed == true) {
            
            this.isAliveNextRound = this.isAlive;
            return;
        } //unchanged
        var adjAlive = this.calculateAdjAliveCount();
        if (adjAlive < 2 || adjAlive > 3) this.isAliveNextRound = false;
        else if (adjAlive == 3) this.isAliveNextRound = true;
        else this.isAliveNextRound = this.isAlive;
    }

    this.calculateAdjAliveCount = function () {
        var countAlive = Number(this.checkTop()) + Number(this.checkBottom()) + Number(this.checkLeft()) + Number(this.checkRight()) + Number(this.checkTopLeft()) + Number(this.checkTopRight()) + Number(this.checkBottomLeft()) + Number(this.checkBottomRight());
        return countAlive;
    }

    /*Check Status of Neighbors*/

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

    this.tick = function () {
        if(ROUND_NUM > 1 && this.cellState[ROUND_NUM - 2] === undefined) {
            var lastStatus = this.cellState[this.cellState.length - 1];
            if(lastStatus !== undefined && (lastStatus[0] === true || lastStatus[1] === true)) {
                console.log("i'm new");
                this.cellState = fillArray(this.cellState, lastStatus, this.cellState.length, ROUND_NUM - 2); 
            }
        }
        this.cellState[ROUND_NUM - 1] = [this.getIsAlive(), this.getIsFixed()];
        this.isAlive = this.isAliveNextRound;
        this.updateAppearance();
    }

    this.reverseTick = function(oldRoundNum) {
        if(this.cellState[oldRoundNum] === undefined) {
            this.isAlive = false;
            this.isFixed = false;
        }
        else {
            this.isAlive = this.cellState[oldRoundNum][0];
            this.isFixed = this.cellState[oldRoundNum][1];
        }

        this.updateAppearance();
    }

    this.getColor = function () { //refactor
        if (this.isAlive == true) {
            if (this.isFixed == true) return COLORS[3]; //alive and fixed
            else return COLORS[1]; //alive not fixed
        }
        else if (this.isFixed == true) return COLORS[2]; //dead and fixed
        else return COLORS[0]; //dead not fixed;
    }

}

function fillArray(arr, val, start, end) {
    for(i = start; i <= end; i++) {
        arr[i] = val;
    }
    return arr;
}

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

function resetCounter() {
    numAlive = 0;
    numDead = 0;
    numFixedAlive = 0;
    numFixedDead = 0;
}

function updateCounter() {
    if(document.getElementById('langNow').value === "de" ) {
        document.getElementById("alive-text").innerText = "Leben: " + numAlive + " (" + numFixedAlive + ")";
     document.getElementById("dead-text").innerText = "Tot: " + numDead + " (" + numFixedDead + ")";
    }
    else {
        document.getElementById("alive-text").innerText = "Alive: " + numAlive + " (" + numFixedAlive + ")";
     document.getElementById("dead-text").innerText = "Dead: " + numDead + " (" + numFixedDead + ")";
    }
    
}

document.getElementById('langNow').addEventListener('change', updateCounter);

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



function selectAllAlive(currAliveStatus, currFixedStatus, newAliveStatus, newFixedStatus) {
    var rows = cellGrid.length;
    var cols = cellGrid[0].length;
    for(var i = 0; i < rows; i++) {
        for(var j = 0; j < cols; j++) {
            if(cellGrid[i][j].isAlive == currAliveStatus && cellGrid[i][j].isFixed == currFixedStatus) {
                cellGrid[i][j].isAlive = newAliveStatus;
                cellGrid[i][j].isFixed = newFixedStatus;
            }
        }
    }
    world.resize(CELL_DIMENSION);
}

function setAllAlive(newAliveStatus, newFixedStatus) {
    event.preventDefault();
    var rows = cellGrid.length;
    var cols = cellGrid[0].length;
    for(var i = 0; i < rows; i++) {
        for(var j = 0; j < cols; j++) {
    
                cellGrid[i][j].isAlive = newAliveStatus;
                cellGrid[i][j].isFixed = newFixedStatus;
            
        }
    }
    world.resize(CELL_DIMENSION);
}

function tick() {
    totalRounds++;
    ROUND_NUM++;
    world.tick();
}


function myFunction(e) {

}

function reverseTick() {
    world.reverseTick();

}


var finishedResizing;

function windowResize() {
    clearTimeout(finishedResizing); //assures that resizing doesnt happen to quickly.
    finishedResizing = setTimeout(function () { world.resize(CELL_DIMENSION) }, RESIZE_TIME_DELAY); //only resizes after 10 milliseconds of not resizing
}

function clearSelected() {
    selectedCells = [];
    world.resize(CELL_DIMENSION);
}


function toggleSelectedAppearance(id, status) {
    var cell = document.getElementById(id);
    var coor = parseCellID(id);
    index = status;

    if (isCellInBounds(coor[0], coor[1]) == false) return removeCellFromSelected(index); //cell is out of bounds

    if (status != -1) {

        cellGrid[coor[0]][coor[1]].updateAppearance();
        removeCellFromSelected(index);
    }
    else {

        var cellColor = cell.style.backgroundColor;
        cell.style.background = makeOpaqueGradient("radial", cellColor);
        selectedCells.push(id);
    }
}


function removeCellFromSelected(index) {
    if (index == -1) return;
    selectedCells.splice(index, 1);
}

function generateSelectedCells() {
    return;
    var size = selectedCells.length;
    for (var i = 0; i < size; i++) {
        var id = selectedCells[i];

        toggleSelectedAppearance(id, -1);
    }
}


function parseCellID(id) {
    return id.split('!');
}


function checkSelectedCellExists(id) {
    var coor = parseCellID(id);
    index = selectedCells.indexOf(id);
    return index;
}

function sadfsad(id) {
    var cell = document.getElementById(id);
    var coor = parseCellID(id);
    index = selectedCells.indexOf(id);
    if (isCellInBounds(coor[0], coor[1]) == false) return removeCellFromSelected(index); //cell is out of bounds

    if (index != -1) {
        removeCellFromSelected(index);
    }
    else {
        selectedCells.push(id);
    }

    toggleSelectedAppearance(id, index);
}


function isCellInBounds(y, x) {

    if (y < world.topBound || y > world.bottomBound || x < world.leftBound || x > world.rightBound) {
        console.log("y, x", y, x, " is out of bounds");
        return false;

    }
    return true;
}

function makeOpaqueGradient(gradientType, color) {
    color = color.substring(color.indexOf('(') + 1, color.indexOf(')'));
    color = color.split(',');
    var gradient = gradientType + "-gradient(rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + "0), rgba(" + color[0] + "," + color[1] + "," + color[2] + ",1))";
    return gradient;
}



function openTab(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}


var playInterval;

function disableButtons() {

}

function enableButtons() {

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

function playGame() {
    playState = true;
    disableButtons()
    showPauseButton();
    playInterval = setInterval(tick, tick_freq);
}



function pauseGame() {
    clearInterval(playInterval);
    playState = false;
    enableButtons();
    showPlayButton();
}

const DEFAULT_TICK = 1000;
const NUM_STEPS = 7;

const speedTable = [3000, 2500, 2000, 1500, 1000, 800, 500, 250, 80, 10];

function changeSpeed() {
    var state = playState;
    if(state === true) onPlay();
    var sliderValue = document.getElementById('speed-slider').value;
    tick_freq = speedTable[Math.floor(sliderValue / 10) - 1];
    if(sliderValue == 0) tick_freq = speedTable[0];

    if(state === true) onPlay();
}


var maxPixelHeight;

function changeGridHeight() {//make Width
    var h = document.getElementById('grid-slider').value;
    h = (7/10)*h;
    mainPanel.style.height = h + "%";
    world.resize(CELL_DIMENSION);
}




function changeCellSize() {
    var newSize = document.getElementById('size-slider').value;
    newSize = Number(newSize);
    world.resize(newSize);
}


document.getElementById('play-btn').addEventListener('click', onPlay);
document.getElementById('skip-btn').addEventListener('click', tick);
document.getElementById('speed-slider').addEventListener('change', changeSpeed);
document.getElementById('grid-slider').addEventListener('change', changeGridHeight);
document.getElementById('size-slider').addEventListener('change', changeCellSize);


function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function updateButtonColor() {
    var a = stringToRGB(COLORS[0]);
    console.log(rgbToHex(a[0], a[1], a[2]))
    document.getElementById('aliveColor').setAttribute('class', " jscolor {valueElement:null,onFineChange:'updateAlive(this)',value:'" + rgbToHex(a[0], a[1], a[2]) +  "'}")
}





document.addEventListener("drop", function(ev) {
    var data = ev.dataTransfer.getData("text");
    if(ev.target.id == "deadColor") alert("hi")
    //ev.target.appendChild(document.getElementById(data));
   ev.preventDefault();
   console.log(event)
})

document.addEventListener("dragstart", function(ev) {  
   
    console.log(event)
    ev.dataTransfer.setData("text", ev.target.id);
})



var world = new cellUniverse();
world.resize(CELL_DIMENSION);
changeSpeed();
demo();

