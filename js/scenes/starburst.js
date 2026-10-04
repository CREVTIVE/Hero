// An inverted star bursts open from below the word.
class Starburst extends Scene {
  constructor(txt){
    super(txt);
    this.pgA = this.track(textGraphic(txt, this.size, width, height, fgColor, bgColor));
    this.pgB = this.track(textGraphic(txt, this.size, width, height, bgColor, fgColor));

    this.points = round(random(2, 10)) * 4;
    this.ang = TWO_PI/this.points;
    this.innerX = width/8;
    this.innerY = height/8;
    this.rotMax = random(-PI, PI);
  }

  animate(t){
    this.outerX = easyEase(t, 0, width/2);
    this.outerY = easyEase(t, 0, height/2);
    this.yCenter = easyEase(t, height * 3/4, height/2);
    // Holds still for the first half, then turns to half of rotMax.
    this.rot = easyEase(t, 0, this.rotMax/2, 0);
  }

  display(){
    image(this.pgA, 0, 0);

    texture(this.pgB);
    beginShape(TRIANGLE_FAN);
      vertex(width/2, this.yCenter, 0.5, 0.5);
      for(let n = 0; n <= this.points; n++){
        const outer = n % 2 == 0;
        const x = width/2 + cos(n * this.ang + this.rot) * (outer ? this.outerX : this.innerX);
        const y = this.yCenter + sin(n * this.ang + this.rot) * (outer ? this.outerY : this.innerY);
        vertex(x, y, x/width, y/height);
      }
    endShape();
  }
}
