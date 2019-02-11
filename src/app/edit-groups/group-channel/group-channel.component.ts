import { Component, OnInit, Renderer2, Output, Input, EventEmitter, ElementRef } from '@angular/core';
import { GroupChannel } from 'src/app/dmx-model.service';

@Component({
  selector: 'app-group-channel',
  templateUrl: './group-channel.component.html',
  styleUrls: ['./group-channel.component.scss']
})
export class GroupChannelComponent implements OnInit {
  listenerMouseEnter: () => void;
  listenerMouseLeave: () => void;
  listenerMouseMove: () => void;
  @Output() onMouseEnter = new EventEmitter<MouseEvent>();
  @Output() onMouseLeave = new EventEmitter<MouseEvent>();
  @Output() onMouseMove = new EventEmitter<MouseEvent>();
  @Output() onresize = new EventEmitter<GroupChannelComponent>();
  @Output() ondrag = new EventEmitter<MouseEvent>();

  @Input() groupChannel: GroupChannel;
  @Input() channelId: number;
  constructor(private renderer: Renderer2, public elementRef: ElementRef) { }

  ngOnInit() {
    this.listenerMouseEnter = this.renderer.listen(this.elementRef.nativeElement, 'mouseenter', (e) => {
      this.onMouseEnter.emit(e);
    });
  }
  onDrag(e) {
    this.ondrag.emit(e);
  }
  onSizeChanged() {
    this.onresize.emit(this);
  }
}
