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
