(function (global) {
    var toAsc = (val) => val.charCodeAt(),
        toChr = (val) => String.fromCharCode(val),
        toNum = (val) => val * 1,
        maxVal = (val1, val2) => val1 > val2 ? val1 : val2,
        minVal = (val1, val2) => val1 < val2 ? val1 : val2,
        isExist = (obj, val) => obj.indexOf(val) > -1,
        getColName = (crd) => crd[0],
        getRowName = (crd) => crd.substr(1, 2);
    class GridBoard {
        constructor(w, h) {
            this.grids = {};
            this.height = h;
            this.width = w;
            for (var i = 0; i < w; i++)
                for (var j = 0; j < h; j++) {
                    var crd = String.fromCharCode(65 + i) + (j + 1),
                        grid = new this.Grid(crd, this);
                    this.grids[crd] = grid;
                }
        }
        getGridByCrd(crd) { return this.grids[crd]; }
        getGridsByCrd(crd) {
            var grids = [];
            crd = crd.replace(/ /g, "");
            if (isExist(crd, ",")) {
                crd = crd.split(",");
                for (var s = 0; s < crd.length; s++)
                    grids = grids.concat(this.getGridsByCrd(crd[s]));
                return grids;
            }
            if (isExist(crd, ":")) {
                var val = crd.split(":"),
                    minColName, maxColName,
                    minRowName, maxRowName;
                for (var s = 0; s < 2; s++) {
                    var colName, rowName;
                    if (val[s].length < 2) {
                        if (isNaN(val[s])) colName = val[s];
                        else rowName = val[s];
                    } else {
                        if (isNaN(val[s])) {
                            colName = getColName(val[s]);
                            rowName = getRowName(val[s]);
                        } else rowName = val[s];
                    }
                    if (!maxColName) {
                        maxColName = colName;
                        minColName = colName;
                    } else if (colName) {
                        var colName1 = maxColName,
                            colName2 = colName;
                        maxColName = maxVal(colName1, colName2);
                        minColName = minVal(colName1, colName2);
                    }
                    if (!maxRowName) {
                        maxRowName = rowName;
                        minRowName = rowName;
                    } else if (rowName) {
                        var rowName1 = maxRowName | 0,
                            rowName2 = rowName | 0;
                        maxRowName = maxVal(rowName1, rowName2);
                        minRowName = minVal(rowName1, rowName2);
                    }
                }
                for (var col = toAsc(minColName); col < toAsc(maxColName) + 1; col++)
                    for (var row = minRowName; row < toNum(maxRowName) + 1; row++)
                        grids.push(this.grids[toChr(col) + row]);
                return grids;
            }
            if (crd.length == 1 && isNaN(crd))
                return this.getGridsByCrd(crd + "1:" + this.height);
            else if (!isNaN(crd))
                return this.getGridsByCrd("A:" + toChr(this.height + 64) + crd);
            return [this.grids[crd]];
        }
    }
    GridBoard.prototype.Grid = class {
        constructor(crd, board) {
            this.crd = crd;
            this.board = board;
            this._ = {};
        }
        onget(name, func) { this.__defineGetter__(name, func); }
        onset(name, func) { this.__defineSetter__(name, func); }
        getColName(crd = this.crd) { return crd[0]; }
        getRowName(crd = this.crd) { return crd.substr(1, 2); }
        getRelCrdByCrd(crd) {
            var gridColName = toAsc(this.getColName()),
                crdColName = toAsc(getColName(crd)),
                colChange = gridColName - crdColName,
                gridRowName = toNum(this.getRowName()),
                crdRowName = toNum(getRowName(crd)),
                rowChange = gridRowName - crdRowName;
            return (Math.sign(rowChange) > 0 ? (rowChange + "F") : Math.sign(rowChange) < 0 ? (Math.abs(rowChange) + "B") : "") +
                (Math.sign(colChange) > 0 ? (colChange + "L") : Math.sign(colChange) < 0 ? (Math.abs(colChange) + "R") : "");
        }
        getRelCrdsByCrds() {
            var crds = arguments, relCrds = [];
            if (crds[0] instanceof Array) crds = crds[0];
            for (var s = 0; s < crds.length; s++)
                relCrds.push(this.getRelCrdByCrd(crds[s]));
            return relCrds;
        }
        getRelCrdByGrid(grid) { return this.getRelCrdByCrd(grid.crd); }
        getRelCrdsByGrids() {
            var grids = arguments, relCrds = [];
            if (grids[0] instanceof Array) grids = grids[0];
            for (var s = 0; s < grids.length; s++)
                relCrds.push(this.getRelCrdByCrd(grids[s].crd));
            return relCrds;
        }
        getGridByRelCrd(relCrd) { return this.board.grids[this.getCrdByRelCrd(relCrd)]; }
        getGridsByRelCrd(relCrd) {
            var crds = this.getCrdsByRelCrd(relCrd), grids = [];
            for (var s = 0; s < crds.length; s++)
                grids.push(this.board.grids[crds[s]]);
            return grids;
        }
        getCrdByRelCrd(relCrd) {
            var colName = this.getColName(), colChange = 0,
                rowName = this.getRowName(), rowChange = 0,
                val = relCrd.replace(/F|B|R|L/g, "");
            if (!isNaN(val) && val != "") {
                var repeatRelCrd = relCrd.replace(val, "");
                relCrd = "";
                for (var i = 0; i < val; i++) relCrd += repeatRelCrd;
                return this.getCrdByRelCrd(relCrd);
            }
            for (var s = 0; s < relCrd.length; s++)
                rowChange += relCrd[s] == "F" ? -1 : relCrd[s] == "B" ? 1 : 0,
                    colChange += relCrd[s] == "R" ? 1 : relCrd[s] == "L" ? -1 : 0;
            return toChr(toAsc(colName) + colChange) + (toNum(rowName) + rowChange);
        }
        getCrdsByRelCrd(relCrd) {
            var crds = [],
                val = relCrd.replace(/F|B|R|L|E|X|O|I|H/g, "");
            relCrd = relCrd.replace(/ /g, "");
            if (isExist(relCrd, ",")) {
                relCrd = relCrd.split(",");
                for (var s = 0; s < relCrd.length; s++)
                    crds = crds.concat(this.getCrdsByRelCrd(relCrd[s]));
                return crds;
            } else if (isExist(relCrd, "~")) {
                var start = 1,
                    relCrd = relCrd.replace(val, "");
                val = val.split("~");
                if (!val[0]) val[0] = 1;
                var end = val[1];
                for (var i = start; i <= end; i++)
                    crds = crds.concat(this.getCrdByRelCrd(i + relCrd));
                return crds;
            }
            if (!isNaN(val) && val != "") {
                var val = toNum(val),
                    repeatRelCrd = relCrd.replace(val, "");
                relCrd = "";
                for (var i = 0; i < val; i++)
                    relCrd += repeatRelCrd;
                return this.getCrdsByRelCrd(relCrd);
            }
            if (isExist(relCrd, "E"))
                return this.getCrdsByRelCrd(relCrd.replace(/E/g, "I") + "," + relCrd.replace(/E/g, "H"));
            if (isExist(relCrd, "X"))
                return this.getCrdsByRelCrd(relCrd.replace(/X/g, "IH"));
            if (isExist(relCrd, "O"))
                return this.getCrdsByRelCrd(relCrd.replace(/O/g, "E") + "," + relCrd.replace(/O/g, "X"));
            if (isExist(relCrd, "I")) {
                var dir = "FB";
                for (var s = 0; s < 2; s++)
                    crds = crds.concat(this.getCrdsByRelCrd(relCrd.replace(/I/g, dir[s])));
                return crds;
            }
            if (isExist(relCrd, "H")) {
                var dir = "RL";
                for (var s = 0; s < 2; s++)
                    crds = crds.concat(this.getCrdsByRelCrd(relCrd.replace(/H/g, dir[s])));
                return crds;
            }
            return [this.getCrdByRelCrd(relCrd)];
        }
    };
    global.GridBoard = GridBoard;
})(this);