import time from './time.js';
import data from './data.js';

class Statistics {
  constructor() {
    this.minCount = 0;
    this.maxCount = 0;
    this.totalCount = 0;
    this.totalDays = 0;
    this.averageCount = 0;
    this.dayCounts = new Map();
  }

  async loadOccurrences(target, min, max) {
    var currentDate = new Date(0), currentCount = 0, self = this;
    function finishCurrentDate() {
      if(currentCount > 0) {
        self.dayCounts.set(currentDate, currentCount);
        if(self.minCount == 0 || currentCount < self.minCount) self.minCount = currentCount;
        if(currentCount > self.maxCount) self.maxCount = currentCount;
        self.totalCount += currentCount;
        self.totalDays += 1;
      }
    }

    await data.getOccurrencesBetween(target, min, max, occ => {
      const date = time.startOfDay(occ);
      if(date.valueOf() != currentDate.valueOf()) {
        finishCurrentDate();
        currentDate = date;
        currentCount = 0;
      }
      currentCount += 1;
      return true;
    });

    finishCurrentDate();
    if(this.totalDays > 0) {
      this.averageCount = this.totalCount / this.totalDays;
    }
  }
}

export default Statistics;