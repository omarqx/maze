import * as d3 from "d3";

class minHeap {
  size:number = 0;
  array:any[] = [];
  constructor(private compare:Function) {
    
  }
  private up(value:any, i:any) {
    while (i > 0) {
      var j = ((i + 1) >> 1) - 1,
        parentArray = this.array[j];
      if (this.compare(value, parentArray) >= 0) break;
      this.array[i] = parentArray;
      this.array[i = j] = value;
    }
  }
  private down(value:any, i:any) {
    while (true) {
      var r = (i + 1) << 1,
        l = r - 1,
        j = i,
        child = this.array[j];
      if (l < this.size && this.compare(this.array[l], child) < 0) child = this.array[j = l];
      if (r < this.size && this.compare(this.array[r], child) < 0) child = this.array[j = r];
      if (j === i) break;
      this.array[i] = child;
      this.array[i = j] = value;
    }
  }
  empty() {
    return !this.size;
  };
  push (value:any) {
    this.up(this.array[this.size] = value, this.size++);
    return this.size;
  };
  pop () {
    if (this.size <= 0) return;
    var removed = this.array[0], value;
    if (--this.size > 0) value = this.array[this.size], this.down(this.array[0] = value, 0);
    return removed;
  }
}

const width = 960;
const height = 500;

const N = 1 << 0;
const S = 1 << 1;
const W = 1 << 2;
const E = 1 << 3;

const cellSize = 4;
const cellSpacing = 4;
const cellWidth = Math.floor((width - cellSpacing) / (cellSize + cellSpacing));
const cellHeight = Math.floor((height - cellSpacing) / (cellSize + cellSpacing));
const cells = generateMaze(cellWidth, cellHeight); // each cell’s edge bits
const parentArray = new Array(cellHeight * cellWidth); // path tracking
let minScore = Infinity;
let minIndex = (cellHeight - 1) * cellWidth;
const goalX = cellWidth - 1;
const goalY = 0;
const frontier = new minHeap(function (a:any, b:any) { return score(a) - score(b); });


frontier.push(minIndex);
parentArray[minIndex] = null;

var canvas = d3.select("body").append("canvas")
  .attr("width", width)
  .attr("height", height);

var context = ( <HTMLCanvasElement>canvas.node()).getContext("2d");

context.translate(
  Math.round((width - cellWidth * cellSize - (cellWidth + 1) * cellSpacing) / 2),
  Math.round((height - cellHeight * cellSize - (cellHeight + 1) * cellSpacing) / 2)
);

context.fillStyle = "#fff";
for (var y = 0, i = 0; y < cellHeight; ++y) {
  for (var x = 0; x < cellWidth; ++x, ++i) {
    fillCell(i);
    if (cells[i] & S) fillSouth(i);
    if (cells[i] & E) fillEast(i);
  }
}

context.fillStyle = "#777";
d3.timer(function () {
  for (var i = 0; i < 10; ++i) {
    if (exploreFrontier()) {
      return true;
    }
  }
});

function exploreFrontier() {
  var i0 = frontier.pop(),
    i1,
    s0 = score(i0);

  fillCell(i0);

  if (s0 < minScore) {
    fillPath(minIndex);
    context.fillStyle = "magenta";
    minScore = s0, minIndex = i0;
    fillPath(minIndex);
    context.fillStyle = "#777";
    if (!s0) return true;
  }

  if (cells[i0] & E && isNaN(parentArray[i1 = i0 + 1])) parentArray[i1] = i0, fillEast(i0), frontier.push(i1);
  if (cells[i0] & W && isNaN(parentArray[i1 = i0 - 1])) parentArray[i1] = i0, fillEast(i1), frontier.push(i1);
  if (cells[i0] & S && isNaN(parentArray[i1 = i0 + cellWidth])) parentArray[i1] = i0, fillSouth(i0), frontier.push(i1);
  if (cells[i0] & N && isNaN(parentArray[i1 = i0 - cellWidth])) parentArray[i1] = i0, fillSouth(i1), frontier.push(i1);
}

function fillPath(i1:any) {
  while (true) {
    fillCell(i1);
    var i0 = parentArray[i1];
    if (i0 == null) break;
    (Math.abs(i0 - i1) === 1 ? fillEast : fillSouth)(Math.min(i0, i1));
    i1 = i0;
  }
}

function score(i:any) {
  var x = goalX - (i % cellWidth), y = goalY - (i / cellWidth | 0);
  return x * x + y * y;
}

function fillCell(i:any) {
  var x = i % cellWidth, y = i / cellWidth | 0;
  context.fillRect(x * cellSize + (x + 1) * cellSpacing, y * cellSize + (y + 1) * cellSpacing, cellSize, cellSize);
}

function fillEast(i:any) {
  var x = i % cellWidth, y = i / cellWidth | 0;
  context.fillRect((x + 1) * (cellSize + cellSpacing), y * cellSize + (y + 1) * cellSpacing, cellSpacing, cellSize);
}

function fillSouth(i:any) {
  var x = i % cellWidth, y = i / cellWidth | 0;
  context.fillRect(x * cellSize + (x + 1) * cellSpacing, (y + 1) * (cellSize + cellSpacing), cellSize, cellSpacing);
}

function generateMaze(cellWidth:any, cellHeight:any) {
  var cells = new Array(cellWidth * cellHeight),
    frontier = [],
    startIndex = (cellHeight - 1) * cellWidth;

  cells[startIndex] = 0;
  frontier.push({ index: startIndex, direction: N });
  frontier.push({ index: startIndex, direction: E });

  while ((edge = popRandom(frontier)) != null) {
    var edge,
      i0 = edge.index,
      d0 = edge.direction,
      i1 = i0 + (d0 === N ? -cellWidth : d0 === S ? cellWidth : d0 === W ? -1 : +1),
      x0 = i0 % cellWidth,
      y0 = i0 / cellWidth | 0,
      x1,
      y1,
      d1,
      open = cells[i1] == null; // opposite not yet part of the maze

    if (d0 === N) x1 = x0, y1 = y0 - 1, d1 = S;
    else if (d0 === S) x1 = x0, y1 = y0 + 1, d1 = N;
    else if (d0 === W) x1 = x0 - 1, y1 = y0, d1 = E;
    else x1 = x0 + 1, y1 = y0, d1 = W;

    if (open) {
      cells[i0] |= d0, cells[i1] |= d1;
      if (y1 > 0 && cells[i1 - cellWidth] == null) frontier.push({ index: i1, direction: N });
      if (y1 < cellHeight - 1 && cells[i1 + cellWidth] == null) frontier.push({ index: i1, direction: S });
      if (x1 > 0 && cells[i1 - 1] == null) frontier.push({ index: i1, direction: W });
      if (x1 < cellWidth - 1 && cells[i1 + 1] == null) frontier.push({ index: i1, direction: E });
    }
  }

  return cells;
}

function popRandom(array:any) {
  if (!array.length) return;
  var n = array.length, i = Math.random() * n | 0, t;
  t = array[i], array[i] = array[n - 1], array[n - 1] = t;
  return array.pop();
}