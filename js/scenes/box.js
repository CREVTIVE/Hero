// The word wraps around a spinning square prism, alternating normal and inverted faces.
class Box extends Scene {
  constructor(txt){
    super(txt);
    const w = round(measure(txt, this.size));
    this.pgA = this.track(textGraphic(txt, this.size, w, this.size * (FONT_ADJUST + 0.1), bgColor, fgColor, true));
    this.pgB = this.track(textGraphic(txt, this.size, w, this.size * 0.8, fgColor, bgColor, true));

    this.rotMax = { x: random(-PI, PI), y: random(-PI/8, PI/8), z: random(-PI/2, PI/2) };
  }

  animate(t){
    this.rot = {
      x: easyEase(t, 0, this.rotMax.x),
      y: easyEase(t, 0, this.rotMax.y),
      z: easyEase(t, 0, this.rotMax.z)
    };
  }

  display(){
    const w = this.pgA.width;
    const h = this.pgA.height;

    translate(width/2, height/2);
    rotateY(this.rot.y);
    rotateX(this.rot.x);
    rotateZ(this.rot.z);

    for(let m = 0; m < 4; m++){
      // Side face
      push();
        texture(m % 2 == 0 ? this.pgA : this.pgB);
        rotateX(m * HALF_PI);
        beginShape(TRIANGLE_STRIP);
          vertex(-w/2, -h/2, h/2, 0, 0);
          vertex(-w/2, h/2, h/2, 0, 1);
          vertex(w/2, -h/2, h/2, 1, 0);
          vertex(w/2, h/2, h/2, 1, 1);
        endShape();
      pop();

      // End caps
      push();
        fill(bgColor);
        translate(-w/2, -h/2, h/2);
        rotateY(HALF_PI);
        rect(-1, -1, h + 2, h + 2);
        translate(0, 0, w);
        rect(-1, -1, h + 2, h + 2);
      pop();
    }
  }
}
