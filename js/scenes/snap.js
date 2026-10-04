// Letters snap from narrow and slanted to full width, one after another.
class Snap extends Scene {
  constructor(txt){
    super(txt);
    this.widths = txt.split("").map(c => measure(c, this.size));
    this.scaleMin = 0.2;
    this.shearMax = -PI/8;
    this.pacer = (SCENE_LENGTH/1.5)/txt.length;
  }

  animate(){
    this.scales = [];
    this.shears = [];
    for(let n = 0; n < this.txt.length; n++){
      const t = this.delayed(this.pacer * n);
      this.scales[n] = easyEase(t, this.scaleMin, 1);
      this.shears[n] = easyEase(t, this.shearMax, 0);
    }

    // Distance between neighbouring letter centers at their current widths.
    const w = this.widths.map((w, n) => w * this.scales[n]);
    this.kern = w.map((wn, n) => n < w.length - 1 ? wn/2 + w[n + 1]/2 : 0);
    this.xStart = -this.kern.reduce((a, b) => a + b, 0)/2;
  }

  display(){
    translate(width/2 + this.xStart, height/2 + this.size * FONT_ADJUST/2);
    for(let n = 0; n < this.txt.length; n++){
      push();
        shearX(this.shears[n]);
        scale(this.scales[n], 1);
        drawGlyph(this.txt.charAt(n), this.size, 0, 0, "center");
      pop();
      translate(this.kern[n], 0);
    }
  }
}
