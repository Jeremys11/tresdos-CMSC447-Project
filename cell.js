const MIN_DIM = 7;


var CELL_DIMENSION = 40; //20 X 20 PIXEL SQUARE

var cellGrid = [];
var COLORS = ["red", "green", "grey", "yellow", "grey"]; // [DEAD, ALIVE, FIXED-DEAD, FIXED-ALIVE, GRIDLINES]


function cellUniverse() {
	this.leftBound = 0;
	this.topBound = 0;

	this.rightBound = 0; //TODO: Calculate rightBound
	this.bottomBound = 0; //TODO: Calculate bottomBound

	this.generateCells = function () {
		for (var i = 0; i <= this.bottomBound; i++) {
			if (cellGrid[i] == undefined) cellGrid.push([]);
			for (var j = 0; j <= this.rightBound; j++) {
				if (cellGrid[i][j] == undefined) {
					cellGrid[i].push(new Cell(i, j));
					cellGrid[i][j].setIsAlive(false);
				}
				cellGrid[i][j].updateAppearance();
			}
		}
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

	this.generateTable = function () {
		var tableGrid = document.getElementById('cell-grid'); //GENERATE TABLE SHOULD DECIDE ROWS/COLS
		tableGrid.innerHTML = "";

		var numRows = this.bottomBound;
		var numCols = this.rightBound;

		for (var i = 0; i <= numRows; i++) {
			tableGrid.insertRow();
			var gridRow = tableGrid.rows[i];
			for (var j = 0; j <= numCols; j++) {
				gridRow.insertCell();
			}
		}
	}

	this.resize = function (newDim) {
		CELL_DIMENSION = newDim;
		this.updateBounds();
		this.generateTable();
		this.generateCells()
	}

	this.updateBounds = function () {
		var tableGrid = document.getElementById('cell-grid');
		var gridHeight = tableGrid.offsetHeight;
		var gridWidth = tableGrid.offsetWidth;

		var numRows = gridHeight / CELL_DIMENSION;
		var numCols = gridWidth / CELL_DIMENSION;

		this.leftBound = 0;
		this.topBound = 0;

		this.rightBound = Math.floor(numCols) - 1; //TODO: Calculate rightBound
		this.bottomBound = Math.floor(numRows) - 1; //TODO: Calculate bottomBound
	}
}

function updateCellAppearance(y, x, status) {
	var tableGrid = document.getElementById('cell-grid');
	tableGrid.rows[y].cells[x].style.backgroundColor = COLORS[status];
	

}












function Cell(y, x) {
	this.isAlive = true;
	this.isFixed = false;
	this.isAliveNextRound = true;
	this.yCoordinate = y;
	this.xCoordinate = x;




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
		this.setIsAlive(this.isAliveNextRound);
		this.updateAppearance();
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

function tick() {
	world.tick();
}

function changeSize() {
	var newSize = document.getElementById("size").value;
	world.resize(newSize);
}

var world = new cellUniverse();
world.resize(CELL_DIMENSION);
document.getElementById("ticker").addEventListener("click", tick);
document.getElementById("size").defaultValue = CELL_DIMENSION;
document.getElementById("confirm-size").addEventListener("click", changeSize);



demo();

