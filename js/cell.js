const MIN_DIM = 10;
const MAX_DIM = 100;
const CELL_GRID_ID = "cell-grid"
const RESIZE_TIME_DELAY = 50; //IN MILLISECONDS
var CELL_DIMENSION = 40; //20 X 20 PIXEL SQUARE
var PADDING = 10;

var ROUND_NUM = 0;
var selectedCells = [];
var cellGrid = [];
var COLORS = ["rgba(255, 0, 0, 1)", "rgba(0,255,0, 1)", "grey", "rgba(10, 10, 10, 0)", "grey"]; // [DEAD, ALIVE, FIXED-DEAD, FIXED-ALIVE, GRIDLINES]



var playState = false;
var tick_freq = 1000 //1 second default

const MAKE_OPAQUE_SIG = 15;
const REMOVE_OPAQUE_SIG = 16;


//TODO: stop RESIZING AFTER CERTAIN SIZE;

var numAlive = 0;
var numDead = 0;
var numFixedAlive = 0;
var numFixedDead = 0;


//Emily's color updating function
function updateDead(picker){
    var newColor = picker.toRGBString();
    COLORS[0] = newColor;
}

function updateAlive(picker){
    var newColor = picker.toRGBString();
    COLORS[1] = newColor;
}

function updateFDead(picker){
    var newColor = picker.toRGBString();
    COLORS[2] = newColor;
}

function updateFAlive(picker){
    var newColor = picker.toRGBString();
    COLORS[3] = newColor;
}

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
                    cellGrid[i][j].setIsAlive(false);
                }
                cellGrid[i][j].updateAppearance();
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
        for (var i = 0; i <= this.bottomBound; i++) {
            for (var j = 0; j <= this.rightBound; j++) {
                cellGrid[i][j].tick();
            }
        }
    }

    this.generateGrid = function (){
        console.log("a")
        var bw = document.getElementById('main').offsetWidth;
        var bh = document.getElementById('main').offsetHeight;
        //padding around grid
        var p = 10;
        //size of canvas
        var cw = bw + (p*2) + 1;
        var ch = bh + (p*2) + 1;

        var canvasGrid = document.getElementById(CELL_GRID_ID);
        canvasGrid.setAttribute("width", cw);
        canvasGrid.setAttribute("height", ch);

        var evenWidth = bw - (bw % CELL_DIMENSION)
        var evenHeight = bh - (bh % CELL_DIMENSION)

        var WIDTH_PAD = 10 + ((bw % CELL_DIMENSION) / 2)
        var HEIGHT_PAD = 10 + ((bh % CELL_DIMENSION) / 2)

        var context = canvasGrid.getContext("2d");
        for (var x = 0; x <= evenWidth; x += CELL_DIMENSION) {
            context.moveTo(0.5 + x + WIDTH_PAD, HEIGHT_PAD);
            context.lineTo(0.5 + x + WIDTH_PAD, evenHeight + HEIGHT_PAD);
        }


        for (var x = 0; x <= evenHeight; x += CELL_DIMENSION) {
            context.moveTo(WIDTH_PAD, 0.5 + x + HEIGHT_PAD);
            context.lineTo(evenWidth + WIDTH_PAD, 0.5 + x + HEIGHT_PAD);
            }

        context.strokeStyle = "black";
        context.stroke();
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
        this.generateGrid();
        this.generateCells();
        generateSelectedCells();
    }

    this.updateBounds = function () {
        var canvasGrid = document.getElementById(CELL_GRID_ID);
        var gridHeight = canvasGrid.offsetHeight;
        var gridWidth = canvasGrid.offsetWidth;

        var numRows = gridHeight / CELL_DIMENSION;
        var numCols = gridWidth / CELL_DIMENSION;

        this.leftBound = 0;
        this.topBound = 0;

        this.rightBound = Math.floor(numCols) - 1; //TODO: Calculate rightBound
        this.bottomBound = Math.floor(numRows) - 1; //TODO: Calculate bottomBound
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
        return this.getIsAliveNextRound;
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
        updateCellAppearance(this.getYCoordinate(), this.getXCoordinate(), Number(this.getIsAlive()));
    }

    this.calculateIsAliveNextRound = function () {
        if (this.getIsFixed() === true) {
            this.setIsAliveNextRound(this.isAlive);
            return;
        } //unchanged
        var adjAlive = this.calculateAdjAliveCount();
        if (adjAlive < 2 || adjAlive > 3) this.setIsAliveNextRound(false);
        else if (adjAlive === 3) this.setIsAliveNextRound(true);
        else this.setIsAliveNextRound(this.isAlive);
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
        this.cellState[ROUND_NUM - 1] = this.getIsAlive();
        this.setIsAlive(this.isAliveNextRound);
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

}

function resetCounter() {
    numAlive = 0;
    numDead = 0;
    numFixedAlive = 0;
    numFixedDead = 0;
}

function updateCounter() {
    document.getElementById("alive-text").innerText = numAlive + " (" + numFixedAlive + ")";
    document.getElementById("dead-text").innerText = numDead + " (" + numFixedDead + ")";
}
function countCell(y, x) {
    var cell = cellGrid[y][x];
    if(cell.getIsAlive() == true) {
        numAlive++;
        if(cell.isFixed == true) numFixedAlive++;
    }

    else {
        numDead++;
        if(cell.isFixed == true) numFixedDead++; 
    }
}

function handleClick(e) {
    var rect = document.getElementById(CELL_GRID_ID).getBoundingClientRect();
    console.log(rect.left, e.x, "and", rect.top, e.y);
    var x = e.x - rect.left;
    var y = e.y - rect.top;

    var bw = document.getElementById('main').offsetWidth;
    var bh = document.getElementById('main').offsetHeight;

    var WIDTH_PAD = 10 + ((bw % CELL_DIMENSION) / 2)
    var HEIGHT_PAD = 10 + ((bh % CELL_DIMENSION) / 2)

    x = (x - WIDTH_PAD) / (CELL_DIMENSION);
    y = (y - HEIGHT_PAD) / (CELL_DIMENSION);
    x = Math.floor(x);
    y = Math.floor(y);
    console.log(HEIGHT_PAD, WIDTH_PAD)  
    console.log(y, x)
    //x * CELL_DIMENSION + 1 + WIDTH_PAD), (y * CELL_DIMENSION + 1 + HEIGHT_PAD), CELL_DIMENSION - 2, CELL_DIMENSION - 2);
    
    
    updateCellAppearance(y, x, 4);

    
   
    
    return;
    var c = document.getElementById(CELL_GRID_ID).getContext("2d");
    c.fillStyle = "black";
    
    var boxSize = CELL_DIMENSION;
    c.fillRect(Math.floor(e.offsetX / boxSize) * boxSize,
      Math.floor(e.offsetY / boxSize) * boxSize,
      boxSize, boxSize);
  }


  var lastHover = false;
  function handleHover(e) { 
    var rect = document.getElementById(CELL_GRID_ID).getBoundingClientRect();

    var x = e.x - rect.left;
    var y = e.y - rect.top;

    var bw = document.getElementById('main').offsetWidth;
    var bh = document.getElementById('main').offsetHeight;

    var WIDTH_PAD = 10 + ((bw % CELL_DIMENSION) / 2)
    var HEIGHT_PAD = 10 + ((bh % CELL_DIMENSION) / 2)

    x = (x - WIDTH_PAD) / (CELL_DIMENSION);
    y = (y - HEIGHT_PAD) / (CELL_DIMENSION);
    x = Math.floor(x);
    y = Math.floor(y);
 
    hov = [y, x];

    updateCellAppearance(lastHover[0], lastHover[1], 15, 0)
   
    //x * CELL_DIMENSION + 1 + WIDTH_PAD), (y * CELL_DIMENSION + 1 + HEIGHT_PAD), CELL_DIMENSION - 2, CELL_DIMENSION - 2);
    if(lastHover !== hov) updateCellAppearance(y, x, 15, .2);
    lastHover = [y, x];
}

  //document.getElementById(CELL_GRID_ID).addEventListener('click', handleClick);
  document.getElementById(CELL_GRID_ID).addEventListener('mousemove', handleHover);



function tick() {
    clearSelected();
    ROUND_NUM++;
    world.tick();
}

function reverseTick() {
    clearSelected();
    ROUND_NUM -= 2;
    world.tick();
}

function changeSize() {
    var newSize = document.getElementById("size").value;
    world.resize(newSize); //add button disable
}

var finishedResizing;

function windowResize() {
    clearTimeout(finishedResizing); //assures that resizing doesnt happen to quickly.
    finishedResizing = setTimeout(function(){ world.resize(CELL_DIMENSION) }, RESIZE_TIME_DELAY); //only resizes after 10 milliseconds of not resizing
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

function updateCellAppearance(y, x, status, opacity) {

    var canvasGrid = document.getElementById(CELL_GRID_ID);
    var context = canvasGrid.getContext('2d');
    var WIDTH_PAD = 10 + ((document.getElementById('main').offsetWidth % CELL_DIMENSION) / 2);
    var HEIGHT_PAD = 10 + ((document.getElementById('main').offsetHeight % CELL_DIMENSION) / 2);
    context.fillStyle = "white";
    if(status === MAKE_OPAQUE_SIG) {
        console.log("Fd")
      context.fillStyle = "rgba(0, 0, 255, " + opacity;

    }
    else context.fillStyle = COLORS[status];
    
    context.fillRect((x * CELL_DIMENSION + 1 + WIDTH_PAD), (y * CELL_DIMENSION + 1 + HEIGHT_PAD), CELL_DIMENSION - 2, CELL_DIMENSION - 2);
}1

function parseCellID(id) {
    return id.split('!');
}


function checkSelectedCellExists(id) {
    var coor = parseCellID(id);
    index = selectedCells.indexOf(id);
    return index;
}

function selectCell(id) {
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
      if(playState == false) playGame();
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


  function changeSpeed() {
      var slider = document.getElementById('speed-slider');
  
  }



document.getElementById('play-btn').addEventListener('click', onPlay);
document.getElementById('skip-btn').addEventListener('click', tick);
document.getElementById('speed-slider').addEventListener('change', changeSpeed);


var world = new cellUniverse();
world.resize(CELL_DIMENSION);

demo();

