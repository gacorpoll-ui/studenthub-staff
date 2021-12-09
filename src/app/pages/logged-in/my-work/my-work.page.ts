import { Component, OnInit } from '@angular/core';
import {StoryService} from "../../../providers/logged-in/story.service";
import {Story} from "../../../models/request";
import {NavController} from "@ionic/angular";

@Component({
  selector: 'app-my-work',
  templateUrl: './my-work.page.html',
  styleUrls: ['./my-work.page.scss'],
})
export class MyWorkPage implements OnInit {

  public segment: string = 'current';
  public currentStory: Story;
  public oldStories: Story[];
  constructor(
    public storyService: StoryService,
    public navCtrl: NavController
  ) { }

  ngOnInit() {
    this.loadActiveStories();
    this.loadAllOtherStories();
  }

  segmentChanged(event) {
    this.segment = event.target.value;
  }

  loadActiveStories() {
    this.storyService.loadActiveStory().subscribe(res => {
      this.currentStory = res.body;
    });
  }

  loadAllOtherStories() {
    this.storyService.listAllOldHistory().subscribe(res => {
      this.oldStories = res.body;
    });
  }

  /**
   * When its selected
   */
  rowSelected(model) {
    // Load Detail Page
    this.navCtrl.navigateForward('story-view/' + model.story_uuid, {
      state: {
        model
      }
    });
  }
}
