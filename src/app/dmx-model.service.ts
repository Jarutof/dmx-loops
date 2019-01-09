import { Injectable, Output } from '@angular/core';
import { PatternComponent } from './pattern/pattern.component';
import { ChannelComponent } from './channel/channel.component';

export interface Point {
  x: number;
  y: number;
}

export class Pattern {
  points: Array<Point> = [];
  width: number = -1;
  constructor() {
    this.points.push({x: 0, y: 0.5}, {x: 1, y: 0.5});
  }
}

export class Channel {
  patterns: Array<Pattern>;
  constructor() {
    this.patterns = [];
  }
}

export class ChannelsGroup {
  name: string;
  channels: Array<Channel>;
  constructor(n: string) {
    this.name = n;
    this.channels = [];
  }
}

/* type Pattern = Array<{point: Point}>;
type Channel = Array<{pattern: Pattern}>; */

@Injectable({
  providedIn: 'root'
})
export class DmxModelService  {
public groups: Array<ChannelsGroup>;

// public channelsGroups:  {x: number; y: number}[][][][] = [];
public selectedPattern: PatternComponent;
public selectedChannel: ChannelComponent;
public groupIndex: number = -1;

public selectPattern(pattern: PatternComponent) {
  if (this.selectedPattern == pattern) { return; }
  if (this.selectedPattern) {
    this.selectedPattern.unselect();
  }
  this.selectedPattern = pattern;
  this.selectedPattern.select();
}

public selectChannel(channel: ChannelComponent) {
  if (this.selectedChannel == channel) { return; }
  if (this.selectedPattern) {
    this.selectedPattern.unselect();
    this.selectedPattern = undefined;
}

  if (this.selectedChannel) {
    this.selectedChannel.unselect();
  }
  this.selectedChannel = channel;
  this.selectedChannel.select();
}

constructor() {
  this.groups = [];
}

}
