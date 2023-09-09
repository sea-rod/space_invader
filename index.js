const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");
const score = document.getElementById("score");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };

    this.rotation = 0;
    this.opacity = 1;
    const image = new Image();
    image.src = "./img/spaceship.png";

    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.height = image.height * scale;
      this.width = image.width * scale;
      this.position = {
        x: canvas.width / 2 - this.width,
        y: canvas.height - this.height - 20,
      };
    };
  }
  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    c.rotate(this.rotation);
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    );

    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    c.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particle {
  constructor({ position, velocity, radius, color, fade }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fade = fade;
  }
  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.opacity -= this.fade;
    console.log(this.fade);
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 5;
    this.height = 15;
  }
  draw() {
    c.fillStyle = "white";
    // console.log("jj");
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  constructor({ position }) {
    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();
    image.src = "./img/invader.png";

    image.onload = () => {
      const scale = 0.14;
      this.image = image;
      this.height = image.height * scale;
      this.width = image.width * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }
  static dim = {
    x: this.height,
    y: this.width,
  };
  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      })
    );
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 3,
      y: 0,
    };

    this.invader = [];

    const rows = Math.floor(Math.random() * 3 + 2);
    const colums = Math.floor(Math.random() * 7 + 4);

    this.width = colums * 70;

    for (let x = 0; x < colums; x++) {
      for (let y = 0; y < rows; y++) {
        this.invader.push(
          new Invader({
            position: {
              x: x * 70,
              y: y * 70,
            },
          })
        );
      }
    }
  }
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;
    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 70;
    }
  }
}
const grids = [];
const player = new Player();
const invaderProjectiles = [];
const particles = [];
let frame = 0;

let randomInterval = Math.floor(Math.random() * 500 + 400); // spawn enermy at differnt intervals
const projectiles = [];
const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
};

let game = {
  over: false,
  active: true,
};

function create_particle({ object, color, radius = 3, fade = 0.01 }) {
  for (let i = 0; i < 15; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * radius,
        color: color,
        fade: fade,
      })
    );
  }
}

function animate() {
  if (!game.active) return;
  c.fillStyle = "black";
  c.fillRect(0, 0, innerWidth, innerHeight);
  player.update();

  particles.forEach((particle, index) => {
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      });
    } else {
      particle.update();
    }
  });

  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else {
      invaderProjectile.update();
    }
    if (
      invaderProjectile.position.y + invaderProjectile.height >
        player.position.y &&
      invaderProjectile.position.x > player.position.x &&
      invaderProjectile.position.x + invaderProjectile.width <
        player.position.x + player.width
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
        player.opacity = 0;
        game.over = true;
      }, 0);

      setTimeout(() => {
        game.active = false;
      }, 2000);

      create_particle({
        object: player,
        color: "white",
        radius: 5,
        fade: 0.005,
      });
      console.log("lostt");
    }
  });

  if (keys.a.pressed && player.position.x > 0) {
    player.velocity.x = -7;
    player.rotation = -0.15;
  } else if (
    keys.d.pressed &&
    player.position.x + player.width < canvas.width
  ) {
    player.velocity.x = 7;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        //flashing on the screen
        projectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }
  });

  grids.forEach((grid, grid_index) => {
    grid.update();
    //spawn invader projectile
    if (frame % 100 == 0 && grid.invader.length > 0) {
      grid.invader[Math.floor(Math.random() * grid.invader.length)].shoot(
        invaderProjectiles
      );
    }
    grid.invader.forEach((invader, invader_index) => {
      invader.update({ velocity: { x: grid.velocity.x, y: grid.velocity.y } });
      projectiles.forEach((projectile, projectile_index) => {
        // collosion dection
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          invader.position.x <= projectile.position.x - projectile.radius &&
          invader.position.x + invader.width >=
            projectile.position.x + projectile.radius
        ) {
          score.innerHTML = parseInt(score.innerHTML) + 1;
          create_particle({ object: invader, color: "#7bcc57" });

          // removes projectile and invader
          setTimeout(() => {
            grid.invader.splice(invader_index, 1);
            projectiles.splice(projectile_index, 1);
            //changes the grid size
            if (grid.invader.length > 0) {
              const frist_invader = grid.invader[0];
              const last_invader = grid.invader[grid.invader.length - 1];
              grid.width =
                last_invader.position.x +
                last_invader.width -
                frist_invader.position.x;

              grid.position.x = frist_invader.position.x;
              // console.log("deaddddddd", grid.width);
            } else {
              grids.splice(grid_index, 1);
            }
          }, 0);
        }
      });
    });
  });

  if (frame % randomInterval === 0) {
    randomInterval = Math.floor(Math.random() * 300 + 300);
    frame = 0;
    grids.push(new Grid());
  }

  frame++;

  requestAnimationFrame(animate);
}

animate();

addEventListener("keydown", ({ key }) => {
  if (game.over) return;
  switch (key) {
    case "a":
    case "ArrowLeft":
      keys.a.pressed = true;
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = true;
      break;
    case " ":
      keys.space.pressed = true;
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -20,
          },
        })
      );
      break;

    default:
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
    case "ArrowLeft":
      keys.a.pressed = false;
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = false;
      break;
    case " ":
      keys.space.pressed = false;
      break;

    default:
      break;
  }
});
