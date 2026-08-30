import type moment from "moment"
import { dtNowLocale } from "@/lib/datetimeUtils"

export type HadithOfDay = {
  arabic: string
  swahili: string
  source: string
}

const HADITH_LIBRARY: HadithOfDay[] = [
  {
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    swahili: "Hakika matendo yanategemea nia.",
    source: "Sahih al-Bukhari 1",
  },
  {
    arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
    swahili: "Usafi ni nusu ya imani.",
    source: "Sahih Muslim 223",
  },
  {
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    swahili: "Hajakuwa na imani kamili mmoja wenu mpaka ampendelee ndugu yake anachojipendelea mwenyewe.",
    source: "Sahih al-Bukhari 13",
  },
  {
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    swahili: "Anayemuamini Allah na Siku ya Mwisho aseme mema au anyamaze.",
    source: "Sahih al-Bukhari 6018",
  },
  {
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    swahili: "Mbora wenu ni yule anayejifunza Qurani na kuifundisha.",
    source: "Sahih al-Bukhari 5027",
  },
  {
    arabic: "الدِّينُ النَّصِيحَةُ",
    swahili: "Dini ni nasaha ya kweli.",
    source: "Sahih Muslim 55",
  },
  {
    arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ",
    swahili: "Hakika Allah ni Mpole na anapenda upole.",
    source: "Sahih Muslim 2593",
  },
  {
    arabic: "مَنْ لَا يَرْحَمْ لَا يُرْحَمْ",
    swahili: "Asiyewahurumia wengine hatahurumiwa.",
    source: "Sahih al-Bukhari 6013",
  },
  {
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    swahili: "Matendo yanayopendwa zaidi na Allah ni yale yanayodumu, hata kama ni machache.",
    source: "Sahih Muslim 783",
  },
  {
    arabic: "لَا تَغْضَبْ",
    swahili: "Usikasirike.",
    source: "Sahih al-Bukhari 6116",
  },
  {
    arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",
    swahili: "Mkono wa kutoa ni bora kuliko mkono wa kupokea.",
    source: "Sahih al-Bukhari 1429",
  },
  {
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    swahili: "Anayefuata njia ya kutafuta elimu, Allah humrahisishia kwa hiyo njia ya Peponi.",
    source: "Sahih Muslim 2699",
  },
]

export function getHadithOfDay(date: moment.Moment = dtNowLocale()): HadithOfDay {
  const dayNumber = Math.floor(date.clone().startOf("day").valueOf() / 86_400_000)
  const index = ((dayNumber % HADITH_LIBRARY.length) + HADITH_LIBRARY.length) % HADITH_LIBRARY.length
  return HADITH_LIBRARY[index]
}
