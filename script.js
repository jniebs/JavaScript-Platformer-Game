const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const congrats = checkpointScreen.querySelector("h2");
const livesScreen = document.querySelector(".lives-screen");
const livesCount = livesScreen.querySelector("h2");
const checkpointCount = livesScreen.querySelector("h3");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const gravity = 0.5;
let lives = 5;
let checkpointsLeft = 10;
let isCheckpointCollisionDetectionActive = true;
let scrollOffset = 0;

//Calculate Proportional Size of Screen
const proportionalSize = (size) => {
  return innerHeight < 500 ? Math.ceil((size / 500) * innerHeight) : size;
}

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
    ctx.fillStyle = "#99c9ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    let grounded = false;
    let onGround = false;

    //Check If Player On Platform or Ground
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
      this.velocity.y += gravity; // Apply gravity if in the air
    }
    this.onGround = grounded;

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
    ctx.fillStyle = "#acd157";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
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
    ctx.fillStyle = "#f1be32";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  claim() {
    this.width = 0;
    this.height = 0;
    this.position.y = Infinity;
    this.claimed = true;
  }
};

//Initializing Player, Platforms, and Checkpoints
const player = new Player();

const platformPositions = [
  { x: 0, y: proportionalSize(canvas.height - 100) },
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

const platforms = platformPositions.map(
  (platform) => new Platform(platform.x, platform.y)
);

//checkpoint.y = platform.y - checkpointHeight.
const checkpointHeight = proportionalSize(70);
const checkpointPositions = [
  { x: 2200, y: proportionalSize(330) - checkpointHeight, z: 1 },
  { x: 6700, y: proportionalSize(330) - checkpointHeight, z: 2 },
  { x: 13300, y: proportionalSize(300) - checkpointHeight, z: 3 },
  { x: 22300, y: proportionalSize(450) - checkpointHeight, z: 4 },
  { x: 33800, y: proportionalSize(350) - checkpointHeight, z: 5 },
  { x: 44800, y: proportionalSize(400) - checkpointHeight, z: 6 },
  { x: 60800, y: proportionalSize(450) - checkpointHeight, z: 7 },
  { x: 79300, y: proportionalSize(250) - checkpointHeight, z: 8 },
  { x: 100200, y: proportionalSize(350) - checkpointHeight, z: 9 },
  { x: 118900, y: proportionalSize(250) - checkpointHeight, z: 10 },
];

const checkpoints = checkpointPositions.map(
  (checkpoint) => new CheckPoint(checkpoint.x, checkpoint.y, checkpoint.z)
);

//Animate Function- Game Scrolling, COllision Detection, and Respawning
const animate = () => {

  //Animation Based on Best Possible Frame Rate
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

  //Redraw Based on Movement
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

      if (lives > 0) {
        // Respawn at last checkpoint

        //Track World State
        const newScrollOffset = lastCheckpoint.x - proportionalSize(10); 
        const scrollDelta = scrollOffset - newScrollOffset;
        platforms.forEach(platform => {
          platform.position.x += scrollDelta;
        });
        checkpoints.forEach(checkpoint => {
          checkpoint.position.x += scrollDelta;
        });
        scrollOffset = newScrollOffset;

        //Set Player State to Checkpoint
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

        //Display Hit Ground
        showCheckpointScreen(`You hit the ground! Lives remaining: ${lives}`);
        congrats.style.display = "none";
        console.log("Respawning at:", lastCheckpoint);
      } else {
        // Game over
        isCheckpointCollisionDetectionActive = false;
        player.velocity.y = 0;
        showCheckpointScreen("Game Over!");
        congrats.style.display = "none";
        resetBtn.hidden = false;
      };
    };
  };  
  
  //Collision Detection
  platforms.forEach((platform) => {
    //Player & Platform Collision Detection
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

  //Player & Checkpoint Collision Detection
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

      // Set Respawn Above Platform
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

      //Set Last Checkpoint
      lastCheckpoint = {
        x: checkpoint.position.x + scrollOffset, // world-space x
        y: platformUnderCheckpoint
        ? platformUnderCheckpoint.position.y - player.height
        : checkpoint.position.y - player.height
      };
      
      console.log("Checkpoint claimed at:", checkpoint.position);
      console.log("lastCheckpoint now set to:", lastCheckpoint);

      checkpoint.claim();
      checkpointsLeft--;
      updateLivesDisplay();
      
      if (index === checkpoints.length - 1) {
        isCheckpointCollisionDetectionActive = false;
        congrats.style.display = "block";
        showCheckpointScreen("You reached the final checkpoint!");
        resetBtn.hidden = false;
        keys.rightKey.pressed = false;
        keys.leftKey.pressed = false;
        keys.arrowUp.pressed = false;
        keys.spacebar.pressed = false;
      } else if (player.position.x >= checkpoint.position.x && player.position.x <= checkpoint.position.x + 40) {
        congrats.style.display = "block";
        showCheckpointScreen("You reached a checkpoint!");
      }
    };
  });
}

//Key State Reset
const keys = {
  rightKey: {
    pressed: false
  },
  leftKey: {
    pressed: false
  }
};

//Move Function
const movePlayer = (key, xVelocity, isPressed) => {
  if (!isCheckpointCollisionDetectionActive) {
    player.velocity.x = 0;
    player.velocity.y = 0;
    return;
  }

  //Variable Input Cases
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
      player.velocity.y = -12;
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
  checkpointCount.textContent = checkpointsLeft;
};

//Start Game Function
const startGame = () => {
  lives = 5;
  canvas.style.display = "block";
  startScreen.style.display = "none";
  livesScreen.style.display = "block";
  updateLivesDisplay();
  animate();
}

//Reset Game Function
const resetGame = () => {
  // Hide checkpoint screen and reset button
  checkpointScreen.style.display = "none";
  resetBtn.hidden = true;
  keys.rightKey.pressed = false;
  keys.leftKey.pressed = false;

  //Reset Lives Display
  lives = 5;
  checkpointsLeft = 10;
  livesScreen.style.display = "block";
  updateLivesDisplay();

  // Reset player to initial state
  player.velocity = { x: 0, y: 0 };
  player.reset({ x: proportionalSize(10), y: proportionalSize(400) });

  // Reset platforms to initial positions
  platforms.length = 0; // Clear existing platforms
  platformPositions.forEach((pos) => {
    platforms.push(new Platform(pos.x, pos.y));
  });

  // Reset checkpoints to initial state
  checkpoints.length = 0; // Clear existing checkpoints
  checkpointPositions.forEach((pos) => {
    const checkpoint = new CheckPoint(pos.x, pos.y, pos.z);
    checkpoint.width = proportionalSize(40);
    checkpoint.height = proportionalSize(70);
    checkpoint.claimed = false;
    checkpoints.push(checkpoint);
  });

  // Reset game state
  isCheckpointCollisionDetectionActive = true;
  keys.rightKey.pressed = false;
  keys.leftKey.pressed = false;
  lastCheckpoint = { x: proportionalSize(10), y: proportionalSize(400) };

  // Restart the game
  canvas.style.display = "block";
  startScreen.style.display = "none";
  animate();
};

//Show Checkpoint Function
const showCheckpointScreen = (msg) => {
  checkpointScreen.style.display = "block";
  congrats.style.display = "block";
  checkpointMessage.textContent = msg;
  if (isCheckpointCollisionDetectionActive) {
    setTimeout(() => (checkpointScreen.style.display = "none"), 2000);
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
});
