import { z } from 'zod';

export const summaryAndCalendarSchema = z.object({
  summary: z
    .string()
    .nullish()
    .describe(
      'Short Summary of the document, Find event name and put it to summary. Only text allowed.',
    ),
  calendarEvents: z.array(
    z
      .object({
        start: z
          .string()
          .nullish()
          .describe('Start date of the event, convert to ISO format if found'),
        end: z
          .string()
          .nullish()
          .describe('End date of the event, convert to ISO format if found'),
        title: z
          .string()
          .nullish()
          .describe(
            'Title of the event, Figure out title and description and type of the event.',
          ),
        description: z
          .string()
          .nullish()
          .describe(
            'Description of the event. Figure out title and description and type of the event.',
          ),
        type: z.string().nullish().describe('Type of the event'),
        isOnlyDay: z
          .boolean()
          .nullish()
          .describe('If only day found (without time), true'),
      })
      .nullish(),
  ),
});
