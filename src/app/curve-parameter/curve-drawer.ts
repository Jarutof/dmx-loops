import { CurveParameterComponent } from './curve-parameter.component';
import { Point } from '../dmx-model.service';

export class BezierPoint {
    anchors: Array<Point> = [];
    controls: Array<Point> = [];
    getDistance(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    setControl(id: number, dist: number) {
        this.controls[id] = this.anchors[id];
    }

    calcAnch(id: number, p: Point, dist: number, cId: number) {
        const d = this.getDistance(p, this.controls[cId]);
        const anch: Point = {x: p.x - this.controls[cId].x, y: p.y - this.controls[cId].y};
        const norm: Point = { x: anch.x, y: anch.y};
        norm.x /= d;
        norm.y /= d;
        anch.x = norm.x * dist;
        anch.y = norm.y * dist;
        anch.x += this.controls[cId].x;
        anch.y += this.controls[cId].y;
        this.anchors[id] = anch;
        const midX = this.controls[0].x + (this.controls[3].x - this.controls[0].x) / 2;
        this.controls[id].x = midX;
        this.controls[id].y = this.controls[cId].y + midX * norm.y / Math.abs(norm.x);
    }

    setAnchor(id: number, p: Point, dist: number) {
        switch (id) {
            case 0:
            case 3:
                this.controls[id] = p;
                this.anchors[id] = p;
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
        point.controls.push({ x: 0.2 * width, y: 0.8 * height});
        point.controls.push({ x: 0.8 * width, y: 0.2 * height});
        point.controls.push({ x: 1 * width, y: 0.5 * height});
        point.anchors.push({ x: 0, y: 0.5 * height});
        point.anchors.push({ x: 0.2 * width, y: 0.8 * height});
        point.anchors.push({ x: 0.8 * width, y: 0.2 * height});
        point.anchors.push({ x: 1 * width, y: 0.5 * height});
        this.points = [point];
    }
    /* getDistance(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    getAnchor(cp: Point, p: Point) {
        const anch: Point = {x: cp.x - p.x, y: cp.y - p.y};
        const dist = this.getDistance({x: cp.x * this.width, y: cp.y * this.height}, {x: p.x * this.width, y: p.y * this.height});
        anch.x /= dist;
        anch.y /= dist;
        anch.x *= this.width;
        anch.y *= this.height;
    } */
    addPoint(x: number, y: number) {
        // let point = new BezierPoint(0.1, 0.5, 0.9, 0.5, x, y);
    }
    getPoint(t: number): Point {
        // P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4

        const res: Point = { x: Math.pow(1 - t, 3) * this.points[0].controls[0].x + 3 *  Math.pow(1 - t, 2) * t * this.points[0].controls[1].x + 3 * (1 - t) * Math.pow(t, 2) * this.points[0].controls[2].x + Math.pow(t, 3) * this.points[0].controls[3].x,
            y: Math.pow(1 - t, 3) * this.points[0].controls[0].y + 3 *  Math.pow(1 - t, 2) * t * this.points[0].controls[1].y + 3 * (1 - t) * Math.pow(t, 2) * this.points[0].controls[2].y + Math.pow(t, 3) * this.points[0].controls[3].y };

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
            point.y = Math.max(point.y, 10);
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
        this.points[0].anchors.forEach(a => {
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


    component: CurveParameterComponent;

    listenerMouseMove: () => void;
    listenerMouseUp: () => void;
    mouseDown(e: MouseEvent) {}
    mouseMove(e: MouseEvent) {}
    constructor(p: CurveParameterComponent) {
        this.component = p;
        // this.listenerMouseUp = this.component.renderer.listen(document, 'mouseup', (event) => {

        this.ctx = this.component.canvas.nativeElement.getContext('2d');
        this.ctxBack = this.component.canvasBack.nativeElement.getContext('2d');
        this.ctx.lineJoin = 'round';
        this.height = this.component.container.nativeElement.clientHeight;
        this.width = this.component.container.nativeElement.clientWidth;
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
        if (e.buttons != 1) {
            /* this.highlightedPoint = undefined;
            this.selectedPosition = undefined; */
            if (this.listenerMouseMove) {
                this.listenerMouseMove();
            }
        }
        this.draw();
    }
    onKeyDown(e) {}



    onMouseHover(e: MouseEvent) {
        const dists = [0, this.curve.anchorDist, this.curve.anchorDist, 0];
        this.curve.points.forEach((p, pId) => {

            p.anchors.forEach((a, idx) => {
                if (this.getDistance({ x: a.x, y: a.y }, { x: e.layerX, y: e.layerY }) < 3) {
                    this.mouseDown = (ev) => {
                        const point = { x: e.x - a.x, y: e.y - a.y };
                        this.mouseMove = (event) => {
                           /*  a.x = (event.x - point.x);
                            a.y = (event.y - point.y); */
                            p.setAnchor(idx, {x: event.x - point.x, y: event.y - point.y}, this.curve.anchorDist);
                            // p.setControl(idx, dists[idx]);
                            this.draw();
                            return;
                        };
                    };
                }
            });
            /* if (this.getDistance({ x: p.anchors[1].x, y: p.anchors[1].y }, { x: e.layerX, y: e.layerY }) < 3) {
                this.mouseDown = (ev) => {
                    const point = { x: e.x - p.anchors[1].x, y: e.y - p.anchors[1].y };
                    this.mouseMove = (event) => {
                        p.anchors[1].x = (event.x - point.x);
                        p.anchors[1].y = (event.y - point.y);
                        p.setAnchor(1, 1);

                        this.draw();
                        return;
                    };
                };
            } */
            /*const cp = p.getCapturedPoint({ x: e.layerX, y: e.layerY });
            if (cp) {
                    const point = { x: e.x - p.cp1x * this.width, y: e.y - p.cp1y * this.height };
                    this.mouseDown = (ev) => {
                    p.
                };
            }*/
            /*if (this.getDistance({ x: p.cp1x * this.width, y: p.cp1y * this.height }, { x: e.layerX, y: e.layerY }) < 3) {
                this.mouseDown = (ev) => {
                    const point = { x: e.x - p.cp1x * this.width, y: e.y - p.cp1y * this.height };
                    this.mouseMove = (event) => {
                        p.cp1x = (event.x - point.x) / this.width;
                        p.cp1y = (event.y - point.y) / this.height;
                        this.draw();
                        return;
                    };
                };
            }
            if (this.getDistance({ x: p.cp2x * this.width, y: p.cp2y * this.height }, { x: e.layerX, y: e.layerY }) < 3) {
                this.mouseDown = (ev) => {
                    const point = { x: e.x - p.cp2x * this.width, y: e.y - p.cp2y * this.height };
                    this.mouseMove = (event) => {
                        console.log('mouseMove');

                        p.cp2x = (event.x - point.x) / this.width;
                        p.cp2y = (event.y - point.y) / this.height;
                        this.draw();
                        return;
                    };
                };
            }*/
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



      /* this.ctxBack.shadowOffsetX = 0;
      this.ctxBack.shadowOffsetY = 0;
      this.ctxBack.shadowBlur = 0;
      this.ctxBack.beginPath();
      this.ctxBack.rect(0, 0, this.width, this.height);
      this.ctxBack.fillStyle = this.colorBack;
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
      this.ctxBack.closePath(); */
    }
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.curve.draw();
        /*this.ctx.strokeStyle = '#7F7';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        this.curve.points.forEach(p => {
        this.ctx.moveTo(p.controls[0].x, p.controls[0].y);
        this.ctx.bezierCurveTo(p.controls[1].x, p.controls[1].y, p.controls[2].x, p.controls[2].y, p.controls[3].x, p.controls[3].y);
        });
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.beginPath();

        this.ctx.strokeStyle = '#FFF';
        this.ctx.fillStyle = '#FFF';
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(this.curve.x * this.width, this.curve.y * this.height);

        this.curve.points.forEach(p => {
            this.ctx.lineTo(p.cp1x * this.width, p.cp1y * this.height);
            this.ctx.moveTo(p.cp1x * this.width, p.cp1y * this.height);
            this.ctx.arc(p.cp1x * this.width, p.cp1y * this.height, 4, 0, 2 * Math.PI);
            this.ctx.moveTo(p.cp2x * this.width, p.cp2y * this.height);
            this.ctx.arc(p.cp2x * this.width, p.cp2y * this.height, 4, 0, 2 * Math.PI);
            this.ctx.moveTo(p.cp2x * this.width, p.cp2y * this.height);
            this.ctx.lineTo(p.x * this.width, p.y * this.height);
        });

        this.ctx.stroke();
        this.ctx.fill();

        this.ctx.closePath();*/
    }

    getDistance(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
}
