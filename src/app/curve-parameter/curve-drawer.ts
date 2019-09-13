import { CurveParameterComponent } from './curve-parameter.component';
import { Point } from '../dmx-model.service';

export class BezierPoint {
    anchors: Array<Point> = [];
    controls: Array<Point> = [];
    getDistance(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    setControl(p: Point, id: number) {
        this.controls[id] = p;
        this.anchors[id] = p;
    }

    getAnchorPoints() {
        return [this.anchors[0], {x: this.anchors[0].x + this.anchors[1].x, y: this.anchors[0].y + this.anchors[1].y},  {x: this.anchors[3].x + this.anchors[2].x, y: this.anchors[3].y + this.anchors[2].y}, this.anchors[3]];
    }

    calcAnch(id: number, p: Point, dist: number, cId: number) {
        const d = this.getDistance(p, this.controls[cId]);
        const anch: Point = {x: p.x - this.controls[cId].x, y: p.y - this.controls[cId].y};
        const norm: Point = { x: anch.x / d, y: anch.y / d};
        norm.x = Math.max(norm.x + this.controls[cId].x, this.controls[0].x) - this.controls[cId].x;
        norm.x = Math.min(norm.x + this.controls[cId].x, this.controls[3].x) - this.controls[cId].x;
        anch.x = norm.x * dist;
        anch.y = norm.y * dist;
        /* anch.x += this.controls[cId].x;
        anch.y += this.controls[cId].y; */
        this.anchors[id] = anch;
        const midX = this.controls[0].x + (this.controls[3].x - this.controls[0].x) / 2;
        this.controls[id].x = midX;
        this.controls[id].y = this.controls[cId].y + midX * norm.y / Math.abs(norm.x);

        this.controls[id].x -= this.controls[cId].x;
        this.controls[id].y -= this.controls[cId].y;

    }

    setAnchor(id: number, p: Point, dist: number) {
        switch (id) {
            case 0:
            case 3:
                this.setControl(p, id);

            break;
            case 1:
            case 2:
                this.calcAnch(id, p, dist, (id - 1) * (id + 1));
            break;
        }
    }
}

export class BezierAnchorPoint {
    anch_cp1: Point;
    anch_cp2: Point;
    anch_end: Point;
    constructor(anch_cp1: Point, anch_cp2: Point, anch_end: Point) {
        this.anch_cp1 = anch_cp1;
        this.anch_cp2 = anch_cp2;
        this.anch_end = anch_end;
    }
}
export class BezierCurve {
    public points: Array<BezierPoint>;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    period: number;
    anchorDist: number;
    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.period = 0.01;
        this.anchorDist = width * 0.2;
        const point = new BezierPoint();
        point.controls.push({ x: 0, y: 0.5 * height});
        point.controls.push({ x: 0.2 * width, y: 0});
        point.controls.push({ x: -0.2 * width, y: 0});
        point.controls.push({ x: 1 * width, y: 0.5 * height});

        point.anchors.push({ x: 0, y: 0.5 * height});
        point.anchors.push({ x: 0.2 * width, y: 0});
        point.anchors.push({ x: -0.2 * width, y: 0});
        point.anchors.push({ x: 1 * width, y: 0.5 * height});
        this.points = [point];
    }

    addPoint(x: number, y: number) {
        // let point = new BezierPoint(0.1, 0.5, 0.9, 0.5, x, y);
    }

    getValue(t: number) {
        const cp1 = { x: this.points[0].controls[0].x + this.points[0].controls[1].x, y: this.points[0].controls[0].y + this.points[0].controls[1].y };
        const cp2 = { x: this.points[0].controls[3].x + this.points[0].controls[2].x, y: this.points[0].controls[3].y + this.points[0].controls[2].y };
        return (Math.pow(1 - t, 3) * this.points[0].controls[0].y + 3 *  Math.pow(1 - t, 2) * t * cp1.y + 3 * (1 - t) * Math.pow(t, 2) * cp2.y + Math.pow(t, 3) * this.points[0].controls[3].y) / this.height;
    }

    getPoint(t: number): Point {
        // P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
        const cp1 = { x: this.points[0].controls[0].x + this.points[0].controls[1].x, y: this.points[0].controls[0].y + this.points[0].controls[1].y };
        const cp2 = { x: this.points[0].controls[3].x + this.points[0].controls[2].x, y: this.points[0].controls[3].y + this.points[0].controls[2].y };
        const res: Point = { x: Math.pow(1 - t, 3) * this.points[0].controls[0].x + 3 *  Math.pow(1 - t, 2) * t * cp1.x + 3 * (1 - t) * Math.pow(t, 2) * cp2.x + Math.pow(t, 3) * this.points[0].controls[3].x,
            y: Math.pow(1 - t, 3) * this.points[0].controls[0].y + 3 *  Math.pow(1 - t, 2) * t * cp1.y + 3 * (1 - t) * Math.pow(t, 2) * cp2.y + Math.pow(t, 3) * this.points[0].controls[3].y };
        /* const res: Point = { x: Math.pow(1 - t, 3) * this.points[0].controls[0].x + 3 *  Math.pow(1 - t, 2) * t * this.points[0].controls[1].x + 3 * (1 - t) * Math.pow(t, 2) * this.points[0].controls[2].x + Math.pow(t, 3) * this.points[0].controls[3].x,
            y: Math.pow(1 - t, 3) * this.points[0].controls[0].y + 3 *  Math.pow(1 - t, 2) * t * this.points[0].controls[1].y + 3 * (1 - t) * Math.pow(t, 2) * this.points[0].controls[2].y + Math.pow(t, 3) * this.points[0].controls[3].y }; */
        return res;
    }

    draw() {
        this.ctx.strokeStyle = '#7F7';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        let p = 0;

        this.ctx.moveTo(this.points[0].controls[0].x, this.points[0].controls[0].y);
        while (p < 1) {
            const point: Point = this.getPoint(p);
            point.x = Math.min(point.x, this.width);
            point.y = Math.min(point.y, this.height);
            point.x = Math.max(point.x, 0);
            point.y = Math.max(point.y, 0);
            this.ctx.lineTo(point.x, point.y);
            p += this.period;
        }
        this.ctx.lineTo(this.points[0].controls[3].x, this.points[0].controls[3].y);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.strokeStyle = '#7F7';
        this.ctx.fillStyle = '#7F7';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.points[0].getAnchorPoints().forEach(a => {
            this.ctx.moveTo(a.x, a.y);
            this.ctx.arc(a.x, a.y, 4, 0, 2 * Math.PI);
        });
        this.ctx.fill();

        this.ctx.closePath();

    }
}

export class CurveDrawer {

    public ctx: CanvasRenderingContext2D;
    public ctxBack: CanvasRenderingContext2D;
    public width: number;
    public height: number;

    private colorBack: string = '#252526';
    public curve: BezierCurve;
    timerId;


    component: CurveParameterComponent;

    listenerMouseMove: () => void;
    listenerMouseUp: () => void;
    mouseDown(e: MouseEvent) {}
    mouseMove(e: MouseEvent) {}
    constructor(p: CurveParameterComponent) {
        this.component = p;

        this.ctx = this.component.canvas.nativeElement.getContext('2d');
        this.ctxBack = this.component.canvasBack.nativeElement.getContext('2d');
        this.ctx.lineJoin = 'round';
        this.width = this.component.container.nativeElement.clientWidth;
        this.height = this.width;
        this.component.canvasBack.nativeElement.width = this.width;
        this.component.canvasBack.nativeElement.height = this.height;
        this.component.canvas.nativeElement.width = this.width;
        this.component.canvas.nativeElement.height = this.height;

        this.curve = new BezierCurve(this.ctx, this.width, this.height);

        this.component.renderer.listen(this.component.canvas.nativeElement, 'mousedown', (event) => this.onMouseDown(event));
        this.component.renderer.listen(this.component.canvas.nativeElement, 'mouseenter', (event) => this.onMouseEnter(event));
        this.component.renderer.listen(this.component.canvas.nativeElement, 'mouseleave', (event) => this.onMouseLeave(event));
    }

    onMouseDown(e) {
        this.mouseDown(e);
        this.mouseDown = () => {};
        this.listenerMouseUp = this.component.renderer.listen(document, 'mouseup', (event) => {
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
    }
    onMouseEnter(e) {
        if (e.buttons != 1) {
            this.mouseMove = this.onMouseHover;
            this.listenerMouseMove = this.component.renderer.listen(document, 'mousemove', (event) => {
                this.mouseMove(event);
            });
        }
    }
    onMouseLeave(e) {
        clearInterval(this.timerId);

        if (e.buttons != 1) {
            if (this.listenerMouseMove) {
                this.listenerMouseMove();
            }
        }
        this.draw();
    }
    onKeyDown(e) {}

    onMouseHover(e: MouseEvent) {
        this.mouseDown = () => {};

        this.draw();
        let counter = 0;
        clearInterval(this.timerId);
        this.timerId = setTimeout(() => {
            this.timerId = setInterval(() => {
                counter++;
                this.drawPointer({ x: e.layerX, y: e.layerY }, counter / 20);
                if (counter == 20) {
                    clearInterval(this.timerId);

                }
            }, 10);
        }, 500);
        
        this.curve.points.forEach((p, pId) => {
            p.getAnchorPoints().forEach((a, idx) => {
                if (this.getDistance({ x: a.x, y: a.y }, { x: e.layerX, y: e.layerY }) < 5) {
                    this.mouseDown = (ev) => {
                        clearInterval(this.timerId);
                        const point = { x: e.x - a.x, y: e.y - a.y };
                        if (pId == 0 && idx == 0) {
                            this.mouseMove = (event) => {
                                let y = Math.max(event.y - point.y, 0);
                                y = Math.min(y, this.height);

                                p.setAnchor(idx, {x: 0, y}, this.curve.anchorDist);
                                this.draw();
                            };
                        } else if (pId == (this.curve.points.length - 1) && idx == 3) {
                            this.mouseMove = (event) => {
                                let y = Math.max(event.y - point.y, 0);
                                y = Math.min(y, this.height);
                                p.setAnchor(idx, {x: this.width, y }, this.curve.anchorDist);
                                this.draw();
                            };
                        } else {
                            this.mouseMove = (event) => {
                                let y = Math.max(event.y - point.y, 0);
                                y = Math.min(y, this.height);
                                p.setAnchor(idx, {x: event.x - point.x, y}, this.curve.anchorDist);
                                this.draw();
                            };
                        }
                    };
                }

            });
        });
    }

    drawBack() {
        this.ctxBack.beginPath();
        this.ctxBack.rect(0, 0, this.width, this.height);
        this.ctxBack.fillStyle = this.colorBack;
        this.ctxBack.fill();
        /* this.ctxBack.closePath();
        this.ctxBack.beginPath(); */

        this.ctxBack.strokeStyle = '#404040';
        this.ctxBack.lineWidth = 2;
        this.ctxBack.moveTo(0, 0);

        for (let i = 1; i < 10; i++) {
            this.ctxBack.moveTo(this.width * i / 10, 0);
            this.ctxBack.lineTo(this.width * i / 10, this.height);
        }
        for (let i = 1; i < 10; i++) {
            this.ctxBack.moveTo(0, this.height * i / 10);
            this.ctxBack.lineTo(this.width, this.height * i / 10);
        }
        this.ctxBack.stroke();
        this.ctxBack.closePath();
    }

    drawPointer(p: Point, c: number) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.curve.draw();

        this.ctx.beginPath();
        this.ctx.fillStyle = '#FFFFFF' + ('00' + Math.round(c * 255).toString(16)).slice(-2);
        this.ctx.lineWidth = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.arc(p.x, p.y, 14 - c * 10, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.curve.draw();
    }

    getDistance(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
}
