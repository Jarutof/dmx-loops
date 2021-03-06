import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { DmxModelService, Channel, Pattern } from '../dmx-model.service';
import { PatternComponent } from '../pattern/pattern.component';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, AfterViewInit {
  @ViewChild('container') container: ElementRef;
  @Output() onDragStart = new EventEmitter<MouseEvent>();
  @Output() onDrag = new EventEmitter<MouseEvent>();
  @Output() onDragEnd = new EventEmitter<ChannelComponent>();
  @Input() channel: Channel; // {x: number, y: number}[][];
  listenerMouseMove: () => void;
  listenerMouseUp: () => void;
  patterns: PatternComponent[] = [];
  private colorBack_unfocus: string = '#252526';
  private colorBack_focus: string = '#454546';

  private colorBack: string = '#444';

  canDrag: boolean = false;

  constructor(private model: DmxModelService, private renderer: Renderer2) { }

  addPattern() {
    this.channel.patterns.push(new Pattern());
  }

  insertPattern() {
    const n = this.channel.patterns.indexOf(this.model.selectedPattern.pattern);
    this.channel.patterns.splice(n, 0, new Pattern());
  }

  deletePattern() {
    const n = this.channel.patterns.indexOf(this.model.selectedPattern.pattern);
    this.channel.patterns.splice(n, 1);
  }

  onClick(e, p) {
    console.log(p, e);
  }

  onInit(p: PatternComponent) {
    this.patterns.push(p);
  }

  onDragAreaMouseDown(e: MouseEvent) {
    this.canDrag = true;
    this.listenerMouseMove = this.renderer.listen(document, 'mousemove', (event) => {
    this.onDrag.emit(event);
    });

    this.listenerMouseUp = this.renderer.listen(document, 'mouseup', (event) => {

      if (this.listenerMouseMove) {
        this.listenerMouseMove();
      }
      if (this.listenerMouseUp) {
        this.listenerMouseUp();
      }
      this.canDrag = false;

      this.onDragEnd.emit(this);

    });
    this.onDragStart.emit(e);

  }

  onDestroy(p: PatternComponent) {
    this.patterns.splice(this.patterns.indexOf(p), 1);
  }

  onResize(p: PatternComponent) {
    const index = this.patterns.indexOf(p);

    if (index < this.patterns.length - 1) {
      this.patterns[index + 1].setWidth(this.patterns[index + 1].width - p.deltaWidth);
    }
  }

  onFocus(p: PatternComponent) {
    this.model.selectChannel(this);
    this.model.selectPattern(p);
  }

  ngAfterViewInit() {
      setTimeout(() => this.container.nativeElement.focus(), 0);
  }

  ngOnInit() {
    this.container.nativeElement.addEventListener('focus', (e) => {
      this.model.selectChannel(this);
    });
  }

  select() {
    this.colorBack = this.colorBack_focus;
  }

  unselect() {
    this.colorBack = this.colorBack_unfocus;
  }

}
