import { PatternComponent } from './pattern.component';
import { Drawer } from './drawer';
import { RGBPoint } from '../dmx-model.service';

export class ColorDrawer extends Drawer {
    private colorBackDark_unfocus: string = '#252526';
    private colorBackLigth_unfocus: string = '#444';
    private colorBackDark_focus: string = '#454546';
    private colorBackLigth_focus: string = '#666';
    private colorBackDark: string = '#252526';
    private colorBackLigth: string = '#444';
    private topPanelHeight: number = 20;

    private pointIndex = 0;
    private savedPoint: RGBPoint = {x: 0, y: {r: 0, g: 0, b: 0}};
    private selectedPoint: RGBPoint;
    private highlightedPoint: RGBPoint;

    private savedPosition: {x: number; y: number};
    private savedWidth: number;

    listenerMouseMove: () => void;
    listenerMouseUp: () => void;


    drawResizeArea() {}

    mouseDown(e: MouseEvent) {}
    mouseMove(e: MouseEvent) {}
    constructor(p: PatternComponent) {
        super(p);
    }

    onMouseDown(e: MouseEvent) {
        this.mouseDown(e);
        this.mouseDown = () => {};
        this.listenerMouseUp = this.component.renderer.listen(document, 'mouseup', (event) => {
            this.selectedPoint = undefined;
            if (event.target == this.component.canvas.nativeElement) {
                this.mouseMove = this.onMouseHover;
            } else {
                if (this.listenerMouseMove) {
                    this.listenerMouseMove();
                }
            }
            if (this.listenerMouseUp) {
                this.listenerMouseUp();
            }
            this.draw();
        });
        this.draw();
    }
    onMouseEnter(e: MouseEvent) {
        if (e.buttons != 1) {
            this.mouseMove = this.onMouseHover;
            this.listenerMouseMove = this.component.renderer.listen(document, 'mousemove', (event) => {
                this.mouseMove(event);
            });
        }
    }
    onMouseLeave(e: MouseEvent) {
        if (e.buttons != 1) {
            this.highlightedPoint = undefined;
            this.selectedPosition = undefined;
            this.canResize = false;
            if (this.listenerMouseMove) {
                this.listenerMouseMove();
            }
        }
        this.draw();
    }
    onKeyDown(e: KeyboardEvent) {}


    onMouseHover(e: MouseEvent) {
        this.selectedPosition = { x: e.layerX, y: e.layerY };
        if (this.selectedPosition.y < this.topPanelHeight) {
            this.highlightedPoint = this.component.pattern.getPoints().find(p => this.getDistance({x: p.x * this.width, y: this.topPanelHeight / 2}, this.selectedPosition) < this.topPanelHeight / 2 - 2);
        } else {
            this.highlightedPoint = undefined;
            this.mouseDown = () => {};
        }
        if (this.highlightedPoint) {
            this.mouseDown = (ev) => {
                if (ev.ctrlKey) {
                    /* const point = this.highlightedPoint;
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
                    this.mousedown = false; */
                } else {
                    this.selectedPoint = this.highlightedPoint;
                    this.pointIndex = this.component.pattern.getPoints().indexOf(this.selectedPoint);
                    this.savedPoint.x = this.selectedPoint.x;
                    this.savedPoint.y.r = this.selectedPoint.y.r;
                    this.savedPoint.y.g = this.selectedPoint.y.g;
                    this.savedPoint.y.b = this.selectedPoint.y.b;
                    this.highlightedPoint = undefined;
                    this.mouseMove = this.onMouseDrag;
                }
            };
        } else {
            this.mouseDown = () => {};

            if (!e.ctrlKey) {
                /* this.mouseDown = () => {
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
                }; */
                this.findResizeArea();
            }
        }
    }

    onMouseDrag(e: MouseEvent) {
        const rect: ClientRect = this.component.canvas.nativeElement.getBoundingClientRect();
        const nPos =  { x: e.x - rect.left, y: e.y - rect.top };
        this.selectedPosition = nPos;
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
            this.draw();
        }
    }

    findResizeArea() {
        if (this.selectedPosition.x > this.width - this.widthResizeArea) {
            this.canResize = true;
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
          // this.component.canvas.nativeElement.style.cursor = 'e-resize';
        } else {
          this.drawResizeArea = () => {};
          this.canResize = false;

          // this.canvas.nativeElement.style.cursor = 'default';
          // this.component.canvas.nativeElement.style.cursor = 'pointer';
        }
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

    drawBack() {
        this.ctxBack.shadowOffsetX = 0;
        this.ctxBack.shadowOffsetY = 0;
        this.ctxBack.shadowBlur = 0;
        this.ctxBack.beginPath();
        this.ctxBack.rect(0, 0, this.width, this.height);
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
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
    getRGBString(p: RGBPoint): string {
        return '#' +
        ('00' + Math.round(p.y.r * 0xFF).toString(16)).slice(-2) +
        ('00' + Math.round(p.y.g * 0xFF).toString(16)).slice(-2) +
        ('00' + Math.round(p.y.b * 0xFF).toString(16)).slice(-2);
    }
    draw() {
        this.ctxBack.shadowOffsetX = 0;
        this.ctxBack.shadowOffsetY = 0;
        this.ctxBack.shadowBlur = 0;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.beginPath();
        this.ctx.rect(0, this.topPanelHeight, this.width, this.height - this.topPanelHeight);
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);

        this.component.pattern.getPoints().forEach((p: RGBPoint, i) => {
            gradient.addColorStop(p.x, this.getRGBString(p));
        });
        /* gradient.addColorStop(0.0, '#FF0000');
        gradient.addColorStop(0.4, '#FFFF00');
        gradient.addColorStop(1, '#FF00FF'); */
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 6;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'transparent';

        this.component.pattern.getPoints().forEach((p: RGBPoint, i) => {
            this.ctx.beginPath();

            this.ctx.fillStyle = this.getRGBString(p);
            this.ctx.arc(p.x * this.width, this.topPanelHeight / 2, this.topPanelHeight / 2 - 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();
        });

        if (this.selectedPoint) {
            this.ctx.beginPath();

            this.ctx.fillStyle = this.getRGBString(this.selectedPoint);
            this.ctx.arc(this.selectedPoint.x * this.width, this.topPanelHeight / 2, this.topPanelHeight / 2 - 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();
        }
        this.drawResizeArea();

    }
}
