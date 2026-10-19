export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

export async function listCalendarEvents(token: string): Promise<CalendarEventItem[]> {
  const timeMin = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      timeMin
    )}&singleEvents=true&orderBy=startTime&maxResults=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Erro ao carregar eventos da Google Agenda.');
  }

  const data = await res.json();
  return (data.items || []) as CalendarEventItem[];
}

export async function createCalendarEvent(
  token: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string;
    endDateTime: string;
  }
): Promise<CalendarEventItem> {
  const body = {
    summary: event.summary,
    description: event.description,
    location: event.location,
    start: {
      dateTime: event.startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: event.endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Erro ao criar evento na Google Agenda.');
  }

  return await res.json();
}

export async function deleteCalendarEvent(token: string, eventId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Erro ao excluir evento da Google Agenda.');
  }
}
