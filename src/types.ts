/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Letter {
  id: string;
  title: string;
  content: string;
  color: string;
}

export interface MoodResponse {
  mood: string;
  message: string;
  icon: string;
}

export interface Memory {
  id: string;
  type: 'photo' | 'note' | 'chat';
  content: string;
  date: string;
  caption?: string;
}

export interface Song {
  title: string;
  artist: string;
  url: string;
  note?: string;
}
