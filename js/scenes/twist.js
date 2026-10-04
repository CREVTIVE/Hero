// Two opposite corners of the word are pulled off-screen, twisting it into an S-curve.
class Twist extends Scene {
  constructor(txt){
    super(txt);
    this.pg = this.track(textGraphic(txt, this.size, round(measure(txt, this.size)), this.size * (FONT_ADJUST + 0.05)));

    this.res = 300;
    this.overflow = (height - this.pg.height)/2;
    this.flip = random(10) < 5;

    // Bezier control points along each edge.
    const w = this.pg.width;
    this.xs = [0, w/3, w * 2/3, w];
  }

  animate(t){
    const h = this.pg.height;
    const up = easyEase(t, 0, -this.overflow);
    const down = easyEase(t, h, h + this.overflow);

    // Either top-left + bottom-right, or bottom-left + top-right.
    this.top = this.flip ? [0, 0, up, up] : [up, up, 0, 0];
    this.bot = this.flip ? [down, down, h, h] : [h, h, down, down];
  }

  display(){
    const pg = this.pg;
    translate(width/2 - pg.width/2, height/2 - pg.height/2);
    texture(pg);
    stroke(fgColor);

    beginShape(TRIANGLE_STRIP);
      for(let n = 0; n <= this.res; n++){
        const t = n/this.res;
        const x = bezierPoint(...this.xs, t);
        const u = x/pg.width;

        vertex(x, bezierPoint(...this.top, t), u, 0);
        vertex(x, bezierPoint(...this.bot, t), u, 1);
      }
    endShape();
  }
}
