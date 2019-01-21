import { Component, OnInit, Renderer2, Output, EventEmitter, Input, ElementRef } from '@angular/core';
import { ChannelsGroup } from 'src/app/dmx-model.service';

@Component({
  selector: 'app-group-box',
  templateUrl: './group-box.component.html',
  styleUrls: ['./group-box.component.scss']
})
export class GroupBoxComponent implements OnInit {
  listenerMouseDown: () => void;
  listenerMouseMove: () => void;
  listenerMouseUp: () => void;
  @Output() onDragStart = new EventEmitter<MouseEvent>();
  @Output() onDrag = new EventEmitter<MouseEvent>();
  @Output() onDragEnd = new EventEmitter<MouseEvent>();
  @Input() channelGroup: ChannelsGroup; // {x: number, y: number}[][];
  canDrag: boolean;
  constructor(private renderer: Renderer2, private elementRef: ElementRef) { }

  ngOnInit() {
    this.listenerMouseDown = this.renderer.listen(this.elementRef.nativeElement, 'mousedown', (eDown) => {
      this.canDrag = true;
      this.onDragStart.emit(eDown);
      this.listenerMouseMove = this.renderer.listen(document, 'mousemove', (eMove) => {
        this.onDrag.emit(eMove);
      });
      this.listenerMouseUp = this.renderer.listen(document, 'mouseup', (eUp) => {
        this.canDrag = false;
        this.onDragEnd.emit(eUp);
        this.listenerMouseMove();
        this.listenerMouseUp();
      });
    });
  }
}
