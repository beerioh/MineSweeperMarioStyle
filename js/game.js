'use strict'

var timeCounter = 0
var gFlagCounter=0
var gBoard
var gameCounter=-1
var gMineCounter=2
var gInterval
var checkNeighborsCounter
var audio
let volume = document.getElementById("volume-control");
setVolume ()
function setVolume (){
  console.clear()
  Array.from(document.querySelectorAll("audio")).forEach(function(audio){
      audio.volume = volume.value == "" ? 50 : volume.value / 100;
    })
};
volume.addEventListener('change', setVolume);
volume.addEventListener('input', setVolume);
var startGameSound = document.getElementById('startGameAudio')
var changeLevelSound = document.getElementById('difficultyLevel')
var winingSound = document.getElementById('winingGameAudio')
var loosingSound = document.getElementById('endGameAudio')
const emojiImg = document.querySelector(".emoji")
const victoryImg = document.querySelector(".gameContainer")
const FLAG_IMG = `src="../img/flag.png"`
const beginner = {i: 4,j:4, m: 2 };
const advanced = { i: 8, j: 8 ,m:14}
const expert = { i: 12, j: 12, m: 32 }
const bored = { i: 16, j: 30, m: 70 }
var difficultyLevel = beginner

var mineLevel = document.getElementById("status").addEventListener('change',function(){
    if (document.getElementById("Beginner").checked) {
       changeLevelSound.play();
       difficultyLevel = beginner
       gMineCounter = beginner.m
       gameCounter = -1
       emojiImg.style="backgroundImage = \"url(../img/Beginner-emoji.gif)";
       emojiImg.style.backgroundSize = '100%';
   }
    if (document.getElementById("Advanced").checked) {
     changeLevelSound.play();
     difficultyLevel = advanced
     gMineCounter = advanced.m
     gameCounter = -1
     emojiImg.style.backgroundImage = "url(../img/expert-emoji.gif)";
     emojiImg.style.backgroundSize = '115%';
 }
    if (document.getElementById("Expert").checked) {
       changeLevelSound.play();
       difficultyLevel = expert
       gMineCounter = expert.m
       gameCounter = -1
       emojiImg.style.backgroundImage = "url(../img/expertt-emoji.gif)";
       emojiImg.style.backgroundSize = '100%';
    }
    if (document.getElementById("Bored").checked) {
        changeLevelSound.play();
        difficultyLevel = bored
        gMineCounter = bored.m
        gameCounter = -1
        emojiImg.style.backgroundImage = "url(../img/Bored-emoji.gif)";
        emojiImg.style.backgroundSize = '100%';
       
    }
    initGame()
    renderMineCounter()
})
     
function initGame() {
    startGameSound.play()
    renderMineCounter()
    renderLivesCounter()
    gameCounter++
    gBoard = buildBoard(difficultyLevel)
    renderBoard(gBoard)
    clearInterval(gInterval)
    counterInterval(gInterval)
    lifeCounter(gameCounter)   
}
function buildBoard(board) {
    const buildArray = []
    var cellNumber = 0
    var mineIndex = createMineIndex(board)
    for (var i = 0; i < board.i; i++) {
        buildArray.push([])
        for (var j = 0; j < board.j; j++) {
        buildArray[i][j] = {
        index:cellNumber++,
        minesAroundCount: "",
        isShown: false,
        isMine: false,
        checkNeighborsCounter: 0,
        noClick: false,
        isFlagged: false,
        mineClicked:false
            } 
        }
    }
    for (let i = 0; i < mineIndex.length; i++) {
        var y = Math.floor(mineIndex[i] / (board.j))
        var x = mineIndex[i] % board.j
        buildArray[y][x].isMine = true 
    }

    for (let i = 0; i < buildArray.length; i++) {
        for (let j = 0; j < buildArray[0].length; j++) {
            if (buildArray[i][j].isMine) continue
            buildArray[i][j].minesAroundCount = countMinesAround(i,j,buildArray)
            
        }
        
    }
    return buildArray
}
function countMinesAround(rowIdx, colIdx,buildArray) {
        var mineCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= buildArray.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= buildArray[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = buildArray[i][j]
            if (currCell.isMine) mineCount++
           
        }
    }
    return mineCount
}
function createMineIndex(board) {
    var numbers = [];
    gMineCounter = board.m
    gFlagCounter = 0
    var min, max, r, n, p;
    min = 0;
    max =  board.i * board.j -1;
    r = board.m; // how many numbers you want to extract
    for (let i = 0; i < r; i++) {
        do {
            n = Math.floor(Math.random() * (max - min + 1)) + min;
            p = numbers.includes(n);
            if (!p) {
                numbers.push(n);
            }
        }
        while (p);
    }return numbers
}
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr class"tableRow">'
        for (var j = 0; j < board[0].length; j++) {
            var mineCountShow = ""
            var currCell = board[i][j]
            var cellClass = getClassName({ i, j })
            if (currCell.mineClicked){cellClass += ' show mineImg'}
            if (currCell.isMine && currCell.isShown) { cellClass += ' mineImg', currCell.minesAroundCount = "" }
            if (currCell.noClick) {cellClass += ' noClick'}
            if (currCell.isShown) { cellClass += ' show', mineCountShow = currCell.minesAroundCount }//checkNeighbors(i, j)
            // if (currCell.isFlagged && currCell.flagged) { cellClass += ' marked' }
            if (currCell.isFlagged) { cellClass += ' flagged' }
            if (!currCell.checkNeighborsCounter &&!currCell.minesAroundCount && currCell.isShown) {
                currCell.checkNeighborsCounter=1
                checkNeighbors(i,j)
            }
            strHTML += `<td class="cell ${cellClass} color${currCell.minesAroundCount}" oncontextmenu="flagCell(${i}, ${j})" onclick="cellClicked(this,${i}, ${j},event)">${mineCountShow}`
            
            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
 
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}
function cellClicked(elCell, i, j, event) {
    if(gBoard[i][j].isFlagged)return
    if (gBoard[i][j].isMine){ mineClicked() }
    else {
        var changeClickedCell = gBoard[i][j]
        changeClickedCell.isShown = true
        var clickedCellClass = document.querySelector(`.cell-${i}-${j}`)
        clickedCellClass.classList.add('show')
        renderBoard(gBoard)
    }
}
function checkNeighbors(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx +1; j++) {
            var currCell = gBoard[i][j]
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (currCell.isShown) continue
            currCell.isShown = true
            
        }
        }renderBoard(gBoard)
}
function mineClicked() {
    startGameSound.volume=0
    loosingSound.play()
    emojiImg.style.backgroundImage = "url(../img/crying-emoji.gif)";
    victoryImg.style.backgroundImage = "url(../img/gameOver.gif)";
    setTimeout(() => {
        emojiImg.style.backgroundImage = "url(../img/Beginner-emoji.gif)"
        victoryImg.style.backgroundImage = "none";
        startGameSound.volume = 0.2
    }, 7000);
    clearInterval(gInterval)
    
   for (let i = 0; i < gBoard.length; i++) {
       for (let j = 0; j < gBoard[0].length; j++) {
           if (gBoard[i][j].isMine) {
               gBoard[i][j].mineClicked = true 
           }
        noClick()
       }
     
   }
}
function noClick() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].noClick=true
        }
        
    } renderBoard(gBoard)
}
function flagCell(i, j) {
    document.addEventListener('contextmenu', event => event.preventDefault());
    var cellFlagging = document.querySelector(`.cell-${i}-${j}`)
    if (gBoard[i][j].isShown)  return 
        if (!gBoard[i][j].isFlagged) {
            gFlagCounter++
            gBoard[i][j].isFlagged = true
        }
        else {
            gBoard[i][j].isFlagged = false
            gFlagCounter--
            cellFlagging.classList.remove('noClick')
            cellFlagging.classList.remove('flagged')
        }
        var elMineCounter = document.querySelector(".score")
    elMineCounter.innerText = gMineCounter - gFlagCounter
    if (gMineCounter - gFlagCounter === 0) {
        checkVictory()
    }
        renderBoard(gBoard)
}
function lifeCounter(gameCounter) {
    var spaceL1 = document.querySelector(".spaceL1")
    var spaceL2 = document.querySelector(".spaceL2")
    var spaceL3 = document.querySelector(".spaceL3")
    switch (gameCounter) {
        case 0:
            spaceL2.classList.remove("hide")
            spaceL1.classList.remove("hide")
            spaceL3.classList.remove("hide")
    
    break;
        case 1:
            spaceL1.classList.add("hide")
    
    break;
        case 2:
            spaceL2.classList.add("hide")
     
    break;
        case 3:
            spaceL3.classList.add("hide")
            alert("last one! play it safe!")
}
}
function checkVictory() {
    console.log(gBoard)
    var correct=0
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            
            if (gBoard[i][j].isFlagged === false) {
                continue
            }
            if (gBoard[i][j].isMine) {
                correct++
            }
            if (correct === difficultyLevel.m) {
                gameCounter = -1
                emojiImg.style.backgroundImage = "url(../img/happy-emoji.gif)";
                victoryImg.style.backgroundImage = "url(../img/winner.gif)";
                startGameSound.volume=0
                winingSound.play()
                setTimeout(() => {
                    victoryImg.style.backgroundImage= "none"
                    emojiImg.style.backgroundImage = "url(../img/Beginner-emoji.gif)"
                    startGameSound.volume=0.2
                    initGame()
                }, 7000);
                clearInterval(gInterval)
            }
        }
    }
    }    
function renderMineCounter() {
    var elMineCounter = document.querySelector(".score")
    elMineCounter.innerText= gMineCounter
}  
function renderLivesCounter() {
    if (gameCounter === 3) {
       gameCounter=-1
   }
}
function counterInterval() {
    timeCounter=0
    gInterval = setInterval(counter, 1000)
}
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}
function counter() {
    timeCounter++
    var timer = document.querySelector(".timer")
    if (timeCounter === 999) {
        timeCounter=0
    }
    else {
        timer.innerText = timeCounter
    }

}