import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { DmxModelService, ChannelsGroup, Channel } from '../dmx-model.service';
import { ChannelComponent } from '../channel/channel.component';

@Component({
  selector: 'app-channels-group',
  templateUrl: './channels-group.component.html',
  styleUrls: ['./channels-group.component.scss']
})
export class ChannelsGroupComponent implements OnInit {
  @ViewChild('row') row: ElementRef;
  @ViewChild('container') container: ElementRef;
  @Input() id: number = 1;
  @Input() group: ChannelsGroup;

  yDrag: number;
  yDragStart: number;

  constructor(private model: DmxModelService) { }
  addChannel() {
    this.group.channels.push(new Channel());
  }

  insertChannel(n: number) {
    this.group.channels.splice(n, 0, new Channel());
  }

  ngOnInit() {
    console.log(this.group.channels);
  }

  onDragStart(e: MouseEvent, c: ChannelComponent, i: number, container: HTMLElement) {
    console.log(e.clientY + container.parentNode.parentElement.scrollTop);
    this.yDragStart = e.layerY;
    this.yDrag = i * 100;
  }
  onDrag(e: MouseEvent, c: ChannelComponent, i: number, container: HTMLElement) {
    this.yDrag = e.clientY - 100 + container.parentNode.parentElement.scrollTop - this.yDragStart; // + i * 100;
    const n = this.group.channels.indexOf(c.channel);
    const pos = Math.trunc((this.yDrag + this.yDragStart) / 100);
    if (n != pos) {
      setTimeout(() => {
        this.group.channels.splice(n, 1);
        this.group.channels.splice(pos, 0, c.channel);
      }, 0);
    }
    /* console.log(e.y);

    const delta = pos * 100 - container.parentNode.parentElement.scrollTop;
    if (delta < 0) {
      const o: ScrollToOptions = {};
      o.top = container.parentNode.parentElement.scrollTop - 10;
      console.log(o);
      container.parentNode.parentElement.scrollTo(o);
    } */
  }
  onDragEnd(e, c: ChannelComponent) {
    // console.log('onDragEnd');
  }
}
