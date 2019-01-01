import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2, Output, EventEmitter, OnDestroy, AfterViewInit } from '@angular/core';
import { DmxModelService, Pattern } from '../dmx-model.service';

@Component({
  selector: 'app-pattern',
  templateUrl: './pattern.component.html',
  styleUrls: ['./pattern.component.scss']
})
export class PatternComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasBack') canvasBack: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') container: ElementRef<HTMLElement>;
  @Input() pattern: Pattern; // {x: number; y: number }[];
  @Output() onresize = new EventEmitter<PatternComponent>();
  @Output() oninit = new EventEmitter<PatternComponent>();
  @Output() ondestroy = new EventEmitter<PatternComponent>();
  @Output() onfocus = new EventEmitter<PatternComponent>();


  private selectedPoint: {x: number; y: number};
  private highlightedPoint: {x: number; y: number};
  private ctx: CanvasRenderingContext2D;
  private ctxBack: CanvasRenderingContext2D;
  private mousedown: boolean = false;
  private isCtrlKey = false;
  public selectedPosition: { x: number; y: number };
  public deltaWidth: number;
  public width: number;
  public height: number;
  public minWidth: number = 100;
  public maxWidth: number = 1000;
  public widthResizeArea: number = 20;


  private canResize: boolean = false;
  private savedPosition: {x: number; y: number};
  private savedWidth: number;

  private colorBackDark_unfocus: string = '#252526';
  private colorBackLigth_unfocus: string = '#444';
  private colorBackDark_focus: string = '#454546';
  private colorBackLigth_focus: string = '#666';

  private colorBackDark: string = '#252526';
  private colorBackLigth: string = '#444';

  listenerMouseMove: () => void;
  listenerMouseUp: () => void;

  constructor(private renderer: Renderer2, private model: DmxModelService) {
  }

  ngAfterViewInit() {
    setTimeout(() => this.canvas.nativeElement.focus(), 0);
  }

  ngOnInit() {
    this.selectedPosition = { x: 0, y: 0 };
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctxBack = this.canvasBack.nativeElement.getContext('2d');
    this.ctx.lineJoin = 'round';
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.canvasBack.nativeElement.width = this.width;
    this.canvasBack.nativeElement.height = this.height;

    this.canvas.nativeElement.addEventListener('focus', (e) => { this.onfocus.emit(this); });
      /* console.log('focus', e);
      this.colorBackDark = this.colorBackDark_focus;
      this.colorBackLigth = this.colorBackLigth_focus;
      this.drawBack();
      this.model.selectPattern(this);
    }); */
    if (this.pattern.width == -1) {
      this.pattern.width = this.width;
    } else {
      this.setWidth(this.pattern.width);
    }

    this.drawBack();
    this.draw();
    this.oninit.emit(this);

  }

  select() {
    this.colorBackDark = this.colorBackDark_focus;
    this.colorBackLigth = this.colorBackLigth_focus;
    this.drawBack();
  }


  unselect() {
    this.colorBackDark = this.colorBackDark_unfocus;
    this.colorBackLigth = this.colorBackLigth_unfocus;
    this.drawBack();
  }

  ngOnDestroy() {
    this.ondestroy.emit(this);
  }


  getDistance(p1, p2: {x: number, y: number}): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }


  setWidth(w: number) {
    const oldWidth = this.width;
    this.width = w;
    if (this.width < this.minWidth) this.width = this.minWidth;
    if (this.width > this.maxWidth) this.width = this.maxWidth;
    this.pattern.width = this.width;

    this.deltaWidth = this.width - oldWidth;
    this.canvas.nativeElement.width = this.width;
    this.canvasBack.nativeElement.width = this.width;
    this.draw();
    this.drawBack();
  }

  onMouseMoveButtonDown(e: MouseEvent) {
    // this.selectedPosition = { x: e.offsetX, y: e.offsetY };
    const rect: ClientRect = this.canvas.nativeElement.getBoundingClientRect();
    this.selectedPosition = { x: e.x - rect.left, y: e.y - rect.top };
    this.isCtrlKey = e.ctrlKey;
    if (this.selectedPoint) {
      this.selectedPoint.y = this.selectedPosition.y / this.height;
      if (this.selectedPoint.y < 0) {
        this.selectedPoint.y = 0;
      } else
      if (this.selectedPoint.y > 1) {
        this.selectedPoint.y = 1;
      }

      if (this.selectedPoint != this.pattern.points[0] && this.selectedPoint != this.pattern.points[this.pattern.points.length - 1]) {
        const index = this.pattern.points.indexOf(this.selectedPoint);

        if (this.selectedPosition.x < this.pattern.points[index - 1].x * this.width) {
          this.selectedPoint.x = this.pattern.points[index - 1].x + 0.0001;
        } else
        if (this.selectedPosition.x > this.pattern.points[index + 1].x * this.width) {
          this.selectedPoint.x = this.pattern.points[index + 1].x - 0.0001;
        } else  {
          this.selectedPoint.x = this.selectedPosition.x / this.width;
        }
      }
    } else {
      if (this.canResize) {
        this.setWidth(this.savedWidth + this.selectedPosition.x - this.savedPosition.x);
        if (e.shiftKey) {
          this.onresize.emit(this);
        }
      }
    }
    this.draw();
  }

  onMouseMoveButtonUp(e: MouseEvent) {
    this.selectedPosition = { x: e.offsetX, y: e.offsetY };
    this.isCtrlKey = e.ctrlKey;
    this.highlightedPoint = this.pattern.points.find(p => this.getDistance({x: p.x * this.width, y: p.y * this.height}, this.selectedPosition) < 6);
    if (!this.highlightedPoint) {
      this.mouseDown = () => {};
      if (!this.isCtrlKey) {
        this.findSelectedLine();
      }
    } else {
      this.canvas.nativeElement.style.cursor = 'pointer';
      this.mouseDown = (e: MouseEvent) => {
        if (this.canDelete(this.highlightedPoint)) {
          this.pattern.points.splice(this.pattern.points.indexOf(this.highlightedPoint), 1);
          this.highlightedPoint = undefined;
          this.drawSelectedLine = () => {};
          this.mousedown = false;
        } else {
          this.selectedPoint = this.highlightedPoint;
          this.highlightedPoint = undefined;
        }
      };
      this.drawSelectedLine = () => {};
    }
    this.draw();
  }

  findResizeArea() {
    if (this.selectedPosition.x > this.width - this.widthResizeArea) {
      this.drawResizeArea = () => {
        this.ctx.beginPath();
        this.ctx.moveTo(this.width - this.widthResizeArea / 2, 0);
        this.ctx.lineTo(this.width - this.widthResizeArea / 2, this.height);
        this.ctx.lineWidth = this.widthResizeArea;
        this.ctx.strokeStyle = '#FFFFFF10';
        this.ctx.stroke();
      };
      this.mouseDown = () => {
        this.canResize = true;
        this.savedPosition = {x: this.selectedPosition.x, y: this.selectedPosition.y};
        this.savedWidth = this.width;
      };
      this.canvas.nativeElement.style.cursor = 'e-resize';

    } else {
      this.drawResizeArea = () => {};
      this.canvas.nativeElement.style.cursor = 'default';
    }
  }

  getClass() {
    return {
      'canvas ': true
    };
  }

  mouseDown(e: MouseEvent) {}

  findSelectedLine(): boolean {
    const filtred = this.pattern.points.filter(p => this.selectedPosition.x > p.x * this.width);
    const lPoint = filtred[filtred.length - 1];
    const rPoint = this.pattern.points[this.pattern.points.lastIndexOf(lPoint) + 1];
    if (lPoint != undefined && lPoint != this.pattern.points[this.pattern.points.length - 1]) {
      this.drawSelectedLine = () => {
        this.ctx.beginPath();
        this.ctx.moveTo(lPoint.x * this.width, lPoint.y * this.height);
        this.ctx.lineTo(rPoint.x * this.width, rPoint.y * this.height);
        this.ctx.lineWidth = 12;
        if (this.ctx.isPointInStroke(this.selectedPosition.x, this.selectedPosition.y)) {
          this.ctx.strokeStyle = '#80FF8048';
          this.ctx.fillStyle = '#0F0';
          this.ctx.stroke();
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(this.selectedPosition.x, this.selectedPosition.y);
          this.ctx.arc(this.selectedPosition.x, this.selectedPosition.y, 6, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.stroke();
          this.mouseDown = () => {
            this.pattern.points.push({x: this.selectedPosition.x / this.width, y: this.selectedPosition.y / this.height});

            this.pattern.points.sort((p1, p2) =>  p1.x > p2.x ? 1 : p1.x < p2.x ? -1 : 0 );
            this.selectedPoint = this.pattern.points.find(p => this.getDistance({x: p.x * this.width, y: p.y * this.height}, this.selectedPosition) < 6);
          };
          this.canvas.nativeElement.style.cursor = 'pointer';

        } else {
          this.mouseDown = () => {};
          this.findResizeArea();
        }
      };
      return true;
    } else {
      return false;
    }
  }
  onMouseDown(e: MouseEvent) {
    this.listenerMouseMove = this.renderer.listen(document, 'mousemove', (event) => {
      this.onMouseMoveButtonDown(event);
    });
    this.listenerMouseUp = this.renderer.listen(document, 'mouseup', (event) => {
      this.mousedown = false;
      this.selectedPoint = undefined;
      this.canResize = false;
      this.drawResizeArea = () => {};

      if (e.target != event.target) {
        this.drawPoints = () => {};
      }
      if (this.listenerMouseMove) {
        this.listenerMouseMove();
      }
      if (this.listenerMouseUp) {
        this.listenerMouseUp();
      }
      this.draw();
    });

    this.mousedown = true;
    this.mouseDown(e);
    this.mouseDown = () => {};
    this.drawSelectedLine = () => {};
  }

  onMouseEnter(e: MouseEvent) {
    if (e.buttons != 1) {
      this.listenerMouseMove = this.renderer.listen(e.target, 'mousemove', (event) => {
        this.onMouseMoveButtonUp(event);
      });
    }


    this.drawPoints = () => {
      this.ctx.beginPath();
      this.ctx.moveTo(this.pattern.points[0].x * this.width, this.pattern.points[0].y * this.height);
      for (let i = 0; i < this.pattern.points.length; i++) {
        this.ctx.moveTo(this.pattern.points[i].x * this.width, this.pattern.points[i].y * this.height);
        this.ctx.arc(this.pattern.points[i].x * this.width, this.pattern.points[i].y * this.height, 6, 0, 2 * Math.PI);
      }

      this.ctx.strokeStyle = 'transparent';
      this.ctx.fillStyle = '#88F';
      this.ctx.lineWidth = 1;
      this.ctx.fill();
      this.ctx.stroke();

      this.drawSelectedPoint();
    };
  }
  onMouseLeave(e: MouseEvent) {
    this.drawSelectedLine = () => {};
    if (!this.mousedown) {
      if (this.listenerMouseMove) {
        this.listenerMouseMove();
      }
      this.drawPoints = () => {};
      this.drawResizeArea = () => {};
    }
    this.draw();
  }

  onKeyDown(e: KeyboardEvent) {
    this.isCtrlKey = e.ctrlKey;
    if (this.isCtrlKey) {
      this.drawSelectedLine = () => {};
    }
  }

  canDelete(p): boolean {
    if (this.isCtrlKey) {
      if (p != this.pattern.points[0] && p != this.pattern.points[this.pattern.points.length - 1]) {
        return true;
      }
    }
    return false;
  }


  drawPoints() {}
  drawSelectedPoint() {
    if (this.highlightedPoint) {
      this.ctx.beginPath();
      this.ctx.arc( this.highlightedPoint.x * this.width,  this.highlightedPoint.y * this.height, 6, 0, 2 * Math.PI);
      if (this.canDelete(this.highlightedPoint)) {
        this.ctx.strokeStyle = 'transparent';
        this.ctx.fillStyle = '#F88';
      } else {
        this.ctx.strokeStyle = 'transparent';
        this.ctx.fillStyle = '#8FF';
      }
      this.ctx.lineWidth = 1;
      this.ctx.fill();
      this.ctx.stroke();
    }
    if (this.selectedPoint) {
      this.ctx.beginPath();
      this.ctx.arc( this.selectedPoint.x * this.width,  this.selectedPoint.y * this.height, 6, 0, 2 * Math.PI);
      if (this.canDelete(this.selectedPoint)) {
        this.ctx.strokeStyle = 'transparent';
        this.ctx.fillStyle = '#F88';
      } else {
        this.ctx.strokeStyle = 'transparent';
        this.ctx.fillStyle = '#8F8';
      }
      this.ctx.lineWidth = 1;
      this.ctx.fill();
      this.ctx.stroke();
    }
  }

  drawSelectedLine() {}
  drawResizeArea() {}
  drawLines() {

    this.ctx.shadowColor = '#BBB';
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.shadowBlur = 4;

    this.ctx.beginPath();
    this.ctx.moveTo(this.pattern.points[0].x * this.width, this.pattern.points[0].y * this.height);
    this.ctx.arc(this.pattern.points[0].x * this.width, this.pattern.points[0].y * this.height, 2, 0, 2 * Math.PI);

    for (let i = 0; i < this.pattern.points.length; i++) {
      this.ctx.lineTo(this.pattern.points[i].x * this.width, this.pattern.points[i].y * this.height);
    }
    this.ctx.moveTo(this.pattern.points[this.pattern.points.length - 1].x * this.width, this.pattern.points[this.pattern.points.length - 1].y * this.height);
    this.ctx.arc(this.pattern.points[this.pattern.points.length - 1].x * this.width, this.pattern.points[this.pattern.points.length - 1].y * this.height, 2, 0, 2 * Math.PI);

    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#FFFFFF4F';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.drawSelectedLine();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawLines();
    this.drawPoints();
    this.drawResizeArea();

  }

  drawBack() {
    this.ctxBack.shadowOffsetX = 0;
    this.ctxBack.shadowOffsetY = 0;
    this.ctxBack.shadowBlur = 0;
    this.ctxBack.beginPath();
    this.ctxBack.rect(0, 0, this.width, this.height);
    const gradient = this.ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0.0, this.colorBackDark);
    gradient.addColorStop(0.4, this.colorBackLigth);
    gradient.addColorStop(1, this.colorBackDark);
    this.ctxBack.fillStyle = gradient;
    this.ctxBack.fill();
    this.ctxBack.closePath();
    this.ctxBack.beginPath();
    this.ctxBack.shadowColor = '#000';
    this.ctxBack.shadowBlur = 4;
    this.ctxBack.lineWidth = 1;
    this.ctxBack.strokeStyle = '#666';
    this.ctxBack.moveTo(0, 0);
    this.ctxBack.lineTo(this.width, 0);
    this.ctxBack.moveTo(0, this.height);
    this.ctxBack.lineTo(this.width, this.height);
    this.ctxBack.moveTo(0, this.height / 2);
    this.ctxBack.lineTo(this.width, this.height / 2);
    this.ctxBack.moveTo(0, this.height / 4);
    this.ctxBack.lineTo(this.width, this.height / 4);
    this.ctxBack.moveTo(0, this.height * 3 / 4);
    this.ctxBack.lineTo(this.width, this.height * 3 / 4);
    this.ctxBack.stroke();
    this.ctxBack.beginPath();
    this.ctxBack.strokeStyle = '#808080';
    this.ctxBack.shadowColor = '#DD8';
    this.ctxBack.shadowOffsetX = 0;
    this.ctxBack.shadowOffsetY = 0;
    this.ctxBack.shadowBlur = 10;
    this.ctxBack.lineWidth = 1;
    this.ctxBack.moveTo(0.5, 0);
    this.ctxBack.lineTo(0.5, this.height);
    this.ctxBack.moveTo(this.width - 0.5, 0);
    this.ctxBack.lineTo(this.width - 0.5, this.height);
    this.ctxBack.stroke();
  }


  ngOnChanges() {
    // this.draw();
  }
}
