// A huge inverted ellipse rises or sets over the word.
class RiseSun extends Scene {
  constructor(txt){
    super(txt);
    this.pgA = this.track(textGraphic(txt, this.size, width, height, fgColor, bgColor));
    this.pgB = this.track(textGraphic(txt, this.size, width, height, bgColor, fgColor));

    this.res = 50;
    this.ang = TWO_PI/this.res;
    this.radiusX = height * 1.25;
    this.radiusY = height;

    const direction = random(10) < 5 ? 1 : -1;
    this.yStart = height/2 + direction * (this.radiusY - 25);
    this.yEnd = this.yStart + 100;
  }

  animate(t){
    this.yCenter = easyEase(t, this.yStart, this.yEnd);
  }

  display(){
    image(this.pgA, 0, 0);

    texture(this.pgB);
    beginShape(TRIANGLE_FAN);
      for(let n = 0; n < this.res; n++){
        const x = width/2 + cos(n * this.ang) * this.radiusX;
        const y = this.yCenter + sin(n * this.ang) * this.radiusY;
        vertex(x, y, x/width, y/height);
      }
    endShape();
  }
}
