// all imports
import {
  createImage,
  detectCollisionOfCircle,
  detectCollisionOnObject,
  detectCollisionOnPlatform,
  hitGoomba,
  hitsBottomOfBlock,
  hitsSideOfBlock,
  passingThroughFlower,
} from "./utils.js";

// all variables
var canvas = document.querySelector("canvas");

var context = canvas.getContext("2d");

var winWidth = window.innerWidth;
var winHeight = 650;

canvas.height = winHeight;
canvas.width = winWidth;

var velocityY = 15;
var velocityX = 20;
var platformXvelocity = velocityX;
var winX = 10000;
var scrollOffset = 0;
var backgroundXvelocity = velocityX * 0.5;
const gravity = 1;
var lastKey;

var platformImage = createImage("./images/platform.png");
var backgroundImage = createImage("./images/background.png");
var hillsImage = createImage("./images/hills.png");
var platformHighImage = createImage("./images/platformSmallTall.png");
var spriteMarioStandRight = createImage("./images/spriteMarioStandRight.png");
var spriteMarioStandLeft = createImage("./images/spriteMarioStandLeft.png");
var spriteMarioRunRight = createImage("./images/spriteMarioRunRight.png");
var spriteMarioRunLeft = createImage("./images/spriteMarioRunLeft.png");
var spriteMarioJumpRight = createImage("./images/spriteMarioJumpRight.png");
var spriteMarioJumpLeft = createImage("./images/spriteMarioJumpLeft.png");
var lgPlatform = createImage("./images/lgPlatform.png");
var mdPlatform = createImage("./images/mdPlatform.png");
var tPlatform = createImage("./images/tPlatform.png");
var xtPlatform = createImage("./images/xtPlatform.png");
var flagPoleSprite = createImage("./images/flagPole.png");

var spriteFireFlowerStandRight = createImage(
  "./images/spriteFireFlowerStandRight.png"
);
var spriteFireFlowerStandLeft = createImage(
  "./images/spriteFireFlowerStandLeft.png"
);
var spriteFireFlowerShootRight = createImage(
  "./images/spriteFireFlowerShootRight.png"
);
var spriteFireFlowerShootLeft = createImage(
  "./images/spriteFireFlowerShootLeft.png"
);
var spriteFireFlowerRunRight = createImage(
  "./images/spriteFireFlowerRunRight.png"
);
var spriteFireFlowerRunLeft = createImage(
  "./images/spriteFireFlowerRunLeft.png"
);
var spriteFireFlowerJumpRight = createImage(
  "./images/spriteFireFlowerJumpRight.png"
);
var spriteFireFlowerJumpLeft = createImage(
  "./images/spriteFireFlowerJumpLeft.png"
);
var spriteGoomba = createImage("./images/spriteGoomba.png");
var blockImage = createImage("./images/block.png");
var blockTriImage = createImage("./images/blockTri.png");
var fireFlowerImage = createImage("./images/spriteFireFlower.png");

//creating a player
class Player {
  constructor(x, y) {
    this.position = {
      x: x,
      y: y,
    };
    this.velocity = {
      x: 0,
      y: velocityY,
    };
    this.scale = 0.3;
    this.width = 398 * this.scale;
    this.height = 353 * this.scale;

    this.frames = 0;
    this.sprite = {
      stand: {
        right: spriteMarioStandRight,
        left: spriteMarioStandLeft,
        fireFlower: {
          left: spriteFireFlowerStandLeft,
          right: spriteFireFlowerStandRight,
        },
      },
      run: {
        right: spriteMarioRunRight,
        left: spriteMarioRunLeft,
        fireFlower: {
          left: spriteFireFlowerRunLeft,
          right: spriteFireFlowerRunRight,
        },
      },
      jump: {
        right: spriteMarioJumpRight,
        left: spriteMarioJumpLeft,
        fireFlower: {
          left: spriteFireFlowerJumpLeft,
          right: spriteFireFlowerJumpRight,
        },
      },
      shoot: {
        fireFlower: {
          left: spriteFireFlowerShootLeft,
          right: spriteFireFlowerShootRight,
        },
      },
    };

    this.currentSprite = this.sprite.stand.right;
    this.currentCropWidth = 398;
    this.powerUps = {
      fireFlower: false,
    };
    this.invincible = false;
    this.opacity = 1;
  }

  draw() {
    // function which is used to draw our player in canvas
    context.save();
    context.globalAlpha = this.opacity;
    context.fillStyle = "rgba(255,0,0,0.2)";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      353,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    context.restore();
  }

  update() {
    this.frames++;
    const { currentSprite, sprite } = this;
    if (
      (currentSprite == sprite.stand.right ||
        currentSprite == sprite.stand.left ||
        currentSprite == sprite.stand.fireFlower.left ||
        currentSprite == sprite.stand.fireFlower.right) &&
      this.frames > 58
    )
      this.frames = 0;
    if (
      (currentSprite == sprite.run.right ||
        currentSprite == sprite.run.left ||
        currentSprite == sprite.run.fireFlower.left ||
        currentSprite == sprite.run.fireFlower.right) &&
      this.frames > 28
    )
      this.frames = 0;
    if (
      currentSprite == sprite.jump.left ||
      currentSprite == sprite.jump.right ||
      currentSprite == sprite.jump.fireFlower.left ||
      currentSprite == sprite.jump.fireFlower.right
    )
      this.frames = 0;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity;

    if (this.position.x + this.velocity.x < 0) this.velocity.x = 0;

    if (this.invincible) {
      if (this.opacity === 1) this.opacity = 0;
      else this.opacity = 1;
    } else this.opacity = 1;
  }
}

class Platform {
  constructor(x, y, image, block = false) {
    this.position = {
      x: x,
      y: y,
    };
    this.velocity = {
      x: 0,
    };
    this.width = image.width;
    this.height = image.height;
    this.image = image;
    this.block = block;
  }

  draw() {
    context.drawImage(this.image, this.position.x, this.position.y);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

class GenericObjects {
  constructor(x, y, image) {
    this.position = {
      x: x,
      y: y,
    };
    this.velocity = {
      x: 0,
    };
    this.image = image;
    this.width = this.image.width;
    this.height = this.image.height;
  }

  draw() {
    context.drawImage(this.image, this.position.x, this.position.y);
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

class Goomba {
  constructor({
    position,
    velocity,
    image,
    distance = {
      limit: 300,
      travelled: 0,
    },
  }) {
    this.position = {
      x: position.x,
      y: position.y,
    };

    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };
    this.width = 60;
    this.height = 60;
    this.cropwidth = 130;
    this.image = image;
    this.frames = 0;
    this.distance = {
      limit: distance.limit,
      travelled: distance.travelled,
    };
  }
  draw() {
    context.drawImage(
      this.image,
      this.cropwidth * this.frames,
      0,
      this.cropwidth,
      150,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
  update() {
    this.frames++;
    if (this.frames >= 58) this.frames = 0;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // walk the goomba back and forth
    this.distance.travelled += this.velocity.x;
    if (Math.abs(this.distance.travelled) === this.distance.limit) {
      this.velocity.x = -this.velocity.x;
      this.distance.travelled = 0;
    }

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity;

    // if (this.position.x + this.velocity.x < 0) this.velocity.x = 0;
  }
}

class FireFlower {
  constructor({ position, velocity, image }) {
    this.position = {
      x: position.x,
      y: position.y,
    };

    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };
    this.width = 56;
    this.height = 60;
    this.image = image;
    this.frames = 0;
  }
  draw() {
    context.drawImage(
      this.image,
      this.width * this.frames,
      0,
      this.width,
      this.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
  update() {
    this.frames++;
    if (this.frames > 75) this.frames = 0;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity;

    if (this.position.x + this.velocity.x < 0) this.velocity.x = 0;
  }
}

class Particle {
  constructor({
    position,
    velocity,
    radius,
    color = "#654428",
    fireFlower = false,
    fades = false,
    firework = false,
  }) {
    this.position = {
      x: position.x,
      y: position.y,
    };
    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };
    this.radius = radius;
    this.ttl = 300;
    this.fireFlower = fireFlower;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
    this.firework = firework;
  }

  draw() {
    context.save();
    context.globalAlpha = this.opacity;
    context.beginPath();
    context.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
    context.restore();
  }

  update() {
    this.ttl--;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.radius * 2 + this.velocity.y <= canvas.height)
      this.velocity.y += gravity * 0.2;

    if (this.fades) this.opacity -= 0.01;
    if (this.opacity < 0) this.opacity = 0;
  }
}

// initializing objects
var genericObjects;
var player;
var platforms;
var goombas;
var keys;
var particles;
var hitSide = false;
var fireFlowers;
var platformsMap = [];
var platformWidth = 0;
var flagPole;
var game;

function init() {
  genericObjects = [
    new GenericObjects(-1, -1, backgroundImage),
    new GenericObjects(-1, -10, hillsImage),
  ];

  player = new Player(100, 0);
  goombas = [
    new Goomba({
      position: { x: 1024, y: 200 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 400, travelled: 0 },
    }),
    new Goomba({
      position: { x: 1700, y: 200 },
      velocity: { x: -3, y: 1 },
      image: spriteGoomba,
      distance: { limit: 600, travelled: 0 },
    }),
    new Goomba({
      position: { x: 2300, y: 200 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 250, travelled: 0 },
    }),
    new Goomba({
      position: { x: 2350, y: 200 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 250, travelled: 0 },
    }),
    new Goomba({
      position: { x: 2400, y: 200 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 250, travelled: 0 },
    }),
    new Goomba({
      position: { x: 2450, y: 200 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 250, travelled: 0 },
    }),
    new Goomba({
      position: { x: 2950, y: 0 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 100, travelled: 0 },
    }),
    new Goomba({
      position: { x: 3188, y: 0 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 100, travelled: 0 },
    }),
    new Goomba({
      position: { x: 4100, y: 0 },
      velocity: { x: -1, y: 1 },
      image: spriteGoomba,
      distance: { limit: 100, travelled: 0 },
    }),
    new Goomba({
      position: { x: 4400, y: 0 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 200, travelled: 0 },
    }),
    new Goomba({
      position: { x: 4600, y: 0 },
      velocity: { x: -1, y: 1 },
      image: spriteGoomba,
      distance: { limit: 100, travelled: 0 },
    }),
    new Goomba({
      position: { x: 6050, y: 0 },
      velocity: { x: 1, y: 1 },
      image: spriteGoomba,
      distance: { limit: 100, travelled: 0 },
    }),
    new Goomba({
      position: { x: 8900, y: 0 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 50, travelled: 0 },
    }),
    new Goomba({
      position: { x: 9200, y: 0 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 300, travelled: 0 },
    }),
    new Goomba({
      position: { x: 5094, y: 0 },
      velocity: { x: -2, y: 1 },
      image: spriteGoomba,
      distance: { limit: 50, travelled: 0 },
    }),
  ];
  fireFlowers = [
    new FireFlower({
      position: { x: 2140, y: 0 },
      velocity: { x: 0, y: 0 },
      image: fireFlowerImage,
    }),
    new FireFlower({
      position: { x: 6600, y: 0 },
      velocity: { x: 0, y: 0 },
      image: fireFlowerImage,
    }),
  ];
  particles = [];
  platforms = [
    new Platform(1020, 300, blockImage, true),
    new Platform(1470, 388, blockTriImage, true),
    new Platform(3985, 388, blockImage, true),
    new Platform(4187, 388, blockTriImage, true),
    new Platform(4482, 388, blockImage, true),
    new Platform(5044, 570, blockTriImage, true),
    new Platform(7100, 530, blockTriImage, true),
    new Platform(7400, 390, blockImage, true),
    new Platform(7700, 240, blockImage, true),
    new Platform(8000, 390, blockImage, true),
    new Platform(8300, 530, blockTriImage, true),
  ];
  platformsMap = [
    "lg",
    "lg",
    "gap",
    "md",
    "gap",
    "smallTall",
    "xt",
    "gap",
    "gap",
    "lg",
    "gap",
    "gap",
    "gap",
    "t",
    "gap",
    "smallTall",
    "gap",
    "xt",
    "gap",
    "gap",
    "gap",
    "gap",
    "gap",
    "gap",
    "gap",
    "gap",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
    "xt",
  ];

  platformWidth = 0;
  platformsMap.forEach((platform) => {
    console.log(platformWidth);
    switch (platform) {
      case "lg":
        platforms.push(new Platform(platformWidth, 555, lgPlatform, true));
        platformWidth += lgPlatform.width - 3;
        break;

      case "md":
        platforms.push(new Platform(platformWidth, 555, mdPlatform, true));
        platformWidth += mdPlatform.width - 3;
        break;

      case "smallTall":
        platforms.push(
          new Platform(platformWidth, 426, platformHighImage, true)
        );
        platformWidth += platformHighImage.width - 3;
        break;

      case "t":
        platforms.push(new Platform(platformWidth, 475, tPlatform, true));
        platformWidth += tPlatform.width - 3;
        break;

      case "xt":
        platforms.push(new Platform(platformWidth, 358, xtPlatform, true));
        platformWidth += xtPlatform.width - 3;
        break;

      case "gap":
        platformWidth += 260;
        break;
    }
  });
  flagPole = new GenericObjects(9200, 20, flagPoleSprite);
  keys = {
    right: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
  };
  scrollOffset = 0;
  game = {
    userInput: true,
  };
}

// animating those objects
function animate() {
  // used for animation by applying infinite loop
  requestAnimationFrame(animate);
  hitSide = false;
  // clearing the previous loaded screen
  context.clearRect(0, 0, canvas.width, canvas.height);

  // loading the objects into the screen
  genericObjects.forEach((genericObject) => {
    genericObject.update();
    genericObject.velocity.x = 0;
  });

  platforms.forEach((platform) => {
    platform.update();
    platform.velocity.x = 0;
  });

  particles.forEach((particle, index) => {
    particle.update();
    if (
      (particle.fireFlower && particle.position.x - particle.radius <= 0) ||
      particle.position.x + particle.radius >= canvas.width
    ) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 0);
    }
  });

  if (flagPole) {
    flagPole.update();
    flagPole.velocity.x = 0;

    if (game.userInput && hitGoomba(player, flagPole)) {
      console.log("touchy touchy");
      game.userInput = false;
      player.velocity.x = 0;
      player.velocity.y = 0;
      platformXvelocity = 0;
      backgroundXvelocity = 0;
      player.currentSprite = player.sprite.stand.right;

      if (player.powerUps.fireFlower)
        player.currentSprite = player.sprite.stand.fireFlower.right;

      gsap.to(player.position, {
        y: canvas.height - xtPlatform.height - player.height,
        duration: 1,
        onComplete() {
          player.currentSprite = player.sprite.run.right;
          if (player.powerUps.fireFlower)
            player.currentSprite = player.sprite.run.fireFlower.right;
        },
      });

      gsap.to(player.position, {
        delay: 1,
        x: canvas.width,
        duration: 3,
        ease: "power1.in",
      });

      const particleCount = 300;
      const radians = (Math.PI * 2) / particleCount;
      const power = 8;
      var increment = 1;
      const intervalID = setInterval(() => {
        for (var i = 0; i < particleCount; i++) {
          particles.push(
            new Particle({
              position: {
                x: (canvas.width / 4) * increment,
                y: canvas.height / 2,
              },
              velocity: {
                x: Math.cos(radians * i) * power * Math.random(),
                y: Math.sin(radians * i) * power * Math.random(),
              },
              radius: Math.random() * 3,
              color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
                Math.random() * 255
              })`,
              fades: true,
              firework: true,
            })
          );
        }

        if (increment === 3) clearInterval(intervalID);
        increment++;
      }, 1000);
    }
  }

  fireFlowers.forEach((fireFlower, index) => {
    if (passingThroughFlower(player, fireFlower)) {
      player.powerUps.fireFlower = true;
      setTimeout(() => {
        fireFlowers.splice(index, 1);
      }, 0);
    } else fireFlower.update();
  });

  goombas.forEach((goomba, index) => {
    goomba.update();

    particles.forEach((particle, particleIndex) => {
      if (
        particle.fireFlower &&
        particle.position.x + particle.radius >= goomba.position.x &&
        particle.position.y + particle.radius >= goomba.position.y &&
        particle.position.x - particle.radius <=
          goomba.position.x + goomba.width &&
        particle.position.y - particle.radius <=
          goomba.position.y + goomba.height
      ) {
        for (var i = 0; i < 50; i++) {
          particles.push(
            new Particle({
              position: {
                x: goomba.position.x + goomba.width / 2,
                y: goomba.position.y + goomba.height / 2,
              },
              velocity: {
                x: (Math.random() - 0.5) * 7,
                y: (Math.random() - 0.5) * 9,
              },
              radius: Math.random() * 5,
            })
          );
        }
        setTimeout(() => {
          goombas.splice(index, 1);
          particles.splice(particleIndex, 1);
        }, 0);
      }
    });

    if (detectCollisionOnObject(player, goomba)) {
      //creating partciles for each collision
      for (var i = 0; i < 50; i++) {
        particles.push(
          new Particle({
            position: {
              x: goomba.position.x + goomba.width / 2,
              y: goomba.position.y + goomba.height / 2,
            },
            velocity: {
              x: (Math.random() - 0.5) * 7,
              y: (Math.random() - 0.5) * 9,
            },
            radius: Math.random() * 5,
          })
        );
      }
      player.velocity.y = -10;
      // removing goomba from our goomba array
      setTimeout(() => {
        goombas.splice(index, 1);
      }, 0);
    } else if (hitGoomba(player, goomba)) {
      if (player.powerUps.fireFlower) {
        player.invincible = true;
        player.powerUps.fireFlower = false;
        setTimeout(() => {
          player.invincible = false;
        }, 1000);
      } else if (!player.invincible) init();
    }
  });

  player.update();

  // movement of player and platform and generic objects
  // player
  if (keys.right.pressed && player.position.x < 300)
    player.velocity.x = velocityX;
  else if (
    (keys.left.pressed && player.position.x > 50) ||
    (keys.left.pressed && player.position.x > 0 && scrollOffset === 0)
  )
    player.velocity.x = -velocityX;
  else {
    player.velocity.x = 0;

    if (keys.right.pressed) {
      // left movement of platform
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        platform.velocity.x = -platformXvelocity;

        if (platform.block && hitsSideOfBlock(player, platform)) {
          platforms.forEach((platform) => {
            platform.velocity.x = 0;
          });

          hitSide = true;
          break;
        }
      }
      if (!hitSide) {
        scrollOffset += platformXvelocity;

        //left movement of goombas
        goombas.forEach((goomba) => {
          goomba.position.x += -platformXvelocity;
        });

        fireFlowers.forEach((fireFlower) => {
          fireFlower.position.x += -platformXvelocity;
        });

        //left movement of generic objects
        genericObjects.forEach((genericObject) => {
          genericObject.velocity.x = -backgroundXvelocity;
        });

        // left movement of particles
        particles.forEach((particle) => {
          particle.position.x += -platformXvelocity;
        });

        flagPole.velocity.x = -platformXvelocity;

        // setting scrolloffset for left movement of platform
      }
    } else if (keys.left.pressed && scrollOffset > 0) {
      // right movement of platform
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        platform.velocity.x = platformXvelocity;
        if (platform.block && hitsSideOfBlock(player, platform)) {
          platforms.forEach((platform) => {
            platform.velocity.x = 0;
          });
          hitSide = true;
          break;
        }
      }

      if (!hitSide) {
        scrollOffset += -platformXvelocity;

        // right movement of goombas
        goombas.forEach((goomba) => {
          goomba.position.x += platformXvelocity;
        });

        fireFlowers.forEach((fireFlower) => {
          fireFlower.position.x += platformXvelocity;
        });
        // right movement of generic objects
        genericObjects.forEach((genericObject) => {
          genericObject.velocity.x = backgroundXvelocity;
        });

        // right movement of particles
        particles.forEach((particle) => {
          particle.position.x += platformXvelocity;
        });
        flagPole.velocity.x = platformXvelocity;

        // setting scrolloffset for right movement of platform
      }
    }
  }

  // collision detection of platform and player, goomba, particle
  platforms.forEach((platform) => {
    if (detectCollisionOnPlatform(player, platform)) player.velocity.y = 0;
    if (platform.block && hitsBottomOfBlock(player, platform))
      player.velocity.y = -player.velocity.y;
    if (platform.block && hitsSideOfBlock(player, platform))
      player.velocity.x = 0;
    goombas.forEach((goomba) => {
      if (detectCollisionOnPlatform(goomba, platform)) goomba.velocity.y = 0;
    });
    fireFlowers.forEach((fireFlower) => {
      if (detectCollisionOnPlatform(fireFlower, platform))
        fireFlower.velocity.y = 0;
    });
    particles.forEach((particle, index) => {
      if (!particle.firework && detectCollisionOfCircle(particle, platform)) {
        particle.velocity.y = -(particle.velocity.y * 0.4);
        if (particle.radius - 0.4 < 0) particles.splice(index, 1);
        else particle.radius = particle.radius - 0.4;
      }
      if (particle.ttl === 0) particles.splice(index, 1);
    });
  });

  if (player.position.y > canvas.height) init();

  // interchanging between sprites
  if (player.velocity.y !== 0) return;

  if (
    keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite != player.sprite.run.right
  ) {
    player.currentSprite = player.sprite.run.right;
  } else if (
    keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite != player.sprite.run.left
  ) {
    player.currentSprite = player.sprite.run.left;
  } else if (
    !keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite != player.sprite.stand.left
  ) {
    player.currentSprite = player.sprite.stand.left;
  } else if (
    !keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite != player.sprite.stand.right
  ) {
    player.currentSprite = player.sprite.stand.right;
  }

  // fireflower sprites
  if (!player.powerUps.fireFlower) return;
  if (
    keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite != player.sprite.run.fireFlower.right
  ) {
    player.currentSprite = player.sprite.run.fireFlower.right;
  } else if (
    keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite != player.sprite.run.fireFlower.left
  ) {
    player.currentSprite = player.sprite.run.fireFlower.left;
  } else if (
    !keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite != player.sprite.stand.fireFlower.left
  ) {
    player.currentSprite = player.sprite.stand.fireFlower.left;
  } else if (
    !keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite != player.sprite.stand.fireFlower.right
  ) {
    player.currentSprite = player.sprite.stand.fireFlower.right;
  }
}

addEventListener("keydown", (event) => {
  if (!game.userInput) return;
  var key = event.key;
  console.log(key);
  switch (key) {
    case "ArrowRight":
      keys.right.pressed = true;
      lastKey = "right";
      break;
    case "ArrowLeft":
      keys.left.pressed = true;
      lastKey = "left";
      break;
    case "ArrowUp":
      player.velocity.y = -velocityY;
      if (lastKey === "left") {
        player.currentSprite = player.sprite.jump.left;
      } else {
        player.currentSprite = player.sprite.jump.right;
      }

      if (!player.powerUps.fireFlower) break;
      if (lastKey === "left") {
        player.currentSprite = player.sprite.jump.fireFlower.left;
      } else {
        player.currentSprite = player.sprite.jump.fireFlower.right;
      }

      break;
    case "ArrowDown":
      break;
    case " ":
      if (player.powerUps.fireFlower) {
        var velocity = 0;
        if (lastKey === "left") velocity = -25;
        else {
          velocity = 25;
        }
        particles.push(
          new Particle({
            position: {
              x: player.position.x + player.width / 2,
              y: player.position.y + player.height / 2,
            },
            velocity: {
              x: velocity,
              y: 15,
            },
            radius: 5,
            color: "red",
            fireFlower: true,
          })
        );
      }

      break;
  }
});

addEventListener("keyup", (event) => {
  if (!game.userInput) return;

  var key = event.key;
  switch (key) {
    case "ArrowRight":
      keys.right.pressed = false;
      break;
    case "ArrowLeft":
      keys.left.pressed = false;
      break;
    case "ArrowUp":
      break;
    case "ArrowDown":
      break;
  }
});
init();
animate();
