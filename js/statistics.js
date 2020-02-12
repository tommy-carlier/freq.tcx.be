import time from './time.js';
import data from './data.js';

class Statistics {
  constructor() {
    this.today = time.today();
    this.minDateDayCountsMs = time.addDays(this.today, -30).valueOf();
    this.minCount = 0;
    this.maxCount = 0;
    this.dayCounts = new Map();
    this.hourCounts = new Map();
    this.maxHourCount = 0;
    this.periods = [
      createDayPeriodStats(this.today, 90),
      createDayPeriodStats(this.today, 60),
      createDayPeriodStats(this.today, 30),
      createDayPeriodStats(this.today, 14),
      createDayPeriodStats(this.today, 7),
      null,
      createWeekDayStats(1),
      createWeekDayStats(2),
      createWeekDayStats(3),
      createWeekDayStats(4),
      createWeekDayStats(5),
      createWeekDayStats(6),
      createWeekDayStats(0)
    ];

    function createDayPeriodStats(today, days) {
      const minDateMs = time.addDays(today, -days).valueOf();
      return new PeriodStatistics(days + 'd', date => date.valueOf() >= minDateMs);
    }

    function createWeekDayStats(weekDay) {
      return new PeriodStatistics(time.getWeekDayLabel(weekDay), date => date.getDay() == weekDay);
    }
  }

  async loadOccurrences(target) {
    const self = this, maxDateValue = self.today.valueOf();
    var currentDate = new Date(0), currentCount = 0, minDateValue = 0;

    function finishCurrentDate() {
      if(currentCount > 0) {
        if(currentDate.valueOf() >= self.minDateDayCountsMs) self.dayCounts.set(currentDate, currentCount);
        if(currentCount > self.maxCount) self.maxCount = currentCount;
        for(var period of self.periods) {
          if(period) period.addDayCount(currentDate, currentCount);
        }
      }
    }

    function addHourCount(hour, count) {
      const newCount = (self.hourCounts.get(hour)||0) + count;
      self.hourCounts.set(hour, newCount);
      if(newCount > self.maxHourCount) self.maxHourCount = newCount;
    }

    function processTimeOfDay(occ) {
      const datePct = 0.1 + 0.9 * (occ.valueOf() - minDateValue) / (maxDateValue - minDateValue);
      const timeOfDay = time.fractionalTimeOfDay(occ);
      const hour = Math.floor(timeOfDay);
      const hourPct = timeOfDay - hour;
      if(hourPct > 0.00001) {
        addHourCount(hour, datePct * (1 - hourPct));
        addHourCount((hour + 1) % 24, datePct * hourPct);
      } else addHourCount(hour, datePct);
    }

    await data.getOccurrencesBetween(target, time.addDays(self.today, -90), self.today, occ => {
      const date = time.startOfDay(occ);
      if(date.valueOf() != currentDate.valueOf()) {
        finishCurrentDate();
        currentDate = date;
        currentCount = 0;
        if(minDateValue == 0) minDateValue = date.valueOf();
      }
      processTimeOfDay(occ);
      currentCount += 1;
      return true;
    });

    finishCurrentDate();
    for(var period of self.periods) {
      if(period) {
        period.finish();
        if(this.minCount == 0 || period.minCount < this.minCount) this.minCount = period.minCount;
      }
    }
  }
}

class PeriodStatistics {
  constructor(label, datePredicate) {
    this.label = label;
    this.datePredicate = datePredicate;
    this.minCount = 0;
    this.maxCount = 0;
    this.totalCount = 0;
    this.totalDays = 0;
    this.averageCount = 0;
  }

  addDayCount(date, count) {
    if(this.datePredicate(date)) {
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