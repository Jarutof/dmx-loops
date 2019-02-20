import { Pattern, Point } from '../dmx-model.service';
import { ElementRef, ɵConsole } from '@angular/core';
import { PatternComponent } from './pattern.component';
import { Drawer } from './drawer';




export class PointsDrawer extends Drawer {
    private isCtrlKey = false;
    private pointIndex = 0;
    private savedPoint: Point = {x: 0, y: 0};
    private selectedPoint: Point;
    private highlightedPoint: Point;

    private savedPosition: {x: number; y: number};
    private savedWidth: number;

    private mousedown: boolean = false;
    private colorBackDark_unfocus: string = '#252526';
    private colorBackLigth_unfocus: string = '#444';
    private colorBackDark_focus: string = '#454546';
    private colorBackLigth_focus: string = '#666';
    private colorBackDark: string = '#252526';
    private colorBackLigth: string = '#444';


    listenerMouseMove: () => void;
    listenerMouseUp: () => void;

    drawSelectedLine() {}
    drawResizeArea() {}
    mouseDown(e: MouseEvent) {}
    mouseMove(e: MouseEvent) {}

    constructor(p: PatternComponent) {
        super(p);
    }

    select() {
        this.isSelected = true;
        this.colorBackDark = this.colorBackDark_focus;
        this.colorBackLigth = this.colorBackLigth_focus;
        this.drawBack();
    }
    unselect() {
        this.isSelected = false;
        this.colorBackDark = this.colorBackDark_unfocus;
        this.colorBackLigth = this.colorBackLigth_unfocus;
        this.drawBack();
      }
    setWidth(w: number) {
        super.setWidth(w);
        this.drawBack();
        this.draw();
    }

    onMouseMoveButtonDown(e: MouseEvent) {
      const rect: ClientRect = this.component.canvas.nativeElement.getBoundingClientRect();
      const nPos =  { x: e.x - rect.left, y: e.y - rect.top };
      this.selectedPosition = nPos;
      const q = 10;
      if (e.shiftKey) {
        this.selectedPosition = { x: Math.round(nPos.x / q) * q, y: Math.round(nPos.y / q) * q };
      }
      this.isCtrlKey = e.ctrlKey;
      if (this.selectedPoint) {
        this.selectedPoint.y = this.selectedPosition.y / this.height;
        if (this.selectedPoint.y < 0) {
          this.selectedPoint.y = 0;
        } else
        if (this.selectedPoint.y > 1) {
          this.selectedPoint.y = 1;
        }
            if (this.selectedPoint != this.component.pattern.getPoints()[0] && this.selectedPoint != this.component.pattern.getPoints()[this.component.pattern.getPoints().length - 1]) {
          const index = this.component.pattern.getPoints().indexOf(this.selectedPoint);
              if (this.selectedPosition.x < this.component.pattern.getPoints()[index - 1].x * this.width) {
            this.selectedPoint.x = this.component.pattern.getPoints()[index - 1].x + 0.0001;
          } else
          if (this.selectedPosition.x > this.component.pattern.getPoints()[index + 1].x * this.width) {
            this.selectedPoint.x = this.component.pattern.getPoints()[index + 1].x - 0.0001;
          } else  {
            this.selectedPoint.x = this.selectedPosition.x / this.width;
          }
        }
      } else {
        if (this.isResize) {
          this.setWidth(this.savedWidth + this.selectedPosition.x - this.savedPosition.x);
          if (e.shiftKey) {
            this.component.onresize.emit(this.component);
          }
        }
      }
      this.draw();
    }

    onMouseMoveButtonUp(e: MouseEvent) {
      this.selectedPosition = { x: e.offsetX, y: e.offsetY };
      this.isCtrlKey = e.ctrlKey;
      this.highlightedPoint = this.component.pattern.getPoints().find(p => this.getDistance({x: p.x * this.width, y: p.y * this.height}, this.selectedPosition) < 6);
      this.component.canvas.nativeElement.style.cursor = 'pointer';
      if (!this.highlightedPoint) {
        // this.mouseDown = () => {};
        if (!this.isCtrlKey) {
          this.mouseDown = () => {
            const point = {x: this.selectedPosition.x / this.width, y: this.selectedPosition.y / this.height};
            this.component.commands.setCommands(() => {
              this.component.pattern.getPoints().splice(this.component.pattern.getPoints().indexOf(point), 1);
              this.draw();
            }, () => {
              this.component.pattern.getPoints().push(point);
              this.component.pattern.getPoints().sort((p1, p2) =>  p1.x > p2.x ? 1 : p1.x < p2.x ? -1 : 0 );
              this.draw();
            });
            this.selectedPoint = point;
            this.pointIndex = this.component.pattern.getPoints().indexOf(this.selectedPoint);
            this.savedPoint.x = point.x;
            this.savedPoint.y = point.y;
          };
          this.findResizeArea();
          // this.findSelectedLine();
        } else {
          this.mouseDown = () => {};
        }

      } else {
        this.mouseDown = (ev: MouseEvent) =>  {
          this.isCtrlKey = ev.ctrlKey;
          if (this.canDelete(this.highlightedPoint)) {
            const point = this.highlightedPoint;
            this.component.commands.setCommands(() => {
              this.component.pattern.getPoints().push(point);
              this.component.pattern.getPoints().sort((p1, p2) =>  p1.x > p2.x ? 1 : p1.x < p2.x ? -1 : 0 );
              this.draw();
            }, () => {
              this.component.pattern.getPoints().splice(this.component.pattern.getPoints().indexOf(point), 1);
              this.draw();
            });
            this.highlightedPoint = undefined;
            this.drawSelectedLine = () => {};
            this.mousedown = false;
          } else {
            this.selectedPoint = this.highlightedPoint;
            this.pointIndex = this.component.pattern.getPoints().indexOf(this.selectedPoint);
            this.savedPoint.x =  this.selectedPoint.x;
            this.savedPoint.y =  this.selectedPoint.y;
            this.highlightedPoint = undefined;
          }
        };
        this.drawSelectedLine = () => {};
      }
      this.draw();
    }

    drawLines() {

      this.ctx.shadowColor = '#BBB';
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      this.ctx.shadowBlur = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(this.component.pattern.getPoints()[0].x * this.width, this.component.pattern.getPoints()[0].y * this.height);
      this.ctx.arc(this.component.pattern.getPoints()[0].x * this.width, this.component.pattern.getPoints()[0].y * this.height, 2, 0, 2 * Math.PI);
      for (let i = 0; i < this.component.pattern.getPoints().length; i++) {
        this.ctx.lineTo(this.component.pattern.getPoints()[i].x * this.width, this.component.pattern.getPoints()[i].y * this.height);
      }
      this.ctx.moveTo(this.component.pattern.getPoints()[this.component.pattern.getPoints().length - 1].x * this.width, this.component.pattern.getPoints()[this.component.pattern.getPoints().length - 1].y * this.height);
      this.ctx.arc(this.component.pattern.getPoints()[this.component.pattern.getPoints().length - 1].x * this.width, this.component.pattern.getPoints()[this.component.pattern.getPoints().length - 1].y * this.height, 2, 0, 2 * Math.PI);
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

    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.drawLines();
      this.drawPoints();
      this.drawResizeArea();
    }

    onMouseEnter(e: MouseEvent) {
        if (e.buttons != 1) {
          this.mouseMove = this.onMouseMoveButtonUp;
          this.listenerMouseMove = this.component.renderer.listen(document, 'mousemove', (event) => {
            this.mouseMove(event);
          });
        }
        this.drawPoints = () => {
          this.ctx.beginPath();
          this.ctx.moveTo(this.component.pattern.getPoints()[0].x * this.width, this.component.pattern.getPoints()[0].y * this.height);
          for (let i = 0; i < this.component.pattern.getPoints().length; i++) {
            this.ctx.moveTo(this.component.pattern.getPoints()[i].x * this.width, this.component.pattern.getPoints()[i].y * this.height);
            this.ctx.arc(this.component.pattern.getPoints()[i].x * this.width, this.component.pattern.getPoints()[i].y * this.height, 6, 0, 2 * Math.PI);
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

      onMouseDown(e: MouseEvent) {
        if (!this.isSelected && !this.isResize ) { return; }
        this.mouseMove = this.onMouseMoveButtonDown;
        this.listenerMouseUp = this.component.renderer.listen(document, 'mouseup', (event) => {
          if (this.isResize) {
            const swidth = this.savedWidth;
            const nwidth = this.savedWidth + this.selectedPosition.x - this.savedPosition.x;
            this.component.commands.setCommands(() => {
              this.setWidth(swidth);
            }, () => {
              this.setWidth(nwidth);
            });
          } else {
            if (this.selectedPoint) {
              const index = this.pointIndex;
              const spoint = {x: 0, y: 0};
              const npoint = {x: 0, y: 0};
              npoint.x = this.selectedPoint.x;
              npoint.y = this.selectedPoint.y;
              spoint.x = this.savedPoint.x;
              spoint.y = this.savedPoint.y;
              this.component.commands.setCommands(() => {
                this.component.pattern.getPoints()[index].x = spoint.x;
                this.component.pattern.getPoints()[index].y = spoint.y;
                this.draw();
              }, () => {
                this.component.pattern.getPoints()[index].x = npoint.x;
                this.component.pattern.getPoints()[index].y = npoint.y;
                this.draw();
              });
            }
          }
          this.mousedown = false;
          this.selectedPoint = undefined;
          this.isResize = false;
          this.drawResizeArea = () => {};
          if (e.target != event.target) {
            this.drawPoints = () => {};
          }
          const rect: ClientRect = this.component.canvas.nativeElement.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
            if (this.listenerMouseMove) {
              this.listenerMouseMove();
            }
          } else {
            this.mouseMove = this.onMouseMoveButtonUp;
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

      onKeyDown(e: KeyboardEvent) {
        this.isCtrlKey = e.ctrlKey;
        if (this.isCtrlKey) {
          this.drawSelectedLine = () => {};
        }
      }

      canDelete(p): boolean {
        if (this.isCtrlKey) {
          if (p != this.component.pattern.getPoints()[0] && p != this.component.pattern.getPoints()[this.component.pattern.getPoints().length - 1]) {
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
          this.ctx.arc(this.selectedPoint.x * this.width,  this.selectedPoint.y * this.height, 6, 0, 2 * Math.PI);
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
            this.isResize = true;
            this.savedPosition = {x: this.selectedPosition.x, y: this.selectedPosition.y};
            this.savedWidth = this.width;
          };
          this.component.canvas.nativeElement.style.cursor = 'e-resize';
        } else {
          this.drawResizeArea = () => {};
          // this.canvas.nativeElement.style.cursor = 'default';
          this.component.canvas.nativeElement.style.cursor = 'pointer';
        }
      }
}
