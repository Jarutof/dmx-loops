import { Component, OnInit, Renderer2, Output, Input, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { GroupChannel, DmxModelService } from 'src/app/dmx-model.service';
import { GroupElementComponent } from '../group-element/group-element.component';

@Component({
  selector: 'app-group-channel',
  templateUrl: './group-channel.component.html',
  styleUrls: ['./group-channel.component.scss']
})
export class GroupChannelComponent implements OnInit, AfterViewInit {
  listenerMouseEnter: () => void;
  listenerMouseLeave: () => void;
  listenerMouseMove: () => void;
  @ViewChild('container') container: ElementRef;

  @Output() onMouseEnter = new EventEmitter<MouseEvent>();
  @Output() onMouseLeave = new EventEmitter<MouseEvent>();
  @Output() onMouseMove = new EventEmitter<MouseEvent>();
  @Output() onresize = new EventEmitter<GroupChannelComponent>();
  @Output() ondrag = new EventEmitter<MouseEvent>();

  @Input() groupChannel: GroupChannel;
  @Input() channelId: number;
  private colorBack_unfocus: string = '#252526';
  private colorBack_focus: string = '#38383A';

  public colorBack: string = '#444';
  constructor(private model: DmxModelService, private renderer: Renderer2, public elementRef: ElementRef) { }

  ngOnInit() {
    this.container.nativeElement.addEventListener('focus', (e) => {
      this.model.selectGroupChannel(this);
    });
    this.listenerMouseEnter = this.renderer.listen(this.elementRef.nativeElement, 'mouseenter', (e) => {
      this.onMouseEnter.emit(e);
    });
  }
  ngAfterViewInit() {
    setTimeout(() => this.container.nativeElement.focus(), 0);
  }
  onFocus(p: GroupElementComponent) {
    this.model.selectGroupChannel(this);
    this.model.selectGroupElement(p);
  }

  select() {
    this.colorBack = this.colorBack_focus;
  }

  unselect() {
    this.colorBack = this.colorBack_unfocus;
  }


  onDrag(e) {
    this.ondrag.emit(e);
  }
  onSizeChanged() {
    this.onresize.emit(this);
  }
}
