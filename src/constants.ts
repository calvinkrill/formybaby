/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Letter, MoodResponse, Memory, Song } from './types';

export const LETTERS: Letter[] = [
  {
    id: 'sad',
    title: 'Open when you\'re sad',
    content: "Hey baby, if you're reading this, I wish I could give you the biggest hug right now. Remember that it's okay to feel this way, and I'm always here to listen. You are so strong, and I believe in you more than anything. I love you so much.",
    color: 'bg-white/5 border-white/10'
  },
  {
    id: 'miss',
    title: 'Open when you miss me',
    content: "I miss you too, more than words can say. Close your eyes and imagine me right there with you. I'm counting down the seconds until I can see your beautiful smile again. I'm yours, always.",
    color: 'bg-white/5 border-white/10'
  },
  {
    id: 'tired',
    title: 'Open when you feel tired',
    content: "You've been working so hard, palangga. Please take a moment to breathe and rest. You don't have to carry the whole world on your shoulders. I'm so proud of everything you do. Rest well, my love.",
    color: 'bg-white/5 border-white/10'
  },
  {
    id: 'overthinking',
    title: 'Open when you\'re overthinking',
    content: "Take a deep breath. Those thoughts are just clouds passing through. You are loved, you are safe, and you are enough. Nothing will change how I feel about you. Focus on my voice: I love you.",
    color: 'bg-white/5 border-white/10'
  },
  {
    id: 'love',
    title: 'Open when you need love',
    content: "I love you. I love your laugh, your kindness, your soul. You are the best thing that ever happened to me. Never forget how much you mean to me. You are my everything.",
    color: 'bg-white/5 border-white/10'
  }
];

export const MOODS: MoodResponse[] = [
  {
    mood: "i'm sad",
    message: "Baby, I know things are heavy right now but I'm proud of you okay? I'm here for you.",
    icon: 'CloudRain'
  },
  {
    mood: "i feel alone",
    message: "You are never alone. I am always a message or a heartbeat away. You are so loved.",
    icon: 'User'
  },
  {
    mood: "i miss you",
    message: "I miss you too! Let's watch a movie together virtually or just stay on call?",
    icon: 'Heart'
  },
  {
    mood: "i'm tired",
    message: "Rest ka muna, baby. You did your best today and that is more than enough.",
    icon: 'Moon'
  },
  {
    mood: "i want comfort",
    message: "Sending you a virtual blanket and a warm hug. Everything will be okay.",
    icon: 'Coffee'
  },
  {
    mood: "i need reassurance",
    message: "I'm not going anywhere. You are my choice today, tomorrow, and every day after.",
    icon: 'ShieldCheck'
  }
];

export const MEMORIES: Memory[] = [
  {
    id: '1',
    type: 'note',
    content: "The first time you said 'I love you'. My heart skipped a beat.",
    date: '2026-02-14',
    caption: 'Valentine\'s Day'
  },
  {
    id: '2',
    type: 'chat',
    content: "Baby: 'I'm so lucky to have you.'\nMe: 'No, I'm the lucky one.'",
    date: '2026-04-12',
    caption: 'A random Sunday'
  },
  {
    id: '3',
    type: 'note',
    content: "That time we laughed until our stomachs hurt over nothing.",
    date: '2026-05-01'
  }
];

export const SONGS: Song[] = [
  {
    title: 'Perfect',
    artist: 'Ed Sheeran',
    url: 'https://open.spotify.com/track/0tgVpU06vYiyp5Xubisspl',
    note: 'This song always makes me think of you.'
  },
  {
    title: 'Lover',
    artist: 'Taylor Swift',
    url: 'https://open.spotify.com/track/1dGrvS9uH7v9ZHLpRyXRtM',
    note: 'For my favorite person.'
  }
];

export const DAILY_MESSAGES = [
  "i'm proud of you",
  "you're doing enough",
  "drink water baby",
  "you deserve soft love",
  "palangga taka always",
  "you are my sunshine",
  "I'm so lucky you're mine",
  "don't forget to smile today"
];
