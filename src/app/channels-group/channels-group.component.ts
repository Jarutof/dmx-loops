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

  onDragStart(e: MouseEvent, c: ChannelComponent, i: number) {
    // console.log('onDragStart ', e.layerY + i * 100);
    console.log(this.row);
    this.yDragStart = e.clientY;
    this.yDrag = e.clientY - this.yDragStart + i * 100;
  }
  onDrag(e: MouseEvent, c: ChannelComponent, i: number) {
    console.log('onDrag ', e.layerY + i * 100);

    this.yDrag = e.clientY - this.yDragStart + i * 100;
    const n = this.group.channels.indexOf(c.channel);
    const pos = Math.trunc((e.clientY - 100) / 100);
    // const pos = Math.round(this.yDrag / 100);
    if (n != pos) {
      setTimeout(() => {
        this.group.channels.splice(n, 1);
        this.group.channels.splice(pos, 0, c.channel);
        this.yDragStart = this.yDragStart - i * 100 + pos * 100;
        this.yDrag = e.clientY - this.yDragStart + i * 100;
      }, 0);
    }
    // console.log(Math.round(this.yDrag / 100) * 100);

  }
  onDragEnd(e, c: ChannelComponent) {
    //console.log('onDragEnd');
  }
}
