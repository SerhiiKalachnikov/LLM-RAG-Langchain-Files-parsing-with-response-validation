export interface ISummaryAndCalendar {
  summary: string;
  calendarEvents:
    | [
        {
          start: string;
          end: string;
          title: string;
          description: string;
          type: string;
        },
      ]
    | []
    | null;
}

export interface IFinalCalendarParts {
  [part: number]: ISummaryAndCalendar;
}
