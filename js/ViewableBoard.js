class ViewableBoard extends GridBoard {
    constructor(w, h, container) {
        super(w, h);
        if (container) this.container = container;
    }
    set gridMode(mode) {
        this._.gridMode = mode;
        this.refresh();
        return mode;
    }
    get gridMode() {
        return this._.gridMode;
    }
    set container(container) {
        var w = this.width,
            h = this.height,
            view = document.createElement("canvas"),
            painter = view.getContext("2d"),
            gridSizeFromHeight = Math.floor((container.clientHeight - h - 1) / h),
            gridSizeFromWidth = Math.floor((container.clientWidth - w - 1) / w),
            gridSize = Math.min(gridSizeFromHeight, gridSizeFromWidth);
        view.height = (gridSize + 1) * h + 1;
        view.width = (gridSize + 1) * w + 1;
        view.style.margin =
            `${(container.clientHeight - view.height) / 2}px ${(container.clientWidth - view.width) / 2}px`;
        painter.imageSmoothingEnabled = false;
        painter.setTransform(1, 0, 0, 1, 0.5, 0.5);
        container.style.overflow = "hidden";
        container.appendChild(view);
        for (var i = 0; i < w; i++)
            for (var j = 0; j < h; j++)
                (function (x, y) {
                    var crd = String.fromCharCode(x + 65) + (y + 1);
                    view.addEventListener("click", function (event) {
                        var pX = event.offsetX,
                            pY = event.offsetY;
                        if (
                            pX >= x * (this.gridSize + 1) + 2 &&
                            pX <= (x + 1) * (this.gridSize + 1) &&
                            pY >= y * (this.gridSize + 1) + 2 &&
                            pY <= (y + 1) * (this.gridSize + 1)
                        ) {
                            if (this.ongridclick) {
                                this.record.push(crd);
                                this.ongridclick(this.grids[crd]);
                            }
                        }
                    }.bind(this));
                    view.addEventListener("mousemove", function (event) {
                        var pX = event.offsetX,
                            pY = event.offsetY;
                        if (
                            pX >= x * (this.gridSize + 1) + 2 &&
                            pX <= (x + 1) * (this.gridSize + 1) &&
                            pY >= y * (this.gridSize + 1) + 2 &&
                            pY <= (y + 1) * (this.gridSize + 1)
                        ) this.ongridhover && this.ongridhover(this.grids[crd]);
                    }.bind(this));
                    this.grids[crd].x = x * (gridSize + 1) + 2 + (gridSize + 1) / 2;
                    this.grids[crd].y = y * (gridSize + 1) + 2 + (gridSize + 1) / 2;
                    this.grids[crd].setStatus = function (statusName, status) {
                        this.setStatusToGrid(statusName, status, this.grids[crd]);
                    }.bind(this);
                    this.grids[crd].getStatus = function (statusName) {
                        return this.getStatusFromGrid(statusName, this.grids[crd]);
                    }.bind(this);
                }).bind(this)(i, j);
        this.view = view;
        this.painter = painter;
        this.gridSize = gridSize;
        this.gridHeight = h;
        this.gridWidth = w;
        this.record = [];
        this._ = {
            container: container,
            gridMark: [],
            statusOrder: []
        };
        this.refresh();
        window.addEventListener("resize", function () {
            this.refresh();
        }.bind(this));
        return container;
    }
    get container() {
        return this._.container;
    }
    refresh() {
        var h = this.gridHeight,
            w = this.gridWidth,
            painter = this.painter,
            container = this.container,
            gridSizeFromHeight = Math.floor((container.clientHeight - h - 1) / h),
            gridSizeFromWidth = Math.floor((container.clientWidth - w - 1) / w),
            gridSize = Math.min(gridSizeFromHeight, gridSizeFromWidth),
            view = this.view;
        view.height = (gridSize + 1) * h + 1;
        view.width = (gridSize + 1) * w + 1;
        view.style.margin =
            `${(container.clientHeight - view.height) / 2}px ${(container.clientWidth - view.width) / 2}px`;
        painter.imageSmoothingEnabled = false;
        painter.setTransform(1, 0, 0, 1, 0.5, 0.5);
        this.gridSize = gridSize;
        var lineCoor = this._.gridMode == "node" ? (gridSize + 1) / 2 : 0;
        for (var i = 0; i <= h; i++) {
            painter.beginPath();
            painter.moveTo(lineCoor, i * (gridSize + 1) + lineCoor);
            painter.lineTo(view.width - lineCoor, i * (gridSize + 1) + lineCoor);
            painter.stroke();
            painter.closePath();
        }
        for (var i = 0; i <= w; i++) {
            painter.beginPath();
            painter.moveTo(i * (gridSize + 1) + lineCoor, lineCoor);
            painter.lineTo(i * (gridSize + 1) + lineCoor, view.height - lineCoor);
            painter.stroke();
            painter.closePath();
        }
        for (var i = 0; i < w; i++)
            for (var j = 0; j < h; j++)
                (function (x, y) {
                    var crd = String.fromCharCode(x + 65) + (y + 1);
                    this.grids[crd].x = x * (gridSize + 1) + 1;
                    this.grids[crd].y = y * (gridSize + 1) + 1;
                }).bind(this)(i, j);
        for (var crd in this.grids)
            for (var i = 0; i < this._.statusOrder.length; i++) {
                var statusName = this._.statusOrder[i],
                    status = this.grids[crd]._[statusName],
                    grid = this.grids[crd];
                if (this._.gridMark[statusName] && this._.gridMark[statusName][status])
                    this._.gridMark[statusName][status](this.painter, this.gridSize - 1, grid.x, grid.y);
            }
    }
    clean() {
        if (this.onclean) this.onclean();
        this.record = [];
    }
    gameStart() {
        if (this.ongamestart) this.ongamestart();
        this.clean();
    }
    clickGrid(crd) {
        if (typeof crd != "string") return this.clickGrid(crd.crd);
        this.record.push(crd);
        this.ongridclick(this.grids[crd]);
    }
    getStatusFromGrid(statusName, grid) {
        return grid._[statusName];
    }
    setStatusToGrid(statusName, status, grid) {
        grid._[statusName] = status;
        this.refresh();
    }
    setStatusMark(statusName, status, mark) {
        if (!this._.gridMark[statusName]) {
            this._.gridMark[statusName] = {};
            this._.statusOrder.push(statusName);
        }
        this._.gridMark[statusName][status] = mark;
    }
    setStatusOrder() {
        this._.statusOrder = [];
        for (var i = 0; i < arguments.length; i++)
            this._.statusOrder.push(arguments[i]);
    }
}