import { PatternComponent } from './pattern.component';

export class Drawer {
    component: PatternComponent;

    public selectedPosition: { x: number; y: number };
    public ctx: CanvasRenderingContext2D;
    public ctxBack: CanvasRenderingContext2D;
    public width: number;
    public height: number;
    public minWidth: number = 100;
    public maxWidth: number = 1000;
    public widthResizeArea: number = 6;
    public deltaWidth: number;
    public isSelected: boolean;
    public canResize: boolean = false;
    public isResize: boolean = false;

    onMouseDown(e) {}
    onMouseEnter(e) {}
    onMouseLeave(e) {}
    onKeyDown(e) {}

    select() {}
    unselect() {}
    drawBack() {}
    draw() {}
    setWidth(w: number) {
        const oldWidth = this.width;
        this.width = w;
        if (this.width < this.minWidth) { this.width = this.minWidth; }
        if (this.width > this.maxWidth) { this.width = this.maxWidth; }
        this.component.pattern.width = this.width;
        this.deltaWidth = this.width - oldWidth;
        this.component.canvas.nativeElement.width = this.width;
        this.component.canvasBack.nativeElement.width = this.width;
    }
    getWidth(): number { return this.width; }
    getDeltaWidth(): number { return this.deltaWidth; }
    getDistance(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    constructor(p: PatternComponent) {
        this.component = p;

        this.selectedPosition = { x: 0, y: 0 };
        this.ctx = this.component.canvas.nativeElement.getContext('2d');
        this.ctxBack = this.component.canvasBack.nativeElement.getContext('2d');
        this.ctx.lineJoin = 'round';
        this.height = this.component.canvas.nativeElement.height;
        if (this.component.pattern.width == -1) {
            this.width = this.component.canvas.nativeElement.width;
            this.component.canvasBack.nativeElement.width = this.width;
            this.component.canvasBack.nativeElement.height = this.height;
            this.component.pattern.width = this.width;
          } else {
            this.width = this.component.pattern.width;
            this.component.canvas.nativeElement.width = this.width;
            this.component.canvasBack.nativeElement.width = this.width;
          }
    }
}
