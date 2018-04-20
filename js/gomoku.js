var board = new ViewableBoard(11, 11), //board為新的可見棋盤，大小為11x11
    player = { //player為目前玩家
        piece: "B", //玩家擲棋為B(黑方)或W(白方)
        change: function () { //玩家的交換
            if (player.piece == "B") //若玩家擲棋為B
                player.piece = "W"; //玩家擲棋改為W
            else //反之
                player.piece = "B"; //玩家擲棋改為B
        },
        winner: "" //贏家現不存在
    },
    gomokuJudge = function (grid) {
        var piece = grid.getStatus("piece"), //格子上現在的棋子
            relCrd = ["F", "R", "FR", "FL"], //方向(F:前,B:後,R:右,L:左)
            rvRelCrd = ["B", "L", "BL", "BR"]; //反方向
        for (var i = 0; i < relCrd.length; i++) {
            var relUnit = 1, //方向單位長
                rvRelUnit = 1, //反方向單位長
                count = 1; //棋子數量
            while (true) {
                var relGrid = grid.getGridByRelCrd(relUnit + relCrd[i]);
                //取得格子藉由方向
                if (!relGrid) //若格子不存在
                    break; //已未成一線，離開迴圈
                if (relGrid.getStatus("piece") == piece) //若該項格子上的棋子為相同
                    count++; //數量增加
                else //反之
                    break; //已未成一線，離開迴圈
                relUnit++; //單位增加，以取得下一格子的狀態
            }
            while (true) {
                var rvRelGrid = grid.getGridByRelCrd(rvRelUnit + rvRelCrd[i]);
                //取得格子藉由方向
                if (!rvRelGrid) //若格子不存在
                    break; //已未成一線，離開迴圈
                if (rvRelGrid.getStatus("piece") == piece) //若該項格子上的棋子為相同
                    count++; //數量增加
                else //反之
                    break; //已未成一線，離開迴圈
                rvRelUnit++; //單位增加，以取得下一格子的狀態
            }
            if (count >= 5) { //若該方向的棋子數量超過5顆時
                player.winner = piece; //贏家為擲棋方
                break; //勝負已分，離開迴圈
            }
        }
        var gameResult = ""; //遊戲結果
        if (player.winner) //贏家存在時
            gameResult = player.winner + " win"; //判擲棋方為贏家
        if (board.record.length == board.width * board.height) //棋盤滿時
            gameResult = "draw"; //判為平手
        if (gameResult) { //遊戲有結果時
            //board.clean(); //清除棋盤
            player.winner = !player.winner ? "D" : player.winner;
            console.log(gameResult);
        }
    };
board.container = document.body; //棋盤的容器為文件主體
board.gridMode = "node"; //棋盤格子模式為下在點上(預設在格子裡)
board.setStatusMark("piece", "B", //棋盤設定狀態標記，擲棋為黑方
    function (painter, size, x, y) { //繪圖器，格子長寬，繪圖座標X,Y位置
        size -= 10; //棋子大小縮減10px
        x += 5; //繪圖座標分別增加5px
        y += 5;
        var halfSize = size / 2; //一半大小
        painter.beginPath(); //繪圖器開始路徑
        painter.fillStyle = "black"; //填色為黑
        painter.arc(x + halfSize, y + halfSize, halfSize, 0 * Math.PI, 2 * Math.PI);
        //曲線開始點為格子中心，繪製半徑為一半大小，繪製一圈
        painter.fill(); //繪圖器填色
        painter.stroke(); //繪圖器畫線
        painter.closePath(); //繪圖器結束路徑
    }
);
board.setStatusMark("piece", "W", //棋盤設定狀態標記，擲棋為白方
    function (painter, size, x, y) { //繪圖器，格子長寬，繪圖座標X,Y位置
        size -= 10; //棋子大小縮減10px
        x += 5; //繪圖座標分別增加5px
        y += 5;
        var halfSize = size / 2; //一半大小
        painter.beginPath(); //繪圖器開始路徑
        painter.fillStyle = "white"; //填色為白
        painter.arc(x + halfSize, y + halfSize, halfSize, 0 * Math.PI, 2 * Math.PI);
        //曲線開始點為格子中心，繪製半徑為一半大小，繪製一圈
        painter.fill(); //繪圖器填色
        painter.stroke(); //繪圖器畫線
        painter.closePath(); //繪圖器結束路徑
    }
);
board.ongridclick = function (grid) { //棋盤當格子被按
    if (grid.getStatus("piece") == "") { //若格子沒有棋子
        grid.setStatus("piece", player.piece); //格子放上現在玩家的棋子
        player.change(); //玩家交換
    }
    gomokuJudge(grid); //五子棋判斷
};
board.onclean = function () { //棋盤當被清除
    for (var crd in board.grids)
        board.grids[crd].setStatus("piece", ""); //將所有的棋子清除
    player.piece = "B"; //擲棋方改回黑方
    player.winner = ""; //贏家改回不存在
};
board.gameStart(); //棋盤遊戲開始