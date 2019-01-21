import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DmxModelService, ChannelsGroup } from './dmx-model.service';
import { ChannelsGroupComponent } from './channels-group/channels-group.component';
import { ChannelComponent } from './channel/channel.component';
import { ViewParamsService } from './view-params.service';
import { CommandsService } from './commands.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('group') group: ElementRef<HTMLElement>;

  leftWidth: number = 200;
  rightWidth: number = 200;
  midWidth: number = 200;

  currentWiewId = 0;

  title = 'dmx-loops';
  groups: Array<ChannelsGroup>;
  // groupNames: string[] = [];
  groupIndex: number = -1;

  selectedChannel: ChannelComponent;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.midWidth = window.innerWidth - this.leftWidth - this.rightWidth;
  }
  constructor(public model: DmxModelService, public view: ViewParamsService, public commands: CommandsService) {}

  ngOnInit() {
    // this.groups = this.model.channelsGroups;
    this.groups = this.model.groups;
    this.selectedChannel = this.model.selectedChannel;
    this.onResize();
  }
  onChangeGroup(e: Event, s) {
    // this.groupIndex = this.groupNames.indexOf(s);
    // this.groupIndex = this.groups.findIndex((g) => g.name == s);
    console.log(s, this.groupIndex);
  }
  check(v: HTMLElement) {
    console.log(v.getBoundingClientRect());
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
    /* g.addChannel(); */
  }

  insertChannel(g: ChannelsGroupComponent) {
    /* g.insertChannel(this.getGroup().channels.indexOf(this.model.selectedChannel.channel)); */
  }

  addChannelsGroup(name) {
    // this.groupNames.push(name);
    this.groups.push(new ChannelsGroup(name));
    // this.groupIndex = this.groupNames.indexOf(name);
    this.groupIndex = this.groups.length - 1;
  }

  Undo() {
    this.commands.executeUndo();
  }

  Rendo() {
    this.commands.executeRendo();
  }
}
