// Letters rise along one period of a cosine: the ends stay put, the middle lifts the most.
class Arc extends Scene {
  constructor(txt){
    super(txt);
    this.xs = letterPositions(txt, this.size);
    this.targets = this.xs.map((x, n) => map(cos(map(n, 0, txt.length - 1, 0, TWO_PI)), 1, -1, 0, -150));
  }

  animate(t){
    this.ys = this.targets.map(target => easyEase(t, 50, target, target/2));
  }

  display(){
    fill(fgColor);
    noStroke();
    textFont(font);
    textSize(this.size);
    textAlign(LEFT);

    const baseline = height/2 + this.size * FONT_ADJUST/2;
    for(let n = 0; n < this.txt.length; n++){
      text(this.txt.charAt(n), this.xs[n], baseline + this.ys[n]);
    }
  }
}
