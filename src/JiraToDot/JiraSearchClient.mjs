import { Buffer } from 'node:buffer';

export class JiraSearchClient {
  constructor({
    username,
    password,
    host,
    apiVersion = '2',
    fetchImpl = fetch,
  }) {
    this.username = username;
    this.password = password;
    this.host = host;
    this.apiVersion = apiVersion;
    this.fetch = fetchImpl;
  }

  async searchJira(jql, optional = {}) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.username && this.password) {
      const credentials = Buffer.from(
        `${this.username}:${this.password}`,
        'utf8',
      ).toString('base64');
      headers.Authorization = `Basic ${credentials}`;
    }

    const response = await this.fetch(
      `https://${this.host}/rest/api/${this.apiVersion}/search`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jql,
          ...optional,
        }),
      },
    );

    const text = await response.text();
    let body;

    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      throw new Error(JSON.stringify(body));
    }

    return body;
  }
}
