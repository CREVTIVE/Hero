// Letters flip open and closed one after another while drifting upward.
class Shutters extends Scene {
  constructor(txt){
    super(txt);
    this.xs = letterPositions(txt, this.size);
    this.pg = this.track(...letterGraphics(txt, this.size));
    this.pacer = (SCENE_LENGTH/2)/txt.length;
    this.top = [];
    this.bot = [];
    this.y = [];
  }

  animate(){
    for(let n = 0; n < this.txt.length; n++){
      const t = this.delayed(this.pacer * n);
      const h = this.pg[n].height;
      this.top[n] = easyEase(t, h, 0, 0);
      this.bot[n] = easyEase(t, h, 0, h);
      this.y[n] = easyEase(t, this.pg[0].height/2, -this.pg[0].height/2);
    }
  }

  display(){
    translate(0, height/2 - this.pg[0].height/2);

    for(let n = 0; n < this.txt.length; n++){
      const pg = this.pg[n];
      const top = this.top[n];
      const bot = this.bot[n];
      const vTop = 1 - bot/pg.height;
      const vBot = 1 - top/pg.height;

      push();
        translate(this.xs[n], this.y[n]);
        texture(pg);
        beginShape(TRIANGLE_STRIP);
          vertex(0, top, 0, vTop);
          vertex(0, bot, 0, vBot);
          vertex(pg.width, top, 1, vTop);
          vertex(pg.width, bot, 1, vBot);
        endShape();
      pop();
    }
  }
}
