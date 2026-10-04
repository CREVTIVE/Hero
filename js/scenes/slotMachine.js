// Each letter is a reel of repeated characters that rolls to a random stop.
class SlotMachine extends Scene {
  constructor(txt){
    super(txt);
    this.xs = letterPositions(txt, this.size);
    this.repeats = round((height * 2)/this.size) + 5;
    this.lineH = this.size * 0.8;
    this.targets = this.xs.map(() => random(-this.size * 2, this.size * 2));
  }

  animate(t){
    this.ys = this.targets.map(target => easyEase(t, 50, target));
  }

  display(){
    const top = height/2 + this.size * FONT_ADJUST/2 - this.repeats * this.lineH/2;
    for(let n = 0; n < this.txt.length; n++){
      for(let p = 0; p < this.repeats; p++){
        drawGlyph(this.txt.charAt(n), this.size, this.xs[n], top + this.ys[n] + p * this.lineH);
      }
    }
  }
}
