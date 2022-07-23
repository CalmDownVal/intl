export type DayPeriod = [
	am: string,
	pm: string
];

export type Months = [
	jan: string,
	feb: string,
	mar: string,
	apr: string,
	may: string,
	jun: string,
	jul: string,
	aug: string,
	sep: string,
	oct: string,
	nov: string,
	dec: string
];

export type Weekdays = [
	sun: string,
	mon: string,
	tue: string,
	wed: string,
	thu: string,
	fri: string,
	sat: string
];

export interface DateTimeTranslations {
	dayPeriod?: DayPeriod;
	monthsLong?: Months;
	monthsShort?: Months;
	weekdaysLong?: Weekdays;
	weekdaysShort?: Weekdays;
}

export interface DateTimePartFormat {
	(date: unknown, translations: DateTimeTranslations): string;
}
