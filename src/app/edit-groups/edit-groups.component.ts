import { Component, OnInit, HostListener, Renderer2, ElementRef, ViewChildren, QueryList, ViewChild, ɵConsole } from '@angular/core';
import { DmxModelService, GroupChannel, GroupElement } from '../dmx-model.service';
import { ViewParamsService } from '../view-params.service';
import { CommandsService } from '../commands.service';
import { AppRoutingModule } from '../app-routing.module';
import { GroupChannelComponent } from './group-channel/group-channel.component';

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

      // console.log(this.groupChannels.toArray().indexOf(gcc));
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
      /*this.model.groupChannels[this.indexDragChannelGroup].groups.sort((g1, g2) =>  g1.position > g2.position ? 1 : g1.position < g2.position ? -1 : 0 );
      this.model.groupChannels[this.indexDragChannelGroup].groups.map(function(v, i, arr) {
        if (i > 0) {
          if (v.position < (arr[i - 1].position + arr[i - 1].width)) {
            v.position = arr[i - 1].position + arr[i - 1].width;
          }
        }
      });
      this.calculateWidth();*/
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
      console.log(args.g.position);
      this.calculatesize(this.model.groupChannels[newIndex]);

    }
    /* if (newIndex != this.indexDragChannelGroup) {
      if (newIndex != -1) {
        if (this.indexDragChannelGroup != -1) {
          const id = groupChannelsArray[this.indexDragChannelGroup].groupChannel.groups.indexOf(args.g);
          groupChannelsArray[this.indexDragChannelGroup].groupChannel.groups.splice(id, 1);
          groupChannelsArray[newIndex].groupChannel.groups.push(args.g);
        }
        this.indexDragChannelGroup = newIndex;
      }
    } else {
      if (newIndex != -1) {
        // this.tempElement.position.x = args.e.clientX - gcc.elementRef.nativeElement.getBoundingClientRect().x - this.tempElement.width / 2;
        // if (this.tempElement.position.x < 0) { this.tempElement.position.x = 0; }
      }
    } */
    /* const groupChannelsArray = this.groupChannelsComponents.toArray();
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
    } */
  }

  rectContains(x: number, y: number, rect: DOMRect) {
    // console.log(rectParent, rectChild);
    return  y > rect.y && y < rect.height + rect.y;
    // return  x > rect.x && x < rect.width + rect.x && y > rect.y && y < rect.height + rect.y;
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
    console.log(this.model.groupChannels);

    const max = this.model.groupChannels.reduce(function(prev, current, id, arr) {
      console.log(prev, current, id, arr);
      if (current.groups.length == 0) {
        return prev; } else if (prev.groups.length > 0) {
          return  (prev.groups[prev.groups.length - 1].position.x > current.groups[current.groups.length - 1].position.x) ? prev : current;
      } else { return current; }
    });
    if (!max ) { return defaultWidth; }
    if (max.groups.length == 0 ) { return defaultWidth; }
    this.channelWidth =  Math.max(max.groups[max.groups.length - 1].position.x + max.groups[max.groups.length - 1].width, defaultWidth);
  }

  onChannelMouseEnter(e, g, index) {
  }
}
