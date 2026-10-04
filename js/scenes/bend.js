// The word is stretched into a lens shape, its top and bottom edges bowing out to the canvas edges.
class Bend extends Scene {
  constructor(txt){
    super(txt);
    this.pg = this.track(textGraphic(txt, this.size, round(measure(txt, this.size)), this.size * (FONT_ADJUST + 0.1)));
    this.res = 300;
    this.margin = (height - this.pg.height)/2;
  }

  animate(t){
    const h = this.pg.height;
    this.yTop = easyEase(t, 0, -this.margin);
    this.yBot = easyEase(t, h, h + this.margin);
  }

  display(){
    const pg = this.pg;
    translate(width/2 - pg.width/2, height/2 - pg.height/2);
    texture(pg);

    beginShape(TRIANGLE_STRIP);
      for(let n = 0; n <= this.res; n++){
        const t = n/this.res;
        const x = bezierPoint(0, width/2, width/2, width, t);
        const yTop = bezierPoint(this.yTop, 0, 0, this.yTop, t);
        const yBot = bezierPoint(this.yBot, pg.height, pg.height, this.yBot, t);
        const u = x/pg.width;

        vertex(x, yTop, u, 0);
        vertex(x, yBot, u, 1);
      }
    endShape();
  }
}
