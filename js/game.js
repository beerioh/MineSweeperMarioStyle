'use strict'
var renderBoardCounter = 0
var timeCounter = 0
var gFlagCounter=0
var gBoard
var gameCounter=-1
var gMineCounter=2
var gInterval
var checkNeighborsCounter
var audio
let volume = document.getElementById("volume-control");
var isHintClick=false
// setVolume ()


volume.addEventListener('change', setVolume);
volume.addEventListener('input', setVolume);
const startGameSound = document.getElementById('startGameAudio')
const changeLevelSound = document.getElementById('difficultyLevel')
const winingSound = document.getElementById('winingGameAudio')
const loosingSound = document.getElementById('endGameAudio')
const flagOnSound = document.getElementById('flagOn')
const flagOffSound = document.getElementById('flagOff')
const clickGoodSound = document.getElementById('clickGood')
const lifeLostSound = document.getElementById('lifeLost')
const emojiImg = document.querySelector(".emoji")
const victoryImg = document.querySelector(".gameContainer")
const gGameBoard = document.querySelector(".board")
const FLAG_IMG = `src="img/flag.png"`
const beginner = {i: 4,j:4, m: 2 };
const advanced = { i: 8, j: 8 ,m:14}
const expert = { i: 12, j: 12, m: 32 }
const bored = { i: 16, j: 30, m: 70 }
var difficultyLevel = beginner
var mineLevel = document.getElementById("status").addEventListener('change', function () {
    
    if (document.getElementById("Beginner").checked) {
       changeLevelSound.play();
       difficultyLevel = beginner
       gMineCounter = beginner.m
       gameCounter = -1
       emojiImg.style.backgroundImage ="url(img/Beginner-emoji.gif)";
       emojiImg.style.backgroundSize = '100%';
   }
    if (document.getElementById("Advanced").checked) {
     changeLevelSound.play();
     difficultyLevel = advanced
     gMineCounter = advanced.m
     gameCounter = -1
     emojiImg.style.backgroundImage = "url(img/expert-emoji.gif)";
     emojiImg.style.backgroundSize = '115%';
   }
    if (document.getElementById("Expert").checked) {
       changeLevelSound.play();
       difficultyLevel = expert
       gMineCounter = expert.m
       gameCounter = -1
       emojiImg.style.backgroundImage = "url(img/expert2-emoji.gif)";
       emojiImg.style.backgroundSize = '100%';
   }
    if (document.getElementById("Bored").checked) {
        changeLevelSound.play();
        difficultyLevel = bored
        gMineCounter = bored.m
        gameCounter = -1
        emojiImg.style.backgroundImage = "url(img/Bored-emoji.gif)";
        emojiImg.style.backgroundSize = '100%';
   }
    initGame()
    renderMineCounter()
})
     
function initGame() {
    removeHideFromHint()
    renderMineCounter()
    renderLivesCounter()
    gameCounter++
    gBoard = buildBoard(difficultyLevel)
    renderBoard(gBoard)
    clearInterval(gInterval)
    counterInterval(gInterval)
    lifeCounter(gameCounter)
    startGameSound.play()
}
function buildBoard(board) {
    const buildArray = []
    
    for (var i = 0; i < board.i; i++) {
        buildArray.push([])
        for (var j = 0; j < board.j; j++) {
            buildArray[i][j] = {
        minesAroundCount: "",
        isShown: false,
        isMine: false,
        checkNeighborsCounter: 0,
        noClick: false,
        isFlagged: false,
        isGreen: false,
        isRed: false,
        isShowHint: false,
        isClearHint:false
     } 
     }
     }
    var arrayWithMine = createMineIndex(buildArray)
    for (let i = 0; i < arrayWithMine.length; i++) {
        for (let j = 0; j < arrayWithMine[0].length; j++) {
            if (arrayWithMine[i][j].isMine) continue
            arrayWithMine[i][j].minesAroundCount =countMinesAround(i,j,arrayWithMine)
        }
    }return arrayWithMine
}
function createMineIndex(buildArray) {
    var numbers = [];
    gMineCounter = difficultyLevel.m
    gFlagCounter = 0
    var min, max, r, n, p;
    min = 0;
    max =  difficultyLevel.i * difficultyLevel.j -1;
    r = difficultyLevel.m; 
    for (let i = 0; i < r; i++) {
        do {
            n = Math.floor(Math.random() * (max - min + 1)) + min;
            p = numbers.includes(n);
            if (!p) {
                numbers.push(n)
                buildArray[Math.floor(n / difficultyLevel.j)][n % difficultyLevel.j].isMine = true
                }
        } while (p);
    }return buildArray
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
    }return mineCount
}
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var mineCountShow = ""
            var currCell = board[i][j]
            var cellClass = 'cell-' + i + '-' + j
            if (currCell.mineClicked) { cellClass += ' show mineImg' }
            if (!currCell.checkNeighborsCounter &&!currCell.minesAroundCount && currCell.isShown) {currCell.checkNeighborsCounter=1
                checkNeighbors(i,j)}
            if (currCell.isShown) {cellClass += ' show clearBg', mineCountShow = currCell.minesAroundCount }//checkNeighbors(i, j)
            if (currCell.isMine && currCell.isShown) {cellClass += ' show mineImg', currCell.minesAroundCount = "" }
            if (currCell.noClick && !currCell.isFlagged) {cellClass += ' noClick'}
            if (currCell.isFlagged) { cellClass += ' flagged' }
            if (currCell.isFlagged&&currCell.isMine&&currCell.isShown) {cellClass += ' bgGreen'}
            if (currCell.isFlagged&&!currCell.isMine&&currCell.isGreen||currCell.isMine&&currCell.isRED) {cellClass += ' bgRed'}
            if (currCell.isShowHint) {
                cellClass += ' show clearBg',
                mineCountShow = currCell.minesAroundCount
            }
            if (currCell.isClearHint) {
                var removeClass = document.querySelector(`.cell-${i}-${j}`)
                removeClass.classList.remove('clearBg')
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
    if (isHintClick) {
        for (var k=i - 1; k <= i + 1; k++) {
            if (k < 0 || k >= gBoard.length) continue
            for (var l = j - 1; l <= j + 1; l++) {
                var currCell = gBoard[k][l]
                if (l < 0 || l >= gBoard[0].length) continue
                // if (k === i && l === k) continue
                if (currCell.isShown) continue
                // if (currCell.isShowHint)
                    setTimeout(function() {isClearHint()}, 500);
                    gBoard[k][l].isShowHint = true 
                }
            renderBoard(gBoard)
            setTimeout(function() {renderBoard(gBoard)}, 1000);
        }
         isHintClick = false
        gGameBoard.style.backgroundColor = "#a1cff0"
        return
    }
    if (gBoard[i][j].isFlagged) { return }
    if (!gBoard[i][j].minesAroundCount&&!isHintClick) {
        checkNeighbors(i, j)
    !gBoard[i][j].isShown
    }
    if (gBoard[i][j].isMine&&!isHintClick) {
        gBoard[i][j].isRed=true
        mineClicked()
    }
    else if(!isHintClick){
        clickGoodSound.play()
        gBoard[i][j].isShown = true
        // document.querySelector(`.cell-${i}-${j}`).classList.add('show')
        renderBoard(gBoard)
        
    }
}
function checkNeighbors(rowIdx, colIdx) {
    for (var i = rowIdx-1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx +1; j++) {
            var currCell = gBoard[i][j]
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (currCell.isShown) continue
            currCell.isShown = true
        }
    } renderBoard(gBoard)
    renderBoardCounter++
}
function hintUse(number) {
    var hintClass = document.querySelector(`.hint${number}`)
    hintClass.classList.add('hide')
    gGameBoard.style.backgroundColor = "gold"
    isHintClick=true
}
function mineClicked() {
    startGameSound.pause()
    loosingSound.play()
    gGameBoard.style.display="none"
    emojiImg.style.backgroundImage = "url(img/crying-emoji.gif)";
    victoryImg.style.backgroundImage = "url(img/gameOver.gif)";
    setTimeout(() => {
        gGameBoard.style.display="flex"
        emojiImg.style.backgroundImage = "url(img/Beginner-emoji.gif)"
        victoryImg.style.backgroundImage = "none";
        startGameSound.play()
    }, 4500);
    clearInterval(gInterval)
    
    
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isFlagged) {
                gBoard[i][j].isGreen=true
                gBoard[i][j].noClick=true
           }
           if (gBoard[i][j].isMine) {
               gBoard[i][j].isShown = true 
              
               gBoard[i][j].noClick = true
          }else{gBoard[i][j].noClick = true}
       }
   }renderBoard(gBoard)
}
function flagCell(i, j) {
    document.addEventListener('contextmenu', event => event.preventDefault());
    var cellFlagging = document.querySelector(`.cell-${i}-${j}`)
        if (gBoard[i][j].isShown)  return 
    if (!gBoard[i][j].isFlagged) {
            flagOnSound.play()
            gFlagCounter++
            gBoard[i][j].isFlagged = true
        }else{
        gBoard[i][j].isFlagged = false
        flagOffSound.play()
            gFlagCounter--
            cellFlagging.classList.remove('noClick')
            cellFlagging.classList.remove('flagged')
        }
        var elMineCounter = document.querySelector(".score")
            elMineCounter.innerText = gMineCounter - gFlagCounter
        if (gMineCounter - gFlagCounter === 0) {checkVictory()}
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
            lifeLostSound.play()
            spaceL3.classList.add("hide")
    break;
        case 2:
             lifeLostSound.play()
            spaceL2.classList.add("hide")
    break;
        case 3:
             lifeLostSound.play()
            spaceL1.classList.add("hide")
            
}
}
function checkVictory() {
    
    var correct=0
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            
            if (!gBoard[i][j].isFlagged) {continue}
            if (gBoard[i][j].isMine) {correct++}
            if (correct === difficultyLevel.m) {
                startGameSound.pause()
                winingSound.play()
                gameCounter = -1
                emojiImg.style.backgroundImage = "url(img/happy-emoji.gif)";
                emojiImg.style.backgroundSize = '120%';
                victoryImg.style.backgroundImage = "url(img/winner.gif)";
                gGameBoard.style.display="none"
                
                setTimeout(() => {
                    victoryImg.style.backgroundImage= "none"
                    emojiImg.style.backgroundImage = "url(img/Beginner-emoji.gif)"
                    emojiImg.style.backgroundSize = '100%';
                    gGameBoard.style.display="flex"
                    startGameSound.play()
                }, 6000);
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
function setVolume (){
  console.clear()
  Array.from(document.querySelectorAll("audio")).forEach(function(audio){
      audio.volume = volume.value == "" ? 50 : volume.value / 100;
    })
}
function isClearHint() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isShowHint) {
                gBoard[i][j].isShowHint = false
                gBoard[i][j].isHintClick = true
            }
            
        
    
    
        }
    
    
    }
}
function removeHideFromHint() {
    var hintClass1 = document.querySelector('.hint1')
    var hintClass2 = document.querySelector('.hint2')
    var hintClass3 = document.querySelector('.hint3')
    hintClass1.classList.remove('hide')
    hintClass2.classList.remove('hide')
    hintClass3.classList.remove('hide')
    isHintClick=false
}

