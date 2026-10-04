// Each letter is a reel of repeated characters that rolls to a random stop.
class SlotMachine extends Scene {
  constructor(txt){
    super(txt);
    this.xs = letterPositions(txt, this.size);
    this.repeats = round((height * 2)/this.size) + 5;
    this.lineH = this.size * 0.8;
    this.targets = this.xs.map(() => random(-this.size * 2, this.size * 2));

    // Each reel is drawn as one multi-line string, which is much cheaper than a text() call per letter.
    this.reels = txt.split("").map(c => Array(this.repeats).fill(c).join("\n"));
  }

  animate(t){
    this.ys = this.targets.map(target => easyEase(t, 50, target));
  }

  display(){
    fill(fgColor);
    noStroke();
    textFont(font);
    textSize(this.size);
    textAlign(LEFT);
    textLeading(this.lineH);

    const top = height/2 + this.size * FONT_ADJUST/2 - this.repeats * this.lineH/2;
    for(let n = 0; n < this.txt.length; n++){
      text(this.reels[n], this.xs[n], top + this.ys[n]);
    }
  }
}
