import { Component, OnInit, HostListener } from '@angular/core';
import { DmxModelService, ChannelsGroup, Channel } from '../dmx-model.service';
import { ViewParamsService } from '../view-params.service';
import { CommandsService } from '../commands.service';

@Component({
  selector: 'app-edit-channels-group',
  templateUrl: './edit-channels-group.component.html',
  styleUrls: ['./edit-channels-group.component.scss']
})
export class EditChannelsGroupComponent implements OnInit {
  leftWidth: number = 200;
  rightWidth: number = 200;
  midWidth: number = 200;

  constructor(public model: DmxModelService, public view: ViewParamsService, private commands: CommandsService) { }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.midWidth = window.innerWidth - this.leftWidth - this.rightWidth;
    this.view.editChannelsGroup.height = window.innerHeight - this.view.editChannelsGroup.topArea - this.view.headerHeight;
  }

  ngOnInit() {
    this.onResize();
  }

  onChangeGroup(id) {
    const sIndex = this.model.groupIndex;
    const nIndex = id;
    this.commands.setCommands(() => {
      this.model.groupIndex = sIndex;
      this.model.selectedChannel = undefined;
    }, () => {
      this.model.groupIndex = nIndex;
      this.model.selectedChannel = undefined;
    });
  }

  getGroup() {
    return this.model.groups[this.model.groupIndex];
  }
  addChannelsGroup(name) {
    const group = new ChannelsGroup(name);
    const id = this.model.groups.length;
    this.commands.setCommands(() => {
      this.model.groups.splice(id, 1);
      this.model.groupIndex = id - 1;
    }, () => {
      this.model.groups.push(group);
      this.model.groupIndex = id;
    });
  }

  addChannel() {
    // this.model.groups[this.model.groupIndex].channels.push(new Channel());
    const channel = new Channel();
    const id = this.model.groupIndex;
    this.commands.setCommands(() => {
      const i = this.model.groups[id].channels.indexOf(channel);
      this.model.groups[id].channels.splice(i, 1); // .push(channel);
      this.model.selectedChannel = undefined;
    }, () => {
      this.model.groups[id].channels.push(channel);
    });
  }

  insertChannel() {
    const channel = new Channel();
    const id = this.model.groupIndex;
    const position = this.getGroup().channels.indexOf(this.model.selectedChannel.channel);

    this.commands.setCommands(() => {
      const i = this.model.groups[id].channels.indexOf(channel);
      this.model.groups[id].channels.splice(i, 1); // .push(channel);
      this.model.selectedChannel = undefined;
    }, () => {
      this.model.groups[id].channels.splice(position, 0, new Channel());
    });
  }
}
