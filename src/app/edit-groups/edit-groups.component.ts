import { Component, OnInit, HostListener, Renderer2, ElementRef, ViewChildren, QueryList, ViewChild, ɵConsole } from '@angular/core';
import { DmxModelService, GroupChannel, GroupElement, PointsPattern, ChannelsGroup, Point } from '../dmx-model.service';
import { ViewParamsService } from '../view-params.service';
import { CommandsService } from '../commands.service';
import { AppRoutingModule } from '../app-routing.module';
import { GroupChannelComponent } from './group-channel/group-channel.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-edit-groups',
  templateUrl: './edit-groups.component.html',
  styleUrls: ['./edit-groups.component.scss']
})
export class EditGroupsComponent implements OnInit {
  channelHeight: number = 120;
  channelWidth: number = 1000;
  dragStart: {x: number; y: number};
  drag: {x: number; y: number};
  dragSize: {width: number; height: number};
  indexDragChannelGroup: number = -1;
  tempElement: GroupElement;
  constructor(private renderer: Renderer2, public model: DmxModelService, public view: ViewParamsService, private commands: CommandsService) { }
  @ViewChild('container') container;
  @ViewChildren('groupChannel') groupChannelsComponents: QueryList<GroupChannelComponent>;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.view.editGroups.height = window.innerHeight - this.view.editGroups.topArea - this.view.headerHeight;
  }

  ngOnInit() {
    this.onResize();
    this.calculateWidth();
  }


  deleteElement() {
    const element = this.model.selectedGroupElement.groupElement;
    this.commands.setCommands(() => {
      this.model.selectedGroupChannel.groupChannel.groups.push(element);
    }, () => {
      const id = this.model.selectedGroupChannel.groupChannel.groups.indexOf(element);
      this.model.selectedGroupChannel.groupChannel.groups.splice(id, 1);
      this.model.selectedGroupElement = undefined;
    });
  }

  deleteChannel() {
    const channel = this.model.selectedGroupChannel.groupChannel;
    this.commands.setCommands(() => {
      this.model.groupChannels.push(channel);
    }, () => {
      this.model.groupChannels.splice(this.model.groupChannels.indexOf(channel), 1);
      this.model.selectedGroupChannel.groupChannel = undefined;
    });
  }

  addGroupChannelsCopy(c: number) {
    if (c <= 0) { return; }
    const channels = new Array<GroupChannel>();
    for (let i = 0; i < c; i++) {
      channels.push(this.model.selectedGroupChannel.groupChannel.clone());
    }
    const oldChannels = this.model.groupChannels;
    this.commands.setCommands(() => {
      this.model.groupChannels = oldChannels;
    }, () => {
      this.model.groupChannels = channels;
    });
  }

  addGroupChannels(c: number) {
    if (c <= 0) { return; }
    const channels = new Array<GroupChannel>();
    for (let i = 0; i < c; i++) {
      channels.push(new GroupChannel());
    }
    const oldChannels = this.model.groupChannels;
    this.commands.setCommands(() => {
      this.model.groupChannels = oldChannels;
    }, () => {
      this.model.groupChannels = channels;
    });
  }

  addGroupChannel() {
    const channel = new GroupChannel();
    this.commands.setCommands(() => {
      this.model.groupChannels.splice(this.model.groupChannels.indexOf(channel), 1);
    }, () => {
      this.model.groupChannels.push(channel);
    });
  }

  onGroupDragStart (e, elem, group, index) {
    this.dragSize = {width: 50, height: 40};
    this.setDrag(e.clientX - this.dragSize.width / 2, e.clientY - this.dragSize.height / 2);
    this.tempElement = new GroupElement();
    this.tempElement.group = group;
  }

  onGroupDrag(e: MouseEvent, elem, group, index, container: HTMLElement) {
    const groupChannelsArray = this.groupChannelsComponents.toArray();
    const containerRect = container.getBoundingClientRect();
    this.setDrag(e.clientX - this.dragSize.width / 2, e.clientY - this.dragSize.height / 2);
    let gcc: GroupChannelComponent = groupChannelsArray.find((g) => {
      return this.rectContains(e.clientX, e.clientY, g.elementRef.nativeElement.getBoundingClientRect());
    });
    if (e.clientX < containerRect.left || e.clientX > containerRect.right) {
      gcc = undefined;
    }

    const newIndex = this.groupChannelsComponents.toArray().indexOf(gcc);
    if (newIndex != this.indexDragChannelGroup) {
      if (this.indexDragChannelGroup != -1) {
        const id = groupChannelsArray[this.indexDragChannelGroup].groupChannel.groups.indexOf(this.tempElement);
        groupChannelsArray[this.indexDragChannelGroup].groupChannel.groups.splice(id, 1);
      }
      if (newIndex != -1) {
        this.tempElement.position.x = e.clientX - gcc.elementRef.nativeElement.getBoundingClientRect().x - this.tempElement.width / 2;
        groupChannelsArray[newIndex].groupChannel.groups.push(this.tempElement);
      }
      this.indexDragChannelGroup = newIndex;
    } else {
      if (newIndex != -1) {
        this.tempElement.position.x = e.clientX - gcc.elementRef.nativeElement.getBoundingClientRect().x - this.tempElement.width / 2;
        if (this.tempElement.position.x < 0) { this.tempElement.position.x = 0; }
      }
    }
  }
  onGroupDragEnd(e: MouseEvent, elem, group, index) {
    if (this.indexDragChannelGroup != -1) {
      this.calculatesize(this.model.groupChannels[this.indexDragChannelGroup]);
    }
    this.indexDragChannelGroup = -1;
    this.tempElement = undefined;
  }

  onGroupElementDrag(args: {e: MouseEvent, g: GroupElement }, index: number, container: HTMLElement) {
    // console.log(args.e, args.g);
    const groupChannelsArray = this.groupChannelsComponents.toArray();
    const containerRect = container.getBoundingClientRect();
    let gcc: GroupChannelComponent = groupChannelsArray.find((g) => {
      return this.rectContains(args.e.clientX, args.e.clientY, g.elementRef.nativeElement.getBoundingClientRect());
    });
    if (args.e.clientX < containerRect.left || args.e.clientX > containerRect.right) {
      gcc = undefined;
    }
    const newIndex = this.groupChannelsComponents.toArray().indexOf(gcc);

    if (newIndex != -1) {
      const id = groupChannelsArray[index].groupChannel.groups.indexOf(args.g);
      groupChannelsArray[index].groupChannel.groups.splice(id, 1);

      groupChannelsArray[newIndex].groupChannel.groups.push(args.g);
      this.calculatesize(this.model.groupChannels[newIndex]);
    }
  }

  rectContains(x: number, y: number, rect: DOMRect) {
    return  y > rect.y && y < rect.height + rect.y;
  }

  onChanelResize(e) {
    this.calculatesize(e.groupChannel);
  }

  calculatesize(c: GroupChannel) {
    c.groups.sort((g1, g2) =>  g1.position.x > g2.position.x ? 1 : g1.position.x < g2.position.x ? -1 : 0 );
    c.groups.map(function(v, i, arr) {
      if (i > 0) {
        if (v.position.x < (arr[i - 1].position.x + arr[i - 1].width)) {
          v.position.x = arr[i - 1].position.x + arr[i - 1].width;
        }
      }
    });
    this.calculateWidth();
  }
  setDrag(x: number, y: number) {
    this.drag = { x, y };
    if (this.drag.x < 0) {
      this.drag.x = 0;
    }

    if (this.drag.x > window.innerWidth - this.dragSize.width - 2) {
      this.drag.x = window.innerWidth - this.dragSize.width - 2;
    }
  }

  calculateWidth() {
    const defaultWidth = this.container.nativeElement.getBoundingClientRect().width;
    if ( this.model.groupChannels.length == 0) {
      return defaultWidth;
    }

    const max = this.model.groupChannels.reduce(function(prev, current, id, arr) {
      if (current.groups.length == 0) {
        return prev; } else if (prev.groups.length > 0) {
          return  (prev.groups[prev.groups.length - 1].position.x > current.groups[current.groups.length - 1].position.x) ? prev : current;
      } else { return current; }
    });
    if (!max ) { return defaultWidth; }
    if (max.groups.length == 0 ) { return defaultWidth; }
    this.channelWidth =  Math.max(max.groups[max.groups.length - 1].position.x + max.groups[max.groups.length - 1].width, defaultWidth);
  }


  saveFile() {
    const filename = 'ololo';
    const blob = new Blob([JSON.stringify(this.model.groupChannels)], { type: 'text/plain' });
    saveAs(blob, filename);
  }


  onChannelMouseEnter(e, g, index) {
  }

  onButtonTilt(x: number, y: number, power: number) {
    this.model.groupChannels.forEach((gc, ci) => {
      const temp: Array<ChannelsGroup> = [];
      gc.groups.forEach((g, gi) => {
        const newGroup = g.group.deepClone();
        let alpha;

        newGroup.name += '(' + gi + ',' + ci + ')';
        newGroup.channels[x].patterns.forEach(pattern => {
          pattern.getPoints().forEach((p) => {
            alpha = 360 * ci / this.model.groupChannels.length;
            // console.log(Math.sin(Math.PI * alpha / 360) * power, Math.PI * alpha / 360, alpha);
            p.y = p.y + (Math.sin(Math.PI * alpha / 360) - 0.5) * power / 100.0;
            // console.log(p.y);
            // p.y = p.y * (this.model.groupChannels.length - ci) / this.model.groupChannels.length;
          });
        });
        newGroup.channels[y].patterns.forEach(pattern => {
          pattern.getPoints().forEach((p) => {
            alpha = 360 * ci / this.model.groupChannels.length;
            // alpha = 360 * ((ci + (this.model.groupChannels.length / 4)) % this.model.groupChannels.length) / this.model.groupChannels.length;
            p.y = p.y - 0.5 * Math.sin(Math.PI * alpha / 180 + Math.PI) * power / 100.0;
            // console.log(0.5 * Math.sin(Math.PI * alpha / 180 + Math.PI) + 0.5);
            // p.y = p.y * (this.model.groupChannels.length - ci) / this.model.groupChannels.length;
          });
        });
        temp.push(newGroup);
        g.group = newGroup;
        this.model.groups.push(newGroup);
      });
    });
    this.model.GroupElementComponents.forEach(g => {
      g.draw();
    });
  }


  onButtonRotation(numb: number) {
    const totalLength = this.model.getTotalLength();
    const tempChannels: Array<Array<Point>> = [];
    this.model.groupChannels.forEach((gc, ci) => {
      tempChannels[ci] = [];
      for (let chanIndex = 0; chanIndex < this.model.groupChannels.length; chanIndex++) {
        const channelNumber = (chanIndex + ci + 1) % this.model.groupChannels.length;
        const x =  (chanIndex +  1) % this.model.groupChannels.length / this.model.groupChannels.length;
        const groupElement = this.model.groupChannels[channelNumber].groups.find(g => (x * totalLength >= g.position.x) && (x * totalLength < g.position.x + g.width)) ;
        let pos = 0;
        let np;
        let pp;
        const totalWidth = groupElement.group.channels[numb].getWidth();
        for (let i = 0; i < groupElement.group.channels[numb].patterns.length; i++) {
          const p = groupElement.group.channels[numb].patterns[i];
          np = p.getPoints().find(pt => {
            const ptx = ((pt.x * p.width + pos) / totalWidth) * totalLength + groupElement.position.x;
            return x * totalLength < ptx;
          });
          if (np) {
            pp = p.getPoints()[p.getPoints().indexOf(np) - 1];
            np = { x: ((np.x * p.width + pos) / totalWidth) * totalLength + groupElement.position.x, y: np.y };
            pp = { x: ((pp.x * p.width + pos) / totalWidth) * totalLength + groupElement.position.x, y: pp.y };
            break;
          }
          pos += p.width;
        }
        const point: Point = {x, y: (x - pp.x) * (np.y - pp.y) / (np.x - pp.x) + pp.y};
        tempChannels[ci].push(point);
      }
      gc.groups.forEach((g, gi) => {
        const newGroup = g.group.deepClone();
        newGroup.name += '(' + gi + ',' + ci + ')';
        g.group = newGroup;
        this.model.groups.push(newGroup);
      });
      tempChannels.forEach((c, i) => {

      });
    });
    this.model.groupChannels.forEach((gc, ci) => {
      tempChannels[ci].forEach((c, i) => {
        gc.insertPoint(tempChannels[ci][i], numb);
      });
    });

    this.model.GroupElementComponents.forEach(g => {
      g.draw();
    });
  }


  onButtonIncreaseMod(numb: number) {
    this.model.groupChannels.forEach((gc, ci) => {
      const temp: Array<ChannelsGroup> = [];
      gc.groups.forEach((g, gi) => {
        const newGroup = g.group.deepClone();
        newGroup.name += '(' + gi + ',' + ci + ')';
        newGroup.channels[numb].patterns.forEach(pattern => {
          pattern.getPoints().forEach((p) => {
            p.y = p.y * (this.model.groupChannels.length - ci) / this.model.groupChannels.length;
          });
        });
        temp.push(newGroup);
        g.group = newGroup;
        this.model.groups.push(newGroup);
      });
    });
    this.model.GroupElementComponents.forEach(g => {
      g.draw();
    });
  }

  onButtonDecreaseMod(numb: number) {
    console.log(numb);

    this.model.groupChannels.forEach((gc, ci) => {
      const temp: Array<ChannelsGroup> = [];
      gc.groups.forEach((g, gi) => {
        const newGroup = g.group.deepClone();
        console.log(newGroup, g.group);

        newGroup.name += '(' + gi + ',' + ci + ')';
        newGroup.channels[numb].patterns.forEach(pattern => {
          pattern.getPoints().forEach((p) => {
            p.y = 1 - (1 - p.y) * (this.model.groupChannels.length - ci) / this.model.groupChannels.length;
          });
        });
        temp.push(newGroup);
        g.group = newGroup;
        this.model.groups.push(newGroup);
      });
    });
    this.model.GroupElementComponents.forEach(g => {
      g.draw();
    });
  }
}


