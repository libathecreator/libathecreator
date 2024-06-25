// Variáveis do jogo
let ball;
let playerPaddle;
let opponentPaddle;
let playerScore = 0;
let opponentScore = 0;
let gameOver = false;
let resetButton;
let gameMusic;
let hitSound;

function preload() {
  // Carregar a música do jogo
  soundFormats('mp3', 'ogg');
  gameMusic = loadSound('trilha.mp3');

  // Carregar o som de batida da bola
  hitSound = loadSound('raquetada.mp3');
}

function setup() {
  createCanvas(600, 400);
  ball = new Ball();
  playerPaddle = new Paddle(true);
  opponentPaddle = new Paddle(false);
  
  // Botão de reset
  resetButton = createButton('Reiniciar');
  resetButton.position(width - 100, height - 40);
  resetButton.style('font-size', '16px');
  resetButton.style('padding', '10px 20px');
  resetButton.mousePressed(resetGame);
  resetButton.hide();

  // Tocar a música do jogo
  if (gameMusic.isLoaded()) {
    gameMusic.loop();
  } else {
    console.error("Erro ao carregar a música.");
  }
}

function draw() {
  background(221,160,221);
  
  if (!gameOver) {
    // Exibir placar
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text(playerScore, width / 4, 50);
    text(opponentScore, 3 * width / 4, 50);

    // Movimento e desenho da bola
    ball.update();
    ball.edges();
    ball.show();

    // Movimento e desenho das paletas
    playerPaddle.show();
    opponentPaddle.show();
    playerPaddle.update();
    opponentPaddle.update();

    // Checar colisões da bola com as paletas
    if (ball.hits(playerPaddle) || ball.hits(opponentPaddle)) {
      ball.xSpeed *= -1;
      ball.increaseSpeed(); // Aumenta a velocidade da bola a cada colisão

      // Tocar o som de batida da bola
      if (hitSound.isLoaded()) {
        hitSound.play();
      } else {
        console.error("Erro ao carregar o som de batida da bola.");
      }
    }

    // Checar pontuação
    if (ball.isOut()) {
      if (ball.xSpeed > 0) {
        playerScore++;
      } else {
        opponentScore++;
      }
      ball.reset();
    }

    // Verificar se o jogo acabou
    if (playerScore >= 11 || opponentScore >= 11) {
      gameOver = true;
      resetButton.show();
      gameMusic.stop(); // Parar a música quando o jogo acabar
    }
  } else {
    // Mostrar mensagem de fim de jogo
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text("✩ FIM DE JOGO ✩", width / 2, height / 2 - 40);
    text("Sua Pontuação: " + playerScore, width / 2, height / 2);
    text("Pontuação do oponente: " + opponentScore, width / 2, height / 2 + 40);
}
}

// Função para reiniciar o jogo
function resetGame() {
  playerScore = 0;
  opponentScore = 0;
  gameOver = false;
  ball.reset();
  resetButton.position(width - 100, height - 40); // Reposiciona o botão no canto inferior direito
  resetButton.hide(); // Esconde o botão após ser clicado
  if (gameMusic.isLoaded()) {
    gameMusic.loop(); // Reiniciar a música quando o jogo reiniciar
  }
}

// Classe Ball
class Ball {
  constructor() {
    this.r = 12;
    this.startSpeed = 5; // Velocidade inicial após reset
    this.maxSpeed = 7; // Velocidade máxima da bola
    this.reset();
  }

  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  show() {
    ellipse(this.x, this.y, this.r * 2);
  }

  edges() {
    if (this.y < 0 || this.y > height) {
      this.ySpeed *= -1;
    }
  }

  hits(paddle) {
    if (this.x - this.r < paddle.x + paddle.w / 2 &&
      this.x + this.r > paddle.x - paddle.w / 2 &&
      this.y - this.r < paddle.y + paddle.h / 2 &&
      this.y + this.r > paddle.y - paddle.h / 2) {
      return true;
    }
    return false;
  }

  reset() {
    this.x = width / 2;
    this.y = height / 2;
    let angle = random(-PI / 4, PI / 4); // Aleatoriza o ângulo inicial
    this.xSpeed = this.startSpeed * cos(angle) * (random() > 0.5 ? 1 : -1);
    this.ySpeed = this.startSpeed * sin(angle);

    // Garantir que a bola não se mova muito horizontalmente
    while (abs(this.ySpeed) < this.startSpeed * 0.3) {
      angle = random(-PI / 2, PI / 4);
      this.xSpeed = this.startSpeed * cos(angle) * (random() > 0.5 ? 1 : -1);
      this.ySpeed = this.startSpeed * sin(angle);
    }
  }

  isOut() {
    return (this.x - this.r < 0 || this.x + this.r > width);
  }

  increaseSpeed() {
    if (abs(this.xSpeed) < this.maxSpeed) {
      this.xSpeed *= 1.1;
    }
    if (abs(this.ySpeed) < this.maxSpeed) {
      this.ySpeed *= 1.1;
    }
  }
}

// Classe Paddle
class Paddle {
  constructor(isLeft) {
    this.w = 10;
    this.h = 80; // Reduzindo a altura da raquete
    this.y = height / 2;
    this.isLeft = isLeft;
    if (this.isLeft) {
      this.x = this.w;
    } else {
      this.x = width - this.w;
    }
    this.randomMoveTimer = 0;
    this.ySpeed = 0;
  }

  show() {
    fill(255);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h);
  }

  update() {
    if (this.isLeft) {
      // Controlar a raquete do jogador com as setas do teclado
      if (keyIsDown(UP_ARROW)) {
        this.y -= 7;
      } else if (keyIsDown(DOWN_ARROW)) {
        this.y += 5;
      }
    } else {
      // Movimento baseado na posição y da bola
      let paddleSpeed = 5;
      let errorRate = 0.4; // taxa de erro aumentada
      let targetY = ball.y + random(-ball.r * errorRate, ball.r * errorRate);
      if (this.y < targetY - paddleSpeed) {
        this.y += paddleSpeed;
      } else if (this.y > targetY + paddleSpeed) {
        this.y -= paddleSpeed;
      }
    }
    this.y = constrain(this.y, this.h / 2, height - this.h / 2);
  }
}