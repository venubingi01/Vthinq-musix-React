import type { DevotionalOccasion } from '../types/ai';

export const WEEKDAY_DEVOTIONAL_MAP: Record<number, DevotionalOccasion> = {
  1: {
    id: 'mon-shiva',
    title: 'Somavaram (Monday) — Dedicated to Lord Shiva',
    deity: 'Lord Shiva',
    dayOfWeek: 'Monday',
    description: 'Mondays are sacred to Mahadev (Lord Shiva). Perfect for Shiva Stotrams, Om Namah Shivaya chants, and Lingashtakam.',
    suggestedLanguages: ['Telugu', 'Sanskrit', 'Hindi', 'Tamil'],
    sampleQueries: ['Shiva Tandava Stotram', 'Lingashtakam', 'Om Namah Shivaya', 'Maha Mrityunjaya Mantra']
  },
  2: {
    id: 'tue-hanuman',
    title: 'Mangalavaram (Tuesday) — Dedicated to Lord Hanuman & Lord Ganesha',
    deity: 'Lord Hanuman',
    dayOfWeek: 'Tuesday',
    description: 'Tuesdays celebrate the devotion and strength of Lord Hanuman and the blessings of Lord Ganesha.',
    suggestedLanguages: ['Telugu', 'Hindi', 'Sanskrit'],
    sampleQueries: ['Hanuman Chalisa', 'Anjaneya Dandakam', 'Ganesha Pancharatnam', 'Sankata Nashana Ganesha Stotram']
  },
  3: {
    id: 'wed-krishna',
    title: 'Budhavaram (Wednesday) — Dedicated to Lord Krishna & Lord Vithoba',
    deity: 'Lord Krishna',
    dayOfWeek: 'Wednesday',
    description: 'Wednesdays resonate with the divine melodies, bhajans, and flutes of Lord Sri Krishna.',
    suggestedLanguages: ['Telugu', 'Hindi', 'Sanskrit', 'Tamil'],
    sampleQueries: ['Achyutam Keshavam', 'Madhurashtakam', 'Govinda Namalu', 'Bhaja Govindam']
  },
  4: {
    id: 'thu-sai-guru',
    title: 'Guruvaram (Thursday) — Dedicated to Shirdi Sai Baba & Gurus',
    deity: 'Shirdi Sai Baba',
    dayOfWeek: 'Thursday',
    description: 'Thursdays are universally revered for Shirdi Sai Baba, Guru Raghavendra, and spiritual masters.',
    suggestedLanguages: ['Telugu', 'Hindi', 'Marathi'],
    sampleQueries: ['Sai Baba Aarthi', 'Shiridi Sai Bhajans', 'Om Sai Namo Namah', 'Guru Ashtakam']
  },
  5: {
    id: 'fri-lakshmi-devi',
    title: 'Shukravaram (Friday) — Dedicated to Goddess Mahalakshmi & Divine Mother',
    deity: 'Goddess Lakshmi',
    dayOfWeek: 'Friday',
    description: 'Fridays invite prosperity, peace, and abundance through Sri Lakshmi Stotrams and Lalitha Sahasranamam.',
    suggestedLanguages: ['Telugu', 'Sanskrit', 'Tamil', 'Hindi'],
    sampleQueries: ['Mahalakshmi Ashtakam', 'Lalitha Sahasranamam', 'Kanakadhara Stotram', 'Bhagyada Lakshmi Baramma']
  },
  6: {
    id: 'sat-venkateswara',
    title: 'Shanivaram (Saturday) — Dedicated to Lord Venkateswara (Balaji) & Shani Bhagavan',
    deity: 'Lord Venkateswara',
    dayOfWeek: 'Saturday',
    description: 'Saturdays are sacred to Lord Sri Venkateswara of Tirumala and Lord Shani for removing obstacles.',
    suggestedLanguages: ['Telugu', 'Sanskrit', 'Tamil'],
    sampleQueries: ['Venkateswara Suprabhatam', 'Govinda Namavali', 'Annamayya Sankeerthanalu', 'Shani Gayatri']
  },
  0: {
    id: 'sun-surya',
    title: 'Bhanuvaram (Sunday) — Dedicated to Lord Surya (Sun God) & Gayatri Devi',
    deity: 'Surya Bhagavan',
    dayOfWeek: 'Sunday',
    description: 'Sundays bring vitality, radiant health, and clarity with Aditya Hridayam and Gayatri Mantras.',
    suggestedLanguages: ['Sanskrit', 'Telugu', 'Hindi'],
    sampleQueries: ['Aditya Hridayam', 'Gayatri Mantra 108', 'Surya Ashtakam', 'Surya Namaskar Mantras']
  }
};

export const MAJOR_FESTIVALS: DevotionalOccasion[] = [
  {
    id: 'shivaratri',
    title: 'Maha Shivaratri',
    deity: 'Lord Shiva',
    description: 'The great night of Shiva, celebrating the cosmic dance and spiritual awakening.',
    suggestedLanguages: ['Sanskrit', 'Telugu', 'Hindi', 'Tamil'],
    sampleQueries: ['Shiva Tandava', 'Bilvashtakam', 'Har Har Shambhu', 'Nirvana Shatakam']
  },
  {
    id: 'rama-navami',
    title: 'Sri Rama Navami',
    deity: 'Lord Rama',
    description: 'Celebration of the birth of Maryada Purushottama Lord Sri Rama.',
    suggestedLanguages: ['Telugu', 'Hindi', 'Sanskrit'],
    sampleQueries: ['Sri Rama Raksha Stotram', 'Nama Ramayana', 'Ramachandra Kripalu', 'Sri Rama Navami Songs']
  },
  {
    id: 'ganesh-chaturthi',
    title: 'Ganesh Chaturthi / Vinayaka Chavithi',
    deity: 'Lord Ganesha',
    description: 'The vibrant celebration of the remover of obstacles and lord of wisdom.',
    suggestedLanguages: ['Telugu', 'Hindi', 'Marathi', 'Sanskrit'],
    sampleQueries: ['Ganesh Aarti', 'Vatapi Ganapatim', 'Maha Ganapathim', 'Sukhkarta Dukhharta']
  },
  {
    id: 'krishna-janmashtami',
    title: 'Krishna Janmashtami / Gokulashtami',
    deity: 'Lord Krishna',
    description: 'Celebration of the appearance of Lord Sri Krishna, the divine protector and flute player.',
    suggestedLanguages: ['Telugu', 'Hindi', 'Sanskrit'],
    sampleQueries: ['Janmashtami Bhajans', 'Radha Krishna Songs', 'Madhurashtakam', 'Choti Choti Gaiya']
  },
  {
    id: 'hanuman-jayanti',
    title: 'Sri Hanuman Jayanti',
    deity: 'Lord Hanuman',
    description: 'Celebration of the birth of Lord Hanuman, embodiment of courage and unwavering devotion.',
    suggestedLanguages: ['Telugu', 'Hindi', 'Sanskrit'],
    sampleQueries: ['Hanuman Chalisa Fast', 'Sundarakanda Songs', 'Bajrang Baan', 'Maruthi Stotram']
  },
  {
    id: 'diwali',
    title: 'Deepavali / Diwali & Lakshmi Puja',
    deity: 'Goddess Lakshmi',
    description: 'Festival of lights, welcoming the goddess of wealth and spiritual enlightenment.',
    suggestedLanguages: ['Hindi', 'Telugu', 'Sanskrit'],
    sampleQueries: ['Lakshmi Aarti', 'Deepavali Special Songs', 'Ashta Lakshmi Stotram', 'Jai Ganesh Deva']
  },
  {
    id: 'navratri',
    title: 'Sharad Navratri / Durga Puja',
    deity: 'Goddess Durga',
    description: 'Nine nights of divine feminine power, victory of good over evil.',
    suggestedLanguages: ['Hindi', 'Telugu', 'Bengali', 'Sanskrit'],
    sampleQueries: ['Aigiri Nandini', 'Durga Saptashati', 'Ambe Tu Hai Jagdambe', 'Dandiya Garba Hits']
  }
];

// Proxy / helper to access by string weekday names ('monday', 'thursday', etc.)
const DAY_NAME_TO_NUMBER: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6
};

export const WEEKDAY_MAP_BY_NAME: Record<string, DevotionalOccasion> = new Proxy(
  {} as Record<string, DevotionalOccasion>,
  {
    get(_target, prop: string) {
      const lower = String(prop).toLowerCase();
      const num = DAY_NAME_TO_NUMBER[lower];
      if (num !== undefined) {
        return WEEKDAY_DEVOTIONAL_MAP[num];
      }
      return undefined;
    }
  }
);

export function getTodayDevotionalOccasion(date: Date = new Date()): DevotionalOccasion {
  const day = date.getDay();
  return WEEKDAY_DEVOTIONAL_MAP[day] || WEEKDAY_DEVOTIONAL_MAP[4];
}

export function detectFestivalOrOccasion(query: string): DevotionalOccasion | null {
  const q = query.toLowerCase();

  for (const fest of MAJOR_FESTIVALS) {
    const titles = fest.title.toLowerCase().split('/').map((t) => t.trim());
    const deity = fest.deity.toLowerCase();
    const isTitleMatch = titles.some((t) => q.includes(t));
    if (q.includes(fest.id) || isTitleMatch || (q.includes(deity) && (q.includes('festival') || q.includes('jayanti') || q.includes('chaturthi')))) {
      return fest;
    }
  }

  // Deities check
  if (q.includes('shiva') || q.includes('mahadev') || q.includes('bholenath')) {
    return WEEKDAY_DEVOTIONAL_MAP[1];
  }
  if (q.includes('hanuman') || q.includes('anjaneya') || q.includes('bajrangbali')) {
    return WEEKDAY_DEVOTIONAL_MAP[2];
  }
  if (q.includes('ganesh') || q.includes('vinayaka') || q.includes('ganapathi')) {
    return WEEKDAY_DEVOTIONAL_MAP[2];
  }
  if (q.includes('krishna') || q.includes('govinda') || q.includes('shyam')) {
    return WEEKDAY_DEVOTIONAL_MAP[3];
  }
  if (q.includes('sai') || q.includes('baba') || q.includes('raghavendra') || q.includes('guru')) {
    return WEEKDAY_DEVOTIONAL_MAP[4];
  }
  if (q.includes('lakshmi') || q.includes('durga') || q.includes('devi') || q.includes('lalitha') || q.includes('amman')) {
    return WEEKDAY_DEVOTIONAL_MAP[5];
  }
  if (q.includes('venkateswara') || q.includes('balaji') || q.includes('tirupati') || q.includes('shani')) {
    return WEEKDAY_DEVOTIONAL_MAP[6];
  }
  if (q.includes('surya') || q.includes('aditya') || q.includes('sun god')) {
    return WEEKDAY_DEVOTIONAL_MAP[0];
  }

  // "Today is Thursday", "today devotional", "morning prayer"
  if (q.includes('today') || q.includes('morning prayer') || q.includes('evening prayer') || q.includes('devotional')) {
    return getTodayDevotionalOccasion();
  }

  return null;
}
