import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DmxModelService, ChannelsGroup, Channel } from './dmx-model.service';
import { groupBy } from 'rxjs/internal/operators/groupBy';
import { ChannelsGroupComponent } from './channels-group/channels-group.component';
import { ChannelComponent } from './channel/channel.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('group') group: ElementRef<HTMLElement>;

  title = 'dmx-loops';
  groups: Array<ChannelsGroup>;
  groupNames: string[] = [];
  groupIndex: number = -1;

  selectedChannel: ChannelComponent;

  constructor(public model: DmxModelService) {}

  ngOnInit() {
    // this.groups = this.model.channelsGroups;
    this.groups = this.model.groups;
    this.selectedChannel = this.model.selectedChannel;
  }

  onChangeGroup(e: Event, s) {
    this.groupIndex = this.groupNames.indexOf(s);
    console.log(this.groupIndex);
  }

  getGroup() {
    return this.groups[this.groupIndex];
  }

  addPattern() {
    this.model.selectedChannel.addPattern();
  }

  insertPattern() {
    this.model.selectedChannel.insertPattern();
  }
  deletePattern() {
    this.model.selectedChannel.deletePattern();
    this.model.selectedPattern = undefined;
  }

  addChannel(g: ChannelsGroupComponent) {
    g.addChannel();
  }

  insertChannel(g: ChannelsGroupComponent) {
    g.insertChannel(this.getGroup().channels.indexOf(this.model.selectedChannel.channel));
  }

  addChannelsGroup(v) {
    this.groupNames.push(v);
    this.groupIndex = this.groupNames.indexOf(v);
    this.groups.push(new ChannelsGroup());
    
    // this.groups.push([[[{x: 0, y: 0.5},{x: 1, y: 0.5}]]]);
  }

}
