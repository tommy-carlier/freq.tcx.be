import time from './time.js';
import data from './data.js';

class Statistics {
  constructor() {
    this.today = time.today();
    this.minDateDayCountsMs = time.addDays(this.today, -30).valueOf();
    this.maxCount = 0;
    this.dayCounts = new Map();
    this.hourCounts = new Map();
    this.freqDist = new Map();
    this.maxFreqCount = 0;
    this.maxHourCount = 0;
    this.buckets = [];
    this.periodBuckets = [];
    this.weekDayBuckets = [];
  }

  async loadOccurrences(target) {
    const self = this, maxDateValue = self.today.valueOf();
    var currentDate = new Date(0), currentCount = 0, minDateValue = 0;

    addPeriod(120);
    addPeriod(90);
    addPeriod(60);
    addPeriod(30);
    addPeriod(14);
    addPeriod(7);
    for(var i = 1; i <= 6; i++) addWeekDay(i);
    addWeekDay(0);

    function addPeriod(days) {
      const minDateMs = time.addDays(self.today, -days).valueOf();
      addBucket(self.periodBuckets, new StatBucket(days + 'd', date => date.valueOf() >= minDateMs));
    }

    function addWeekDay(weekDay) {
      addBucket(self.weekDayBuckets, new StatBucket(time.getWeekDayLabel(weekDay), date => date.getDay() == weekDay));
    }

    function addBucket(specificBuckets, bucket) {
      self.buckets.push(bucket);
      specificBuckets.push(bucket);
    }

    function finishCurrentDate() {
      if(currentCount > 0) {
        incrementFreqDist(currentCount);
        if(currentDate.valueOf() >= self.minDateDayCountsMs) self.dayCounts.set(currentDate, currentCount);
        if(currentCount > self.maxCount) self.maxCount = currentCount;
        for(var bucket of self.buckets) {
          bucket.addDayCount(currentDate, currentCount);
        }
      }
    }

    function incrementFreqDist(freq) {
      const count = (self.freqDist.get(freq)||0) + 1;
      if(count > self.maxFreqCount) self.maxFreqCount = count;
      self.freqDist.set(freq, count);
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

    await data.getOccurrencesBetween(target, time.addDays(self.today, -120), self.today, occ => {
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
    for(var bucket of self.buckets) {
      bucket.finish();
    }
  }
}

class StatBucket {
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