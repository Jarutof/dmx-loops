import { Injectable, Output } from '@angular/core';
import { PatternComponent } from './pattern/pattern.component';
import { ChannelComponent } from './channel/channel.component';
type WithValue<T> = T & { value: string; };
export interface Point {
  x: number;
  y: number;
}
export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface RGBPoint {
  x: number;
  y: RGB;
}
export abstract class Pattern {
  width: number = -1;
  getPoints(): Array<any>  { return []; }
}
export class PointsPattern extends Pattern {
  points: Array<Point> = [];
  getPoints():  Array<Point> {
    return this.points;
  }
  constructor() {
    super();
    this.points.push({x: 0, y: 0.5}, {x: 1, y: 0.5});
  }
}
export class ColorPattern extends Pattern {
  points: Array<RGBPoint> = [];
  getPoints():  Array<RGBPoint> {
    return this.points;
  }
  constructor() {
    super();
    this.points.push({x: 0, y: { r: 1, g: 1, b: 1}}, {x: 0.6, y: { r: 0.5, g: 0, b: 0}}, {x: 1, y: { r: 1, g: 1, b: 1}});
  }
}

export class Channel {
  patterns: Array<Pattern>;
  constructor() {
    this.patterns = [];
  }
}

export class ColorChannel extends Channel {
}

export class ChannelsGroup {
  name: string;
  channels: Array<Channel>;
  constructor(n: string) {
    this.name = n;
    this.channels = [];
  }
}

export class GroupElement {
  position: Point = {x: 0, y: 0};
  width: number = 100;
  group: ChannelsGroup;
}

export class GroupChannel {
  groups: Array<GroupElement> = [];
  constructor() {
    this.groups = [];
  }
}
/* type Pattern = Array<{point: Point}>;
type Channel = Array<{pattern: Pattern}>; */

@Injectable({
  providedIn: 'root'
})
export class DmxModelService  {
public groups: Array<ChannelsGroup>;

public groupChannels: Array<GroupChannel>;

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
  this.groupChannels = [];
}
}
