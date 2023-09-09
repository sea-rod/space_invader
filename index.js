const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");
const score_element = document.getElementById("score");
const game_over = document.getElementById("game-over");

let score = 0;

canvas.width = innerWidth;
canvas.height = innerHeight;

const grids = [];
const player = new Player();
const invaderProjectiles = [];
const particles = [];
let spawn_invaderProjectile = 100;
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

  //updating particles
  particles.forEach((particle, index) => {
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      });
    } else {
      particle.update();
    }
  });

  //updating invader projectiles
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
      game_over.style.visibility = "visible";
    }
  });

  // make player move
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

  // updating projectiles
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

  //updating grid
  grids.forEach((grid, grid_index) => {
    grid.update();
    //spawn invader projectile
    if (frame % spawn_invaderProjectile == 0 && grid.invader.length > 0) {
      grid.invader[Math.floor(Math.random() * grid.invader.length)].shoot(
        invaderProjectiles
      );
    }
    if (grid.invader.length > 0) {
      const last = grid.invader[grid.invader.length - 1];
      if (
        last.position &&
        last.position.y + last.height >= player.position.y + 10
      ) {
        setTimeout(() => {
          game.over = true;
        }, 0);
        setTimeout(() => {
          game.active = false;
        }, 1000);

        game_over.style.visibility = "visible";
      }
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
          score++;
          score_element.innerHTML = score;
          if (score % 50 == 0 && score > 10) {
            spawn_invaderProjectile -= 10;
          }
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
