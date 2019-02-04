import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { GroupElement } from 'src/app/dmx-model.service';

@Component({
  selector: 'app-group-element',
  templateUrl: './group-element.component.html',
  styleUrls: ['./group-element.component.scss']
})
export class GroupElementComponent implements OnInit {
  @Output() onDrag = new EventEmitter<{e: MouseEvent, g: GroupElement }>();

  private ctx: CanvasRenderingContext2D;
  // private ctxBack: CanvasRenderingContext2D;
  public width: number;
  public height: number;

  private colorBackDark_unfocus: string = '#252526';
  private colorBackLigth_unfocus: string = '#444';
  private colorBackDark_focus: string = '#454546';
  private colorBackLigth_focus: string = '#666';

  private isResize: boolean = false;
  private isReplace: boolean = false;
  private savedPosition: {x: number; y: number};
  private savedWidth: number;


  private colorBackDark: string = '#252526';
  private colorBackLigth: string = '#444';
  public widthResizeArea: number = 20;
  public minWidth: number = this.widthResizeArea * 3;
  public selectedPosition: { x: number; y: number };

  listenerMouseMove: () => void;
  listenerMouseUp: () => void;

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  @Output() onresize = new EventEmitter<GroupElementComponent>();
  // @ViewChild('canvasBack') canvasBack: ElementRef<HTMLCanvasElement>;
  @Input() groupElement: GroupElement;
  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.canvas.nativeElement.width = this.groupElement.width;
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.draw();
  }
  drawResizeArea() {}
  mouseDown(e: MouseEvent) {}
  mouseMove(e: MouseEvent) {}

  onMouseEnter(e: MouseEvent) {
    if (e.buttons != 1) {
      this.mouseMove = this.onMouseMoveButtonUp;

      if (this.listenerMouseMove) {
        this.listenerMouseMove();
      }

      this.listenerMouseMove = this.renderer.listen(document, 'mousemove', (event) => {
        this.mouseMove(event);
      });
      /* this.listenerMouseMove = this.renderer.listen(e.target, 'mousemove', (event) => {
        this.onMouseMoveButtonUp(event);
      }); */
    }
  }

  onMouseLeave(e: MouseEvent) {

    if (e.buttons != 1) {
      this.isResize = false;

      if (this.listenerMouseMove) {
        this.listenerMouseMove();
      }
      this.drawResizeArea = () => {};
      this.onMouseMoveButtonDown = () => {};

    }
    this.draw();
  }
  onMouseDown(e: MouseEvent) {
    /* if (this.listenerMouseMove) {
      this.listenerMouseMove();
    } */
    this.mouseDown(e);
    this.mouseMove = this.onMouseMoveButtonDown;

    /* this.listenerMouseMove = this.renderer.listen(document, 'mousemove', (event) => {
      this.onMouseMoveButtonDown(event);
    }); */
    this.listenerMouseUp = this.renderer.listen(document, 'mouseup', (event: MouseEvent) => {
      this.drawResizeArea = () => {};
      if (this.isReplace) {
        this.onDrag.emit({e: event, g: this.groupElement});
        this.groupElement.position.y = 0;
        this.isReplace = false;
      }

      /* if (this.listenerMouseMove) {
        this.listenerMouseMove();
      } */
      // console.log(event.target == this.canvas.nativeElement);
      if (event.target != this.canvas.nativeElement) {
        if (this.listenerMouseMove) {
          this.listenerMouseMove();
        }
      } else {
        this.mouseMove = this.onMouseMoveButtonUp;
      }
      /* const rect: ClientRect = this.canvas.nativeElement.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        console.log('unsub');
        if (this.listenerMouseMove) {
          this.listenerMouseMove();
        }
      } */

      if (this.listenerMouseUp) {
        this.listenerMouseUp();
      }
      this.mouseDown = () => {};

      if (this.isResize) {
        this.onresize.emit(this);
        this.isResize = false;

      }

      this.draw();
    });

  }

  setWidth(w) {
    if (w < this.minWidth) {
      w = this.minWidth;
    }
    this.groupElement.width = w;
    this.width = w;
    this.canvas.nativeElement.width = this.width;
    this.draw();
  }

  onMouseMoveButtonDown (e: MouseEvent) {}
    /* const rect: ClientRect = this.canvas.nativeElement.getBoundingClientRect();
    this.selectedPosition = { x: e.x - rect.left, y: e.y - rect.top };
    if (this.canResize) {
      this.setWidth(this.savedWidth + this.selectedPosition.x - this.savedPosition.x);
    } */
  onMouseMoveButtonUp(e: MouseEvent) {
    this.selectedPosition = { x: e.offsetX, y: e.offsetY };
    this.findResizeArea();
    this.draw();
  }

  findResizeArea() {
    if (this.selectedPosition.x > this.width - this.widthResizeArea) {
        this.canvas.nativeElement.style.cursor = 'e-resize';
        this.drawResizeArea = () => {
        this.ctx.beginPath();
        this.ctx.moveTo(this.width - this.widthResizeArea / 2, 0);
        this.ctx.lineTo(this.width - this.widthResizeArea / 2, this.height);
        this.ctx.lineWidth = this.widthResizeArea;
        this.ctx.strokeStyle = '#FFFFFF10';
        this.ctx.stroke();
      };

      this.mouseDown = () => {
        this.onMouseMoveButtonDown = (e) => {
          const rect: ClientRect = this.canvas.nativeElement.getBoundingClientRect();
          this.selectedPosition = { x: e.x - rect.left, y: e.y - rect.top };
          this.setWidth(this.savedWidth + this.selectedPosition.x - this.savedPosition.x);
        };
        this.isResize = true;
        this.savedPosition = {x: this.selectedPosition.x, y: this.selectedPosition.y};
        this.savedWidth = this.width;
      };

    } else if (this.selectedPosition.x < this.widthResizeArea) {
      this.canvas.nativeElement.style.cursor = 'e-resize';
      this.drawResizeArea = () => {
        this.ctx.beginPath();
        this.ctx.moveTo(this.widthResizeArea / 2, 0);
        this.ctx.lineTo(this.widthResizeArea / 2, this.height);
        this.ctx.lineWidth = this.widthResizeArea;
        this.ctx.strokeStyle = '#FFFFFF10';
        this.ctx.stroke();
      };
      this.mouseDown = () => {
        this.onMouseMoveButtonDown = (e) => {
          const rect: ClientRect = this.canvas.nativeElement.getBoundingClientRect();
          this.selectedPosition = { x: e.x - rect.left, y: e.y - rect.top };
          this.groupElement.position.x += this.selectedPosition.x - this.savedPosition.x;
          if (this.groupElement.position.x < 0) {
            this.groupElement.position.x = 0;
          }
          this.setWidth(this.savedWidth + (savedPos - this.groupElement.position.x));
          this.isResize = true;
        };
        this.savedPosition = {x: this.selectedPosition.x, y: this.selectedPosition.y};
        this.savedWidth = this.width;
        const savedPos = this.groupElement.position.x;
      };
    } else {
      this.mouseDown = (me: MouseEvent) => {
        this.onMouseMoveButtonDown = (e) => {
          const rect: ClientRect = this.canvas.nativeElement.getBoundingClientRect();
          this.selectedPosition = { x: e.x - rect.left, y: e.y};
          this.groupElement.position.x += this.selectedPosition.x - this.savedPosition.x;
          if (this.groupElement.position.x < 0) {
            this.groupElement.position.x = 0;
          }
          this.groupElement.position.y = this.selectedPosition.y - this.savedPosition.y;
          // this.isResize = true;
          this.isReplace = true;
          // this.onDrag.emit({e, g: this.groupElement});
          // console.log(this.selectedPosition.y, this.savedPosition.y);
        };
        this.savedPosition = {x: this.selectedPosition.x, y: me.y};
      };
      this.drawResizeArea = () => {};
      /* this.drawResizeArea = () => {};
      this.mouseDown = () => {};
      this.onMouseMoveButtonDown = (e) => {}; */
      this.canvas.nativeElement.style.cursor = 'default';
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.shadowBlur = 0;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.width, this.height);
    const gradient = this.ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0.0, this.colorBackDark);
    gradient.addColorStop(0.4, this.colorBackLigth);
    gradient.addColorStop(1, this.colorBackDark);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.shadowColor = '#000';
    this.ctx.shadowBlur = 4;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#666';

    this.groupElement.group.channels.forEach((val, i, arr) => {
      this.ctx.moveTo(0, i * this.height / this.groupElement.group.channels.length);
      this.ctx.lineTo(this.width, i * this.height / this.groupElement.group.channels.length);

    });
    this.ctx.moveTo(0, this.height);
    this.ctx.lineTo(this.width, this.height);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;

    let totalWidth = 0;
    this.groupElement.group.channels.forEach(c => {
      let tw = 0;
      c.patterns.forEach(p => tw += p.width);
      if (tw > totalWidth) { totalWidth = tw; }
    });
    this.ctx.beginPath();

    this.groupElement.group.channels.forEach((val, ci, cs) => {
      let pos = 0;
      let x = 0;
      val.patterns.forEach((pat, pi, ps) => {
        // this.ctx.moveTo(0, 0);
        // this.ctx.lineTo(this.width, this.height);
        /* this.ctx.moveTo(pat.points[0].x * this.width, pat.points[0].y * ci * this.height / this.groupElement.group.channels.length);
        */
        const w = pat.width * this.width / totalWidth;
        x = pat.getPoints()[0].x * w + pos;
        if (pi == 0) {
          this.ctx.moveTo(x, pat.getPoints()[0].y * this.height / this.groupElement.group.channels.length + ci * this.height / this.groupElement.group.channels.length);
        }

        // this.ctx.moveTo(x, pat.points[0].y * this.height / this.groupElement.group.channels.length + ci * this.height / this.groupElement.group.channels.length);
        for (let i = 0; i < pat.getPoints().length; i++) {
          x = pat.getPoints()[i].x * w + pos;
          this.ctx.lineTo(x,
          pat.getPoints()[i].y * this.height / this.groupElement.group.channels.length + ci * this.height / this.groupElement.group.channels.length);
        }
        if (pi == val.patterns.length - 1) {
          if (x < this.width) {
            this.ctx.lineTo(this.width,
              pat.getPoints()[pat.getPoints().length - 1].y * this.height / this.groupElement.group.channels.length + ci * this.height / this.groupElement.group.channels.length);
          }
        }
        // this.ctx.stroke();
        pos += this.width * pat.width / totalWidth;
      });
    });
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#808080';
    this.ctx.shadowColor = '#DD8';
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.shadowBlur = 10;
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(0.5, 0);
    this.ctx.lineTo(0.5, this.height);
    this.ctx.moveTo(this.width - 0.5, 0);
    this.ctx.lineTo(this.width - 0.5, this.height);
    this.ctx.stroke();
    this.drawResizeArea();

  }
}
