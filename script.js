const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const gameOverScreen = document.querySelector(".game-over-screen");
const congrats = checkpointScreen.querySelector("h2");
const livesScreen = document.querySelector(".lives-screen");
const livesCount = livesScreen.querySelector("h2");
const jumpCountDisplay = document.getElementById("jump-count");
const checkpointCount = livesScreen.querySelector("h3");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const gravity = 0.5;
let lives = 5;
let checkpointsLeft = 10;
let maxJumps = 5;
let jumpsLeft = maxJumps;
const platformPositions = [];
const checkpointPositions = [];
let isCheckpointCollisionDetectionActive = true;
let scrollOffset = 0;
let isGameRunning = false;
let hasGameOverScreenShown = false;
const proportionalSize = (size) => {
  return innerHeight < 500 ? Math.ceil((size / 500) * innerHeight) : size;
}
const checkpointHeight = proportionalSize(70);
let lastCheckpoint = { x: proportionalSize(10), y: proportionalSize(400) }; 

//Player Constructor
class Player {
  constructor() {
    this.position = {
      x: proportionalSize(10),
      y: proportionalSize(400),
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = proportionalSize(40);
    this.height = proportionalSize(40);
    this.onGround = false;
  }

  draw() {
    // Create a rounded player body
    const radius = 12; 
    ctx.fillStyle = "#99c9ff";
    ctx.beginPath();
    ctx.moveTo(this.position.x + radius, this.position.y);
    ctx.arc(this.position.x + this.width - radius, this.position.y + radius, radius, Math.PI * 1.5, Math.PI * 2); // top-right rounded
    ctx.arc(this.position.x + this.width - radius, this.position.y + this.height - radius, radius, 0, Math.PI * 0.5); // bottom-right rounded
    ctx.arc(this.position.x + radius, this.position.y + this.height - radius, radius, Math.PI * 0.5, Math.PI); // bottom-left rounded
    ctx.arc(this.position.x + radius, this.position.y + radius, radius, Math.PI, Math.PI * 1.5); // top-left rounded
  
    ctx.closePath();
    ctx.fill();

    // Sunglasses
    const eyeY = this.position.y + this.height * 0.3;
    const leftLensX = this.position.x + this.width * 0.3;
    const rightLensX = this.position.x + this.width * 0.7;
    const lensRadius = 6;

    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(leftLensX, eyeY, lensRadius, 0, Math.PI * 2);
    ctx.arc(rightLensX, eyeY, lensRadius, 0, Math.PI * 2);
    ctx.fill();

    // Frame
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftLensX - lensRadius, eyeY);
    ctx.lineTo(rightLensX + lensRadius, eyeY);
    ctx.stroke();

    // Smile
    const smileX = this.position.x + this.width / 2;
    const smileY = this.position.y + this.height * 0.6;
    const smileRadius = 8;

    ctx.beginPath();
    ctx.arc(smileX, smileY, smileRadius, 0, Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#222";
    ctx.stroke();
  }
  
  update() {
    this.draw();
    // Apply Gravity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Check if on the ground
    if (this.velocity.y !== 0) {
      this.onGround = false;
    } else {
      this.onGround = true;
    }
    
    let grounded = false;
    let onGround = false;

    //Check if player on platform or ground
    platforms.forEach(platform => {
      if (this.position.y + this.height <= platform.position.y && 
          this.position.y + this.height + this.velocity.y >= platform.position.y && 
          this.position.x + this.width > platform.position.x && 
          this.position.x < platform.position.x + platform.width) {
        // Player is on the platform
        grounded = true;
        this.position.y = platform.position.y - this.height; // Lock player to platform's surface
        this.velocity.y = 0; // Stop downward velocity when landing
      }
    });

    // If player is not on the ground (falling or mid-air)
    if (!onGround && this.position.y + this.height <= canvas.height) {
      this.velocity.y += gravity; 
    }
    this.onGround = grounded;

    // If player is on ground reset jump count
    if (this.onGround && grounded) {
      jumpsLeft = maxJumps;
      updateLivesDisplay();
    }

    // Restrict player to canvas boundaries
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y = gravity;
      }
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0;
    }

    if (this.position.x < this.width) {
      this.position.x = this.width;
    }

    if (this.position.x >= canvas.width - this.width * 2) {
      this.position.x = canvas.width - this.width * 2;
    }
  }

  reset(position) {
    this.position = {
      x: position.x,
      y: position.y
    };
    this.velocity = {
      x: 0,
      y: 0
    };
    this.onGround = false;
  }
}

//Platform Constructor
class Platform {
  constructor(x, y) {
    this.position = {
      x,
      y,
    };
    this.width = 200;
    this.height = proportionalSize(40);
  }

  draw() {
    const grassHeight = this.height * 0.2;
    const stoneHeight = this.height - grassHeight;

    // Grass Top
    const grassGradient = ctx.createLinearGradient(
      this.position.x,
      this.position.y,
      this.position.x,
      this.position.y + grassHeight
    );
    grassGradient.addColorStop(0, "#7ec850");
    grassGradient.addColorStop(1, "#4e9e29");
    ctx.fillStyle = grassGradient;
    ctx.fillRect(this.position.x, this.position.y, this.width, grassHeight);

    // Bumpy grass edge
    for (let i = 0; i < this.width; i += 8) {
      ctx.beginPath();
      ctx.arc(this.position.x + i, this.position.y + 2, 4, Math.PI, 0);
      ctx.fillStyle = "#7ec850";
      ctx.fill();
    }

    // Stone base
    const stoneY = this.position.y + grassHeight;
    const stoneGradient = ctx.createLinearGradient(
      this.position.x,
      stoneY,
      this.position.x,
      stoneY + stoneHeight
    );
    stoneGradient.addColorStop(0, "#bbb");
    stoneGradient.addColorStop(1, "#363333");

    ctx.fillStyle = stoneGradient;
    ctx.fillRect(this.position.x, stoneY, this.width, stoneHeight);
  }
}

//Checkpoint  Constructor
class CheckPoint {
  constructor(x, y, z) {
    this.position = {
      x,
      y,
    };
    this.width = proportionalSize(40);
    this.height = proportionalSize(70);
    this.claimed = false;
    this.onGround = false;
  };

  draw() {
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;

    ctx.shadowColor = "#f1be32";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffe066";
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  claim() {
    this.width = 0;
    this.height = 0;
    this.position.y = Infinity;
    this.claimed = true;
  }
};

//Initializing player, platforms, and checkpoints
const player = new Player();

const platforms = platformPositions.map(
  (platform) => new Platform(platform.x, platform.y)
);

const checkpoints = checkpointPositions.map(
  (checkpoint) => new CheckPoint(checkpoint.x, checkpoint.y, checkpoint.z)
);

//Animate Function- Game Scrolling, Collision Detection, and Respawning
const animate = () => {
  if (!isGameRunning) return; 
  //Animation based on best possible frame rate
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //Draw Platform
  platforms.forEach((platform) => {
    platform.draw();
  });

  //Draw Checkpoint
  checkpoints.forEach(checkpoint => {
    checkpoint.draw();
  });

  //Draw Player
  player.update();
  
  
  //Redraw based on movement
  if (keys.rightKey.pressed && player.position.x < proportionalSize(400)) {
    player.velocity.x = 5;
  } else if (keys.leftKey.pressed && player.position.x > proportionalSize(100)) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;

    if (keys.rightKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x -= 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x -= 5;
      });

      scrollOffset += 5;
      
    } else if (keys.leftKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x += 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x += 5;
      });

      scrollOffset -= 5;
    }
  }

  // Player hits ground
  if (player.position.x !== proportionalSize(10) ||  player.position.y !== proportionalSize(400)) {
    if (player.position.y + player.height >= canvas.height) {
      if (lives > 0) {
        lives--;
      };  
      updateLivesDisplay();
      
      // Respawn at last checkpoint
      if (lives > 0) {
        //Track world state
        const newScrollOffset = lastCheckpoint.x - proportionalSize(10); 
        const scrollDelta = scrollOffset - newScrollOffset;
        platforms.forEach(platform => {
          platform.position.x += scrollDelta;
        });
        checkpoints.forEach(checkpoint => {
          checkpoint.position.x += scrollDelta;
        });
        scrollOffset = newScrollOffset;

        // Set Player state to checkpoint
        player.reset({ x: proportionalSize(10), y: lastCheckpoint.y });

        platforms.forEach(platform => {
          if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width > platform.position.x &&
            player.position.x < platform.position.x + platform.width) {
              player.position.y = platform.position.y - player.height;
              player.velocity.y = 0; 
          }
        });

        // Display hit ground
        showCheckpointScreen(`You hit the ground! Lives remaining: ${lives}`);
        congrats.style.display = "none";
      } else {
        // Game over
        isCheckpointCollisionDetectionActive = false;
        player.velocity.y = 0;
        if (!hasGameOverScreenShown) {       
          gameOverScreen.style.display = "block";
          checkpointScreen.style.display = "none";
          hasGameOverScreenShown = true;
        }
      };
    };
  };  
  
  //Collision Detection
  platforms.forEach((platform) => {
    //Player & platform collision detection
    const collisionDetectionRules = [
      player.position.y + player.height <= platform.position.y,
      player.position.y + player.height + player.velocity.y >= platform.position.y,
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
    ];

    if (collisionDetectionRules.every((rule) => rule)) {
      player.velocity.y = 0;
      return;
    }

    const platformDetectionRules = [
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
      player.position.y + player.height >= platform.position.y,
      player.position.y <= platform.position.y + platform.height,
    ];

    if (platformDetectionRules.every(rule => rule)) {
      player.position.y = platform.position.y + player.height;
      player.velocity.y = gravity;
    };
  });

  //Player and checkpoint collision detection
  checkpoints.forEach((checkpoint, index, checkpoints) => {
    const checkpointDetectionRules = [
      player.position.x >= checkpoint.position.x,
      player.position.y >= checkpoint.position.y,
      player.position.y + player.height <=
        checkpoint.position.y + checkpoint.height,
      isCheckpointCollisionDetectionActive,
      player.position.x - player.width <=
        checkpoint.position.x - checkpoint.width + player.width * 0.9,
      index === 0 || checkpoints[index - 1].claimed === true,
    ];

    if (checkpointDetectionRules.every((rule) => rule)) {
      // Find the platform the checkpoint is on
      const platformUnderCheckpoint = platforms.find(platform => {
        return (
          checkpoint.position.x >= platform.position.x &&
          checkpoint.position.x <= platform.position.x + platform.width
        );
      });

      // Set respawn above platform
      if (platformUnderCheckpoint) {
        lastCheckpoint = {
          x: checkpoint.position.x,
          y: platformUnderCheckpoint.position.y - player.height
        };
      } else {
        // Fallback if no platform is found
        lastCheckpoint = {
          x: checkpoint.position.x,
          y: checkpoint.position.y - player.height
        };
      };

      //Set last checkpoint
      lastCheckpoint = {
        x: checkpoint.position.x + scrollOffset, // world-space x
        y: platformUnderCheckpoint
        ? platformUnderCheckpoint.position.y - player.height
        : checkpoint.position.y - player.height
      };

      checkpoint.claim();
      checkpointsLeft--;
      const checkpointsClaimed = 10 - checkpointsLeft;
      maxJumps = 5 + (checkpointsClaimed * (checkpointsClaimed + 1)) / 2;
      maxJumps = Math.min(maxJumps, 40);
      jumpsLeft = maxJumps;
      updateLivesDisplay();
      
      if (index === checkpoints.length - 1) {
        isCheckpointCollisionDetectionActive = false;
        congrats.style.display = "block";
        showCheckpointScreen("You reached the final checkpoint!");
        keys.rightKey.pressed = false;
        keys.leftKey.pressed = false;
        keys.jumpKey.pressed = false;
      } else if (player.position.x >= checkpoint.position.x && player.position.x <= checkpoint.position.x + 40) {
        congrats.style.display = "block";
        showCheckpointScreen("You reached a checkpoint!");
      }
    };
  });
};

//Key State Reset
const keys = {
  rightKey: { pressed: false },
  leftKey: { pressed: false },
  jumpKey: { pressed: false }
};

//Move Function
const movePlayer = (key, xVelocity, isPressed) => {
  if (!isCheckpointCollisionDetectionActive) {
    player.velocity.x = 0;
    player.velocity.y = 0;
    return;
  }

  //Variable input cases
  switch (key) {
    case "ArrowLeft":
      keys.leftKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x -= xVelocity;
      break;
    case "ArrowUp":
    case " ":
    case "Spacebar":
      if (!keys.jumpKey.pressed && jumpsLeft > 0) {
        player.velocity.y = -20;
        jumpsLeft--;
        updateLivesDisplay();
        keys.jumpKey.pressed = true;
      }
      break;
    case "ArrowRight":
      keys.rightKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x += xVelocity;
  }
}

//Update Lives Display
const updateLivesDisplay = () => {
  livesCount.textContent = lives;
  checkpointCount.innerHTML = `
    ${checkpointsLeft}  <span class="checkpoint-icon"></span>
  `;
  jumpCountDisplay.textContent = jumpsLeft;
};

//Start Game Function
const startGame = () => {
  isGameRunning = true;
  // Reset Stats and State
  lives = 5;
  checkpointsLeft = 10;
  maxJumps = 5;
  jumpsLeft = maxJumps;
  scrollOffset = 0;
  isCheckpointCollisionDetectionActive = true;
  keys.jumpKey.pressed = false;
  hasGameOverScreenShown = true;
  
  // Reset player
  player.onGround = false;
  player.reset({ x: proportionalSize(10), y: proportionalSize(400) });
  player.velocity = {
      x: 0,
      y: 0,
    };
  
  // Reset canvas size and state
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  // Recreate platforms
  platforms.length = 0;
  const platformPositions = [
    { x: 0, y: canvas.height - proportionalSize(40)},
    { x: 400, y: proportionalSize(450) },
    { x: 900, y: proportionalSize(400) },
    { x: 1500, y: proportionalSize(350) },
    { x: 2100, y: proportionalSize(330) },
    { x: 2800, y: proportionalSize(350) },
    { x: 3600, y: proportionalSize(400) },
    { x: 4500, y: proportionalSize(450) },
    { x: 5500, y: proportionalSize(380) },
    { x: 6600, y: proportionalSize(330) },
    { x: 7800, y: proportionalSize(300) },
    { x: 9000, y: proportionalSize(350) },
    { x: 10300, y: proportionalSize(400) },
    { x: 11700, y: proportionalSize(450) },
    { x: 13200, y: proportionalSize(300) },
    { x: 14800, y: proportionalSize(350) },
    { x: 16500, y: proportionalSize(400) },
    { x: 18300, y: proportionalSize(450) },
    { x: 20200, y: proportionalSize(350) },
    { x: 22200, y: proportionalSize(450) },
    { x: 24300, y: proportionalSize(300) },
    { x: 26500, y: proportionalSize(350) },
    { x: 28800, y: proportionalSize(400) },
    { x: 31200, y: proportionalSize(450) },
    { x: 33700, y: proportionalSize(350) },
    { x: 36300, y: proportionalSize(300) },
    { x: 39000, y: proportionalSize(400) },
    { x: 41800, y: proportionalSize(350) },
    { x: 44700, y: proportionalSize(400) },
    { x: 47700, y: proportionalSize(300) },
    { x: 50800, y: proportionalSize(350) },
    { x: 54000, y: proportionalSize(450) },
    { x: 57300, y: proportionalSize(300) },
    { x: 60700, y: proportionalSize(450) },
    { x: 64200, y: proportionalSize(200) },
    { x: 67800, y: proportionalSize(350) },
    { x: 71500, y: proportionalSize(400) },
    { x: 75300, y: proportionalSize(300) },
    { x: 79200, y: proportionalSize(250) },
    { x: 83200, y: proportionalSize(350) },
    { x: 87300, y: proportionalSize(300) },
    { x: 91500, y: proportionalSize(400) },
    { x: 95800, y: proportionalSize(450) },
    { x: 100300, y: proportionalSize(350) },
    { x: 104700, y: proportionalSize(300) },
    { x: 109300, y: proportionalSize(350) },
    { x: 114000, y: proportionalSize(400) },
    { x: 118800, y: proportionalSize(250) }
  ];
  platformPositions.forEach(pos => platforms.push(new Platform(pos.x, pos.y)));
  
  // Recreate checkpoints
  checkpoints.length = 0;
  const checkpointPositions = [
    { x: 2200, y: proportionalSize(330) - checkpointHeight, z: 1 },
    { x: 6700, y: proportionalSize(330) - checkpointHeight, z: 2 },
    { x: 13300, y: proportionalSize(300) - checkpointHeight, z: 3 },
    { x: 22300, y: proportionalSize(450) - checkpointHeight, z: 4 },
    { x: 33800, y: proportionalSize(350) - checkpointHeight, z: 5 },
    { x: 44800, y: proportionalSize(400) - checkpointHeight, z: 6 },
    { x: 60800, y: proportionalSize(450) - checkpointHeight, z: 7 },
    { x: 79300, y: proportionalSize(250) - checkpointHeight, z: 8 },
    { x: 100400, y: proportionalSize(350) - checkpointHeight, z: 9 },
    { x: 118900, y: proportionalSize(250) - checkpointHeight, z: 10 }
  ];
  checkpointPositions.forEach(pos => checkpoints.push(new CheckPoint(pos.x, pos.y, pos.z)));
  
  // Reset last checkpoint
  lastCheckpoint = { x: proportionalSize(10), y: proportionalSize(400) };
  
  // Update UI
  canvas.style.display = "block";
  startScreen.style.display = "none";
  livesScreen.style.display = "block";
  hasGameOverScreenShown = false;
  updateLivesDisplay();

  // Start animation
  animate();
};

//Reset Game Function
const resetGame = () => {
  isGameRunning = false;
  livesScreen.style.display = "none";
  checkpointScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  canvas.style.display = "none";
  startScreen.style.display = "block";
  keys.rightKey.pressed = false;
  keys.leftKey.pressed = false;
  keys.jumpKey.pressed = false;
};

//Show Checkpoint Function
const showCheckpointScreen = (msg) => {
  checkpointScreen.style.display = "block";
  congrats.style.display = "block";
  checkpointMessage.textContent = msg;
  if (isCheckpointCollisionDetectionActive) {
    setTimeout(() => (checkpointScreen.style.display = "none"), 3000);
  }
};


//Event Listeners
startBtn.addEventListener("click", startGame);

resetBtn.addEventListener("click", resetGame);

window.addEventListener("keydown", ({ key }) => {
  movePlayer(key, 8, true);
});

window.addEventListener("keyup", ({ key }) => {
  movePlayer(key, 0, false);
  
  if (key === " " || key === "Spacebar" || key === "ArrowUp") {
    keys.jumpKey.pressed = false;
  }
});
