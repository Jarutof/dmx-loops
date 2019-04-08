import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CurveDrawer } from './curve-drawer';

@Component({
  selector: 'app-curve-parameter',
  templateUrl: './curve-parameter.component.html',
  styleUrls: ['./curve-parameter.component.scss']
})
export class CurveParameterComponent implements OnInit {
  @ViewChild('container') container: ElementRef<HTMLElement>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasBack') canvasBack: ElementRef<HTMLCanvasElement>;
  drawer: CurveDrawer;

  height: number;
  width: number;
  constructor(public renderer: Renderer2) { }

  ngOnInit() {

    this.drawer = new CurveDrawer(this);

    this.drawer.drawBack();
    this.drawer.draw();
  }
}
