namespace feuerwerk {
  export class Scatter extends Moveable {
    
    public shrink: number;
    public gravity: number;
    public resistance: number;
    public fade: number;
    
    constructor(pos: Vector) {
      super(pos);
      this.pos = {
        x: pos ? pos.x : 0,
        y: pos ? pos.y : 0
    };
    this.vel = {
        x: 0,
        y: 0
    };
    this.shrink = 0.98;
    this.size = 0;

    this.resistance = ScatterSize.MEDIUM;
    this.gravity = 0.1;
    
    this.alpha = 1;
    this.fade = 0;
    
    }

    draw(): void {
      if (!this.exists()) {
        return;
    }
      crc2.save();

      crc2.globalCompositeOperation = 'lighter';

      let x = this.pos.x,
        y = this.pos.y,
        r = this.size/2;

      //erstelle gradient
      let gradient: CanvasGradient = crc2.createRadialGradient(x, y, 0.1, x, y, r);
      //farbe von der farbliste festlegen
      gradient.addColorStop(0.5, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
      gradient.addColorStop(1, "hsla(" + this.secondColor + ", 100%, 50%, " + this.alpha + ")");
        

      crc2.fillStyle = gradient;
      //runde bewegung
      crc2.beginPath();
      crc2.arc(x, y, r, 0, Math.PI * 2, true);
      crc2.closePath();
      crc2.fill();

      crc2.restore();
      
    }
    //aktualisiere die values für die bewegung
    update(): void {
      this.vel.x *= this.resistance;
      this.vel.y *= this.resistance;
  
      //gravität
      this.vel.y += this.gravity;
  
      //aktualisiere die position anhand der geschwindigkeit
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
  
      // shrink
      this.size *= this.shrink;
  
      // verblassen effekt
      this.alpha -= this.fade;
    }

    // beides aufrufen
    animate(): void {
      this.update();
      this.draw();
    }

  }
}