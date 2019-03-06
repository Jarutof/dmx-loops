import { Injectable, Output } from '@angular/core';
import { PatternComponent } from './pattern/pattern.component';
import { ChannelComponent } from './channel/channel.component';
import { BytesList } from './BytesList';
import { saveAs } from 'file-saver';
import { GroupChannelComponent } from './edit-groups/group-channel/group-channel.component';
import { GroupElementComponent } from './edit-groups/group-element/group-element.component';
type WithValue<T> = T & { value: string; };
export interface Point {
  x: number;
  y: number;
}
export class RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
    toString = (): string => {
    return '#' +
    ('00' + Math.round(this.r * 0xFF).toString(16)).slice(-2) +
    ('00' + Math.round(this.g * 0xFF).toString(16)).slice(-2) +
    ('00' + Math.round(this.b * 0xFF).toString(16)).slice(-2) +
    ('00' + Math.round(this.a * 0xFF).toString(16)).slice(-2);
  }
  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}
export interface RGBAPoint {
  x: number;
  y: RGBA;
}
export abstract class Pattern {
  width: number = -1;
  clone() { return undefined; }
  getPoints(): Array<any>  { return []; }
  setPoints(p: Array<any>) {}
}
export class PointsPattern extends Pattern {
  points: Array<Point> = [];

  clone() {
    const clone = new PointsPattern();
    clone.points = [];
    clone.width = this.width;
    this.points.forEach(p => {
      clone.points.push({x: p.x, y: p.y});
    });

    return clone;
  }

  getPoints():  Array<Point> {
    return this.points;
  }
  setPoints(p: Array<Point>) {
    this.points = [];
    p.forEach(point => this.points.push({x: point.x, y: point.y}));
  }
  constructor() {
    super();
    this.points.push({x: 0, y: 0.5}, {x: 1, y: 0.5});
  }
}
export class ColorPattern extends Pattern {
  points: Array<RGBAPoint> = [];

  clone() {
    const clone = new ColorPattern();
    clone.points = [];
    clone.width = this.width;
    this.points.forEach(p => {
      clone.points.push({x: p.x, y: new RGBA(p.y.r, p.y.g, p.y.b, p.y.a ) });
    });
    return clone;
  }
  getPoints():  Array<RGBAPoint> {
    return this.points;
  }
  setPoints(p: Array<RGBAPoint>) {
    this.points = [];
    p.forEach(point => this.points.push({x: point.x, y: point.y}));
  }
  constructor() {
    super();
    // this.points.push({x: 0, y: { r: 1, g: 1, b: 1, a: 1}}, {x: 1, y: { r: 1, g: 1, b: 1, a: 1}});
    this.points.push({x: 0, y: new RGBA(1, 1, 1, 1)}, { x: 1, y: new RGBA(1, 1, 1, 1)});
  }
}

export class Channel {
  patterns: Array<Pattern>;
  getWidth() {
    let res = 0;
    this.patterns.forEach(p => res += p.width);
    return res;
  }
  clone() {
    const clone = new Channel();
    this.patterns.forEach(p => {
      clone.patterns.push(p.clone());
    });
    return clone;
  }
  constructor() {
    this.patterns = [];
  }
}

export class ColorChannel extends Channel {

  clone() {
    const clone = new ColorChannel();
    this.patterns.forEach(p => {
      clone.patterns.push(p.clone());
    });
    return clone;
  }
}

export class ChannelsGroup {
  name: string;
  channels: Array<Channel>;


  deepClone() {
    const clone = new ChannelsGroup(this.name);
    this.channels.forEach(c => {
      clone.channels.push(c.clone());
    });
    return clone;
  }
  clone() {
    const clone = new ChannelsGroup(this.name);
    clone.channels = this.channels;
    return clone;
  }
  constructor(n: string) {
    this.name = n;
    this.channels = [];
  }
}

export class GroupElement {
  position: Point = {x: 0, y: 0};
  width: number = 100;
  group: ChannelsGroup;
  clone() {
    const clone = new GroupElement();
    clone.position.x = this.position.x;
    clone.position.y = this.position.y;
    clone.width = this.width;
    clone.group = this.group.clone();
    return clone;
  }
}

export class GroupChannel {
  groups: Array<GroupElement> = [];

  insertPoint(p: Point, n: number) {
    let length = 0;
    if (this.groups.length > 0) {
      length = this.groups[this.groups.length - 1].position.x + this.groups[this.groups.length - 1].width;
    }
    const groupElement = this.groups.find(g => (p.x * length >= g.position.x) && (p.x * length < g.width));
    const maxWidth = groupElement.group.channels[n].getWidth();
    let pattern: Pattern;
    let pos = 0;

    for (let i = 0; i < groupElement.group.channels[n].patterns.length; i++) {
      pattern = groupElement.group.channels[n].patterns[i];
      if ((p.x * maxWidth >= pos) && (p.x * maxWidth < pos + pattern.width)) {
        break;
      }
      pos += pattern.width;

    }
    pattern.getPoints().push({ x: (p.x * maxWidth - pos) / pattern.width, y: p.y });
    pattern.getPoints().sort((p1, p2) =>  p1.x > p2.x ? 1 : p1.x < p2.x ? -1 : 0 );
  }

  insertRelativePoint(p: Point) {

  }
  clone() {
    const clone = new GroupChannel();
    this.groups.forEach(g => {
      clone.groups.push(g.clone());
    });
    return clone;
  }
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
public copyPattern: Pattern;
public selectedPattern: PatternComponent;
public selectedChannel: ChannelComponent;
public selectedGroupChannel: GroupChannelComponent;
public selectedGroupElement: GroupElementComponent;
public GroupElementComponents: Array<GroupElementComponent> = [];
public groupIndex: number = -1;

public selectGroupElement(element: GroupElementComponent) {
  if (this.selectedGroupElement == element) { return; }
  if (this.selectedGroupElement) {
    this.selectedGroupElement.unselect();
  }
  this.selectedGroupElement = element;
  this.selectedGroupElement.select();
}

public selectGroupChannel(groupChannel: GroupChannelComponent) {
  if (this.selectedGroupChannel == groupChannel) { return; }
  if (this.selectedGroupElement) {
    this.selectedGroupElement.unselect();
    this.selectedGroupElement = undefined;
  }

  if (this.selectedGroupChannel) {
    this.selectedGroupChannel.unselect();
  }
  this.selectedGroupChannel = groupChannel;
  this.selectedGroupChannel.select();
}

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

getTotalLength(): number {
  let res: number = 0;
  this.groupChannels.forEach(gc => {
    if (gc.groups.length > 0) {
      res = Math.max(res, gc.groups[gc.groups.length - 1].position.x + gc.groups[gc.groups.length - 1].width);
    }
  });
  return res;
}

getNormalChannel(c: GroupChannel): Array<Array<Point>> {
  const res:  Array<Array<Point>> = [];
  const normals = [];

  return res;
}

getNormalGroup(g): Array<Array<Point>> {
  const res:  Array<Array<Point>> = [];
  let maxWidth = 0;
  let id = 0;
  g.channels.forEach(c => {
    let xpos = 0;
    let shift = 1;
    c.patterns.forEach(p => {
      if (p instanceof ColorPattern) {
        shift = 3;
        p.getPoints().forEach(point => {
          if (!res[id]) {res[id] = new Array<Point>(); }
          if (!res[id + 1]) {res[id + 1] = new Array<Point>(); }
          if (!res[id + 2]) {res[id + 2] = new Array<Point>(); }
          res[id].push({ x: point.x * p.width + xpos, y: point.y.r * point.y.a });
          res[id + 1].push({ x: point.x * p.width + xpos, y: point.y.g * point.y.a });
          res[id + 2].push({ x: point.x * p.width + xpos, y: point.y.b * point.y.a });
        });
      } else {
        p.getPoints().forEach(point => {
          if (!res[id]) {res[id] = new Array<Point>(); }
          res[id].push({ x: point.x * p.width + xpos, y: 1 - point.y });
        });
      }
      xpos += p.width;
    });

    id += shift;
    maxWidth = Math.max(xpos, maxWidth);
  });

  res.forEach(c => c.map(p => p.x /= maxWidth));
  res.forEach(c => { if (c[c.length - 1].x != 1) { c.push({ x: 1, y: c[c.length - 1].y }); }});
  //  res.forEach(c => c.map(p => p.x = p.x * g.width + g.position.x ));

  return res;
}

public saveBinary() {
  const list = new BytesList();
  list.addGange(this.doubleToByteArray(1)); // ver
  list.addGange(this.doubleToByteArray(1)); // len
  list.addGange(this.doubleToByteArray(255)); // max amp
  let channels: Array<Array<Point>> = [];
  let channelPos: number = 0;

  let totalWidth = 0;

  this.groupChannels.forEach((gc, gcIndex) => {
    if (gc.groups.length > 0) {
      let maxCount = 0;
      gc.groups.forEach((g) => {
        const normalGroup = this.getNormalGroup(g.group);
        normalGroup.forEach(c => c.map(p => p.x = p.x * g.width + g.position.x ));
        /*  console.log('normalGroup ', normalGroup);
        normalGroup.forEach(c => c.map(p => p.x = p.x * g.width + g.position.x ));
        console.log('normalGroup ', normalGroup);
        */
        maxCount = Math.max(normalGroup.length, maxCount);

        if (channels.length < channelPos + normalGroup.length) {
          channels = channels.concat(new Array<Point>(channelPos + normalGroup.length - channels.length));
        }
        normalGroup.forEach((arr, arrIndex) => {
          if (!channels[channelPos + arrIndex]) {
            channels[channelPos + arrIndex] = [];
          }
          channels[channelPos + arrIndex] = channels[channelPos + arrIndex].concat(arr);
        });

      });

      channelPos += maxCount;
      totalWidth = Math.max(gc.groups[gc.groups.length - 1].width + gc.groups[gc.groups.length - 1].position.x, totalWidth);

    }
  });
  channels.forEach(c => {
    if (c[0].x != 0) {c.unshift({ x: 0, y: c[0].y }); }
    if (c[c.length - 1].x != totalWidth) {c.push({ x: totalWidth, y: c[c.length - 1].y }); }

    c.map(p => p.x /= totalWidth );
  });

  console.log(channels, totalWidth);
  list.addGange(this.intToByteArray(channels.length)); // max amp
  list.insertRange(this.intToByteArray(list.count + 4), 0); // max amp
  channels.forEach(c => {
    list.addGange(this.intToByteArray(c.length));
    c.forEach(p => {
      list.addGange(this.doubleToByteArray(p.x));
      list.addGange(this.doubleToByteArray(p.y));
    });
  });
  const filename = 'ololo.b';
    const blob = new Blob([list.toArray()], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  }
  intToByteArray(number) {
    const buffer = new ArrayBuffer(4);         // JS numbers are 8 bytes long, or 64 bits
    const longNum = new Int32Array(buffer);  // so equivalent to Float64

    longNum[0] = number;
    return Uint8Array.from(new Int8Array(buffer));
    // return Uint8Array.from(new Int8Array(buffer)).reverse();  // reverse to get little endian
  }

  doubleToByteArray(number) {
    const buffer = new ArrayBuffer(8);         // JS numbers are 8 bytes long, or 64 bits
    const longNum = new Float64Array(buffer);  // so equivalent to Float64

    longNum[0] = number;
    return Uint8Array.from(new Int8Array(buffer));
  }

  constructor() {
    this.groups = [];
    this.groupChannels = [];
  }
}
