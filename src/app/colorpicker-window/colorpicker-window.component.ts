import { Component, ViewChild, ElementRef, OnInit, Renderer2, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-colorpicker-window',
  templateUrl: './colorpicker-window.component.html',
  styleUrls: ['./colorpicker-window.component.scss']
})
export class ColorpickerWindowComponent implements OnInit {
  @ViewChild('canvasBack') canvasBack: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') container: ElementRef<HTMLCanvasElement>;

  public ctxBack: CanvasRenderingContext2D;
  public ctx: CanvasRenderingContext2D;
  public visible = false;
  public visibleAnimate = false;
  public position: {x: number, y: number } = {x: 0, y: 0};

  palette: Array<string> = [
    '#FF0000',
    '#FF8000',
    '#FFFF00',
    '#80FF00',
    '#00FF00',
    '#00FF80',
    '#00FFFF',
    '#0080FF',
    '#0000FF',
    '#8000FF',
    '#FF00FF',
    '#FF0080',
  ];
  width: number = 200;
  height: number = 180;
  radius: number = 80;

  colorRGB: string = '#FFFFFF';
  colorRGBA: string = '#FFFFFFFF';
  alpha: number = 255;
  pic = new Image();
  picFunction;
  listenerMouseMove: () => void;
  listenerMouseUp: () => void;

  constructor(public renderer: Renderer2) {

  }

  ngOnInit() {
    this.ctxBack = this.canvasBack.nativeElement.getContext('2d');
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.canvasBack.nativeElement.width = this.width;
    this.canvasBack.nativeElement.height = this.height;

    this.canvas.nativeElement.width = this.width;
    this.canvas.nativeElement.height = this.height;

    this.pic.src = 'assets/picker2.png';
    this.pic.onload = () => {
      this.ctxBack.drawImage(this.pic, (this.width - this.radius * 2) / 2, (this.height - this.radius * 2) / 2, this.radius * 2, this.radius * 2);
    };
  }
  public show(e: MouseEvent, f): void {
    this.position = { x: e.x - 150, y: e.y - 150 };
    this.picFunction = f;
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 100);
  }

  public hide(): void {
    this.visible = false;
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
  }

  public onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains('modal')) {
      this.hide();
    }
  }

  onPaletteItemClick(c: string) {
    this.colorRGB = c;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.alpha = 255;
    this.colorRGBA = this.colorRGB + ('00' + this.alpha.toString(16)).slice(-2);
  }

  onAlphaMouseDown(e: MouseEvent) {
    this.listenerMouseMove = this.renderer.listen(document, 'mousemove', (event) => {
      const rect: ClientRect = this.container.nativeElement.getBoundingClientRect();
      const nPos =  { x: event.x - rect.left, y: event.y - rect.top };
      console.log(nPos.y, rect.height);
      const y = nPos.y > rect.height ? rect.height : nPos.y < 0 ? 0 : nPos.y;

      this.alpha = Math.round( 255 * (rect.height - y) / rect.height);
      this.colorRGBA = this.colorRGB + ('00' + this.alpha.toString(16)).slice(-2);
    });
    this.listenerMouseUp =  this.renderer.listen(document, 'mouseup', (event) => {
      if (this.listenerMouseUp) {
        this.listenerMouseUp();
      if (this.listenerMouseMove) {
        this.listenerMouseMove();
      }
    }
    });
  }

  onButtonDown() {
    this.picFunction(this.colorRGBA);
    this.hide();
  }

  onMouseDown(e: MouseEvent) {
    this.listenerMouseMove = this.renderer.listen(document, 'mousemove', (event) => {
      // const data: ImageData = this.ctx.getImageData(event.offsetX, event.offsetY, 1, 1);
      const rect: ClientRect = this.canvas.nativeElement.getBoundingClientRect();
      const nPos =  { x: event.x - rect.left, y: event.y - rect.top };

      this.draw(nPos.x, nPos.y);
    });
    this.listenerMouseUp =  this.renderer.listen(document, 'mouseup', (event) => {
      if (this.listenerMouseUp) {
        this.listenerMouseUp();
      if (this.listenerMouseMove) {
        this.listenerMouseMove();
      }
    }
    });
  }
  getRGBString(arr: Uint8ClampedArray): string {
    return '#' +
    ('00' + Math.round(arr[0]).toString(16)).slice(-2) +
    ('00' + Math.round(arr[1]).toString(16)).slice(-2) +
    ('00' + Math.round(arr[2]).toString(16)).slice(-2); // +
    // ('00' + Math.round(arr[3]).toString(16)).slice(-2);
  }

  draw(x: number, y: number) {

    const len = Math.sqrt(Math.pow(x - this.width / 2, 2) + Math.pow(y - this.height / 2, 2));
    if (len > this.radius) {
      x = (x - this.width / 2) / len * (this.radius - 0.5) + this.width / 2;
      y = (y - this.height / 2) / len * (this.radius - 0.5) + this.height / 2;
    }
    const data: ImageData = this.ctxBack.getImageData(x, y, 1, 1);
    data.data[3] = this.alpha;
    this.colorRGB = this.getRGBString(data.data);
    this.colorRGBA = this.colorRGB + ('00' + this.alpha.toString(16)).slice(-2);
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = '#000';
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.shadowColor = '#000';
    this.ctx.shadowBlur = 10;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.beginPath();
    this.ctx.fillStyle = this.colorRGB;
    this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
