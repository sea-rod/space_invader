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

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < colums; x++) {
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
