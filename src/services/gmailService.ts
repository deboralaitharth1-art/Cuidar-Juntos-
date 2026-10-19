export interface SentEmailResult {
  id: string;
  threadId: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
}

function toBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendEmailViaGmail(
  token: string,
  params: {
    to: string;
    subject: string;
    bodyText: string;
  }
): Promise<SentEmailResult> {
  // Construct RFC 2822 compliant email string
  const emailLines = [
    `To: ${params.to}`,
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`,
    '',
    params.bodyText
  ];

  const rawMessage = emailLines.join('\r\n');
  const base64UrlEncoded = toBase64Url(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: base64UrlEncoded
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Erro ao enviar e-mail pelo Gmail.');
  }

  return await res.json();
}

export async function listRecentGmailMessages(token: string, maxResults = 5): Promise<GmailMessageSummary[]> {
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!listRes.ok) {
    return [];
  }

  const listData = await listRes.json();
  const messages: { id: string; threadId: string }[] = listData.messages || [];

  const results: GmailMessageSummary[] = [];

  for (const msg of messages.slice(0, 5)) {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (msgRes.ok) {
        const fullMsg = await msgRes.json();
        const headers = fullMsg.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(Sem Assunto)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
        const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || '';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

        results.push({
          id: msg.id,
          threadId: msg.threadId,
          snippet: fullMsg.snippet,
          subject,
          from,
          to,
          date
        });
      }
    } catch {
      // ignore individual message load errors
    }
  }

  return results;
}
