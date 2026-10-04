// Letters fly out from the center while stretching open, then squeeze shut in place.
class Shutters2 extends Scene {
  constructor(txt){
    super(txt);
    this.xs = letterPositions(txt, this.size);
    this.pg = this.track(...letterGraphics(txt, this.size));
    this.pacer = (SCENE_LENGTH/3)/txt.length;
    this.reveal = [];
    this.x = [];
  }

  animate(){
    for(let n = 0; n < this.txt.length; n++){
      const t = this.delayed(this.pacer * n);
      this.reveal[n] = easyEase(t, 0, 0, this.pg[n].width);
      this.x[n] = easyEase(t, width/2, this.xs[n], this.xs[n]);
    }
  }

  display(){
    translate(0, height/2 - this.pg[0].height/2);
    stroke(0, 0, 255);

    for(let n = 0; n < this.txt.length; n++){
      const pg = this.pg[n];
      const w = this.reveal[n];
      const u = w/pg.width;

      push();
        translate(this.x[n], 0);
        texture(pg);
        beginShape(TRIANGLE_STRIP);
          vertex(0, 0, 0, 0);
          vertex(0, pg.height, 0, 1);
          vertex(w, 0, u, 0);
          vertex(w, pg.height, u, 1);
        endShape();
      pop();
    }
  }
}
