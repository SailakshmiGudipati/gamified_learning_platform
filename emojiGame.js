const gameArea = document.getElementById('gameArea');
const basket = document.getElementById('basket');
const catchScore = document.getElementById('catchScore');

let score = 0;
let misses = 0;
let level = 1;
let emojiFallSpeed = 5;
let createIntervalTime = 1000;
const maxMisses = 3;
let basketPosition = 130;
let emojisFalling = [];
let gameOver = false;

const basketWidth = 50;
const basketHeight = 50;
const gameWidth = 300;
const gameHeight = 400;
const emojiSize = 28;
const emojis = ['🍎','🍌','🍇','🍒','🍉','🍍'];

document.addEventListener('keydown', (e) => {
  if(gameOver) return;
  if(e.key === 'ArrowLeft') basketPosition = Math.max(0, basketPosition - 20);
  if(e.key === 'ArrowRight') basketPosition = Math.min(gameWidth - basketWidth, basketPosition + 20);
  basket.style.left = basketPosition + 'px';
});

function createEmoji() {
  if(gameOver) return;
  const emojiDiv = document.createElement('div');
  emojiDiv.innerText = emojis[Math.floor(Math.random() * emojis.length)];
  emojiDiv.classList.add('emoji');
  emojiDiv.style.top = '0px';
  emojiDiv.style.left = Math.floor(Math.random() * (gameWidth - emojiSize)) + 'px';
  gameArea.appendChild(emojiDiv);
  emojisFalling.push(emojiDiv);
}

function updateScore() {
  catchScore.innerText = `Score: ${score} | Misses: ${misses}/${maxMisses} | Level: ${level}`;
}

function checkLevelUp() {
  const newLevel = Math.floor(score / 5) + 1;
  if(newLevel > level) {
    level = newLevel;
    emojiFallSpeed += 2;
    clearInterval(createInterval);
    createInterval = setInterval(createEmoji, Math.max(300, createIntervalTime - level*100));
    updateScore();
  }
}

function moveEmojis() {
  if(gameOver) return;
  emojisFalling.forEach((emoji, index) => {
    let top = parseInt(emoji.style.top);
    top += emojiFallSpeed;
    emoji.style.top = top + 'px';

    const emojiLeft = parseInt(emoji.style.left);
    const emojiRight = emojiLeft + emojiSize;
    const emojiBottom = top + emojiSize;

    const basketLeft = basketPosition;
    const basketRight = basketPosition + basketWidth;
    const basketTop = gameHeight - basketHeight;

    if(emojiBottom >= basketTop && emojiRight >= basketLeft && emojiLeft <= basketRight) {
      score++;
      updateScore();
      checkLevelUp();
      gameArea.removeChild(emoji);
      emojisFalling.splice(index,1);
    } else if(top > gameHeight) {
      misses++;
      gameArea.removeChild(emoji);
      emojisFalling.splice(index,1);
      updateScore();
      if(misses >= maxMisses) {
        gameOver = true;
        alert(`Game Over! Your score: ${score}, Level: ${level}`);
      }
    }
  });
}

let createInterval;
let moveInterval;

function startGame() {
  score = 0;
  misses = 0;
  level = 1;
  emojiFallSpeed = 5;
  gameOver = false;
  emojisFalling.forEach(e => e.remove());
  emojisFalling = [];
  updateScore();

  createInterval = setInterval(createEmoji, createIntervalTime);
  moveInterval = setInterval(moveEmojis, 50);
}
