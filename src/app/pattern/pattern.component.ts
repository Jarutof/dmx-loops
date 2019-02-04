import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2, Output, EventEmitter, OnDestroy, AfterViewInit, ɵConsole } from '@angular/core';
import { Pattern, Point, PointsPattern } from '../dmx-model.service';
import { CommandsService } from '../commands.service';
import { PointsDrawer } from './points-drawer';
import { Drawer } from './drawer';
import { ColorDrawer } from './color-drawer';
import { ModalWindowService } from '../modal-window.service';

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

  isShowpicker: boolean = false;

  drawer: Drawer;
  value;
  listenerMouseMove: () => void;
  listenerMouseUp: () => void;

  constructor(private modal: ModalWindowService, public renderer: Renderer2, public commands: CommandsService) {
  }

  ngAfterViewInit() {
    setTimeout(() => this.canvas.nativeElement.focus(), 0);
  }

  ngOnInit() {

    if (this.pattern instanceof PointsPattern) {
      this.drawer = new PointsDrawer(this);
    } else {
      this.drawer = new ColorDrawer(this);
    }
    this.canvas.nativeElement.addEventListener('focus', (e) => { this.onfocus.emit(this); });
        console.log('ngOnInit');
    // this.drawer.drawBack();
    this.drawer.draw();
    this.oninit.emit(this);
  }

  select() {
    this.drawer.select();
  }


  unselect() {
    this.drawer.unselect();
  }

  ngOnDestroy() {
    this.ondestroy.emit(this);
  }
  showColorPicker(e: MouseEvent) {
    this.modal.showColorPicker(e, (col: string) => {
      console.log(col);
    });
    this.isShowpicker = true;
  }
}
