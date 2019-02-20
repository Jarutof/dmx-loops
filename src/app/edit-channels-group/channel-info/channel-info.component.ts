import { Component, OnInit } from '@angular/core';
import { DmxModelService, Pattern, PointsPattern, ColorPattern } from 'src/app/dmx-model.service';

@Component({
  selector: 'app-channel-info',
  templateUrl: './channel-info.component.html',
  styleUrls: ['./channel-info.component.scss']
})
export class ChannelInfoComponent implements OnInit {

  constructor(public model: DmxModelService) { }

  ngOnInit() {
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
  getGroup() {
    return this.model.groups[this.model.groupIndex];
  }
  copyPattern() {
    if (this.model.selectedPattern.pattern instanceof PointsPattern) {
      this.model.copyPattern = new PointsPattern();
      this.model.copyPattern.setPoints(this.model.selectedPattern.pattern.getPoints());
    } else {
      this.model.copyPattern = new ColorPattern();
      this.model.copyPattern.setPoints(this.model.selectedPattern.pattern.getPoints());
    }

  }
  pastePattern() {
    this.model.selectedPattern.pattern.setPoints(this.model.copyPattern.getPoints());
    this.model.selectedPattern.drawer.draw();
  }
}
