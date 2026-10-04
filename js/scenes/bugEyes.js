// Columns of repeated letters fill the screen, each cell flipping in and out with a ripple from the center.
class BugEyes extends Scene {
  constructor(txt){
    super(txt);
    this.xs = letterPositions(txt, this.size);
    this.pg = this.track(...letterGraphics(txt, this.size));
    this.cellH = this.pg[0].height;
    this.repeats = floor(height/this.cellH) + 2;
    this.pacer = (SCENE_LENGTH/2)/txt.length;
    this.top = this.pg.map(() => []);
    this.bot = this.pg.map(() => []);
  }

  animate(){
    const h = this.cellH;
    for(let n = 0; n < this.txt.length; n++){
      for(let p = 0; p < this.repeats; p++){
        const t = this.delayed(this.pacer * dist(n, p, this.txt.length/2, this.repeats/2));
        this.top[n][p] = easyEase(t, h, 0, 0);
        this.bot[n][p] = easyEase(t, h, 0, h);
      }
    }
  }

  display(){
    const h = this.cellH;
    translate(0, height/2 - h/2);

    for(let n = 0; n < this.txt.length; n++){
      const pg = this.pg[n];
      texture(pg);

      push();
        // Odd columns are offset by half a cell.
        translate(this.xs[n], -this.repeats * h/2 + (n % 2) * h/2);
        for(let p = 0; p < this.repeats; p++){
          const top = this.top[n][p];
          const bot = this.bot[n][p];
          const vTop = 1 - bot/h;
          const vBot = 1 - top/h;

          beginShape(TRIANGLE_STRIP);
            vertex(0, p * h + top, 0, vTop);
            vertex(0, p * h + bot, 0, vBot);
            vertex(pg.width, p * h + top, 1, vTop);
            vertex(pg.width, p * h + bot, 1, vBot);
          endShape();
        }
      pop();
    }
  }
}
