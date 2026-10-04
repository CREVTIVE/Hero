// The word is sliced into three horizontal bands that slide apart while shearing.
class Split extends Scene {
  constructor(txt){
    super(txt);
    this.pg = this.track(textGraphic(txt, this.size, round(measure(txt, this.size)), this.size * (FONT_ADJUST + 0.05)));

    const direction = random(10) < 5 ? -1 : 1;
    this.shearMax = direction * PI/8;

    const cut1 = random(0.1, 0.4);
    const cut2 = cut1 + random(0.1, 0.6);
    this.cuts = [0, cut1, cut2, 1];

    this.offsetMax = [-100, 50, 25].map(x => x * direction);
  }

  animate(t){
    this.shear = easyEase(t, 0, this.shearMax);
    this.offsets = this.offsetMax.map(x => easyEase(t, 0, x));
  }

  display(){
    const pg = this.pg;

    translate(width/2, height/2);
    scale(0.75);
    shearX(this.shear);
    translate(-pg.width/2, -pg.height/2);
    texture(pg);

    for(let m = 0; m < 3; m++){
      // Offsets accumulate, so each band moves relative to the one above it.
      translate(this.offsets[m], 0);
      const v0 = this.cuts[m];
      const v1 = this.cuts[m + 1];
      beginShape(TRIANGLE_STRIP);
        vertex(0, pg.height * v0, 0, v0);
        vertex(0, pg.height * v1, 0, v1);
        vertex(pg.width, pg.height * v0, 1, v0);
        vertex(pg.width, pg.height * v1, 1, v1);
      endShape();
    }
  }
}
