namespace feuerwerk {
 // die klasse verändern und die partikel die auseinanderfallen
    export abstract class Moveable {
      public pos: Vector = { x: 0, y: 0 };
      public vel: Vector = { x: 0, y: 0 };
      public size: number;
      public alpha: number;
      public color: number;
      public secondColor: number;
      
      constructor(v:Vector){
        this.pos = v;
        this.alpha = 1;
      }
      
      abstract draw(): void;
      abstract update(): void;
      abstract animate(): void;

      //wenns nicht verblast und die größe nicht <= 1 ist, existiert objekt trotzdem
      exists(): boolean {
        return this.alpha >= 0.1 && this.size >= 1;
    }
    }
  
}