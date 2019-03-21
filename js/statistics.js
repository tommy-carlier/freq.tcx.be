import time from './time.js';
import data from './data.js';

class Statistics {
  constructor(recentDays) {
    this.today = time.startOfDay(new Date());
    this.minDateDayCountsMs = time.addDays(this.today, -recentDays).valueOf();
    this.minCount = 0;
    this.maxCount = 0;
    this.dayCounts = new Map();
    this.periods = [
      new PeriodStatistics(this.today, 90),
      new PeriodStatistics(this.today, 60),
      new PeriodStatistics(this.today, 30),
      new PeriodStatistics(this.today, 14),
      new PeriodStatistics(this.today, 7)
    ];
  }

  async loadOccurrences(target, dtCB) {
    var currentDate = new Date(0), currentCount = 0, self = this;
    function finishCurrentDate() {
      if(currentCount > 0) {
        if(currentDate.valueOf() >= self.minDateDayCountsMs) self.dayCounts.set(currentDate, currentCount);
        if(self.minCount == 0 || currentCount < self.minCount) self.minCount = currentCount;
        if(currentCount > self.maxCount) self.maxCount = currentCount;
        for(var period of self.periods) {
          period.addDayCount(currentDate, currentCount);
        }
      }
    }

    await data.getOccurrencesBetween(target, time.addDays(self.today, -90), self.today, occ => {
      const date = time.startOfDay(occ);
      if(date.valueOf() != currentDate.valueOf()) {
        finishCurrentDate();
        currentDate = date;
        currentCount = 0;
      }
      currentCount += 1;
      if(dtCB) dtCB(occ);
      return true;
    });

    finishCurrentDate();
    for(var period of self.periods) {
      period.finish();
    }
  }
}

class PeriodStatistics {
  constructor(today, days) {
    this.days = days;
    this.minDateMs = time.addDays(today, -days).valueOf();
    this.minCount = 0;
    this.maxCount = 0;
    this.totalCount = 0;
    this.totalDays = 0;
    this.averageCount = 0;
  }

  addDayCount(date, count) {
    if(date.valueOf() >= this.minDateMs) {
      if(this.minCount == 0 || count < this.minCount) this.minCount = count;
      if(count > this.maxCount) this.maxCount = count;
      this.totalCount += count;
      this.totalDays += 1;
    }
  }

  finish() {
    if(this.totalDays > 0) {
      this.averageCount = this.totalCount / this.totalDays;
    }
  }
}

export default Statistics;