# VizHadith
Search engine which provides Visual analysis of Hadith from Hadith Books Data.

Web-based using pure HTML, Bootstrap and JavaScript.

Sankey Diagram is built using Google Chart's Sankey.

Data Sets are scraped from: ...
18,800 Narrators [ID, Name, Grade(source: Ibn Hajar)]
7,200  Ahadeeth [ID, Title, Hadith Span, Asaneed (Comma separated),Hadith XML]:Bukhari (other 34 books to be scraped later)

Libraies:
- Google Chart - Sankey Diagram
- Papa Parse - JS cvs Parsing Library
- Scrapy - Python for scraping the data (Narrators and Hadith)
- PEG.js

Challenges:
- Scrape
- Parse CSV
- Cycle detection
- Query Grammer

Data Challenges:
XML needs to be extracted:
  - Narration term between the links (صيغ الأداء) to show connection
  - chain does not show if this is a Prophet Hadith or a Companion (منتهى الإسناد)
- 56.8% grades are missing (10,680 / 18,800 ) (درجة الراوي)
- Grade are not uniformed (1363 unique terms) run gradeAnalysis from console to see distribution.
- Other sources of grades are missing
- Main known name is missing
- Narrators Special comments
- Narrators time/places - useful to verify connection
- inconsistent narrator labeling i.e. معلقات الليث 
- حديث (عماي) له راويان ولم يحقق
- حديث رقم 4292  باسناد واحد لكنه عندهم باثنين
- Takhreej is limited to first rawi (Search for لَا فَرَعَةَ وَلَا عَتِيرَةَ )
  - Complete Matn is only per takhreej
- Isnad connection is not provided
- grouped matn is not complete nor proper (manual?):  فَإِذَا أَمَرْتُكُمْ بِشَيْءٍ فَأْتُوهُ ، وَإِذَا نَهَيْتُكُمْ عَنْ شَيْءٍ فَاجْتَنِبُوهُ مَا اسْتَطَعْتُمْ .
is not included as مقلوب

Out of scope (Research Topics):
- Advanced Viz:
  - color code method: comparison by: 1)route/chain, 2)narration (matn) 3) both 4) none [current] as visual analysis
  - combine the "Zeyadat" narrations into one steched narration and color code links to highlight sources
  
- *Information Retrieval: search for hadith (content) full ranking system
  - prefix and suffix + ignore punctuations?
  - hadith similarity
  
  - *Knowledge Extraction: Extract tags/grades from Narrator Discription
  - add rawi/hadith notes and tags: weak in arabic-evidency- israeliyat - marfoo3 7ukmn -
  - fill missing grades + add more grading sources
  - validate connectivity (time & place)
  
  - *Named Entity Recognition
  - Identifying Entity
  - case of shifting isnad using ح
  - case of using عطف

- *Predict Missing / Missing check المبهم أو المدلس
  - Connectivity who could be missing between any 2 rawi?
  - probabilities for each rawi
  
- *Classification of Hadith (Saheeh/ hasan/ Dha'eef) or (Prophet-like-speech "textual finger print")
  - Possible crowd sourced (الدرر السنية)
  - Percentage of score for each rawi of accuracy based on multiple sources
  - filter by classification

- Indexing:
  - find pages in websites /chapters in books that are linked/discussing a specific hadith

Ready Features:
- *Visulaize Sankey diagram of Hadiths of any rawi in bukhari
- filter by top K number of narrators (reduce size)
- Filter Hadiths by book
- Narrators are color coded to highlight grade of narration with grade legend
- On node hover: rawi details
- Sankey Diagram weights represent number of hadiths between any 2 rawis'
- Populate Hadiths in Link in a table tooltip
- semi-responsivness
- view top down
- Sanad Search (squence of rawi's)
- Error Handling

Next Steps (I know how to do):
  - Arabic UI
  - Help page (documentation) - What is this website? What does it provide? what is a hadith? where is the source/ who else knows about this? how to share? features
  -
  - select list of wanted ahadith
  - name to suggest (AJAX XML): UI search for rawi by name and tag it

Known bugs:
- tooltip on vertical
- mobile text on vertical

Possible feature (possible, but not now):
- Color links based on narration term (صيغ التخمل) + highlight Tadlees
-Sankey Settings tab:
  - transliterate names
  - light - Dark theme
  - Collapse(delete) nodes
  - font sizes controller
- Select most frequent/common name instead of the full name
  
- Search Settings tab:
  - find similar hadiths (mutaba'at & shuhood)
  - Search by أطراف , تخريج, or exact match+similarity
  - Search by book title
  - *Scraping: Get more resource data/books. Scale to all avaible Sunnah Books+, show kunya and nasab and name of each rawi onHover
    - Grouped Matn: color each group by a unique color + color each zyadah by a n-bit binary colors,  where nth bit is existance of zyadah. grouping by matn, grouping by sanad, grouping by both, none (default).
   - search over hadiths instead of over route ( for analytics, not necessarily for non coder user)

Visualization Library Limitations:
- Highlight full route on node click => Documentation: "For this chart, only one entity can be selected at a time."
- To add a text on links
- Order of the nodes
- different lengths of layers
- layering

سائل واللطائف والفوائد واستخدامات البرنامج:
* ثم إضافة هذه الفوائد في وصف الحديث/الراوي

- Done: 
- سبر مرويات الراوي للحكم عليه
- من روى عن شيخ حديثا واحدا او عدد بحصر
* قول الطبراني وتفرد به فلان في الكتب الستة ... مع تحفة الأشراف للمزي

Isnad Graph: 
-ابن حجر في كتاب التفسير في الفتح:
وهذا أحد الأحاديث الأربع التي على فيها مسلم على البخاري عن نفس الشيخ
*  : وَلَا يُعْرَفُ حَدِيثٌ اجْتَمَعَ عَلَى رِوَايَتِهِ الْعَشَرَةُ إِلَّا هَذَا
-وَأَمَّا قَوْلُ مُسْلِمٍ : ( وَحَدَّثَنِي أَبُو سَعِيدٍ الْأَشَجُّ قَالَ : حَدَّثَنَا وَكِيعٌ قَالَ : حَدَّثَنَا الْأَعْمَشُ ، عَنِ الْمُسَيَّبِ بْنِ رَافِعٍ ، عَنْ عَامِرِ بْنِ عَبْدَةَ قَالَ : قَالَ عَبْدُ اللَّهِ ) فَهَذَا إِسْنَادٌ اجْتَمَعَ فِيهِ طُرْفَتَانِ مِنْ لَطَائِفِ الْإِسْنَادِ ؛ إِحْدَاهُمَا أَنَّ إِسْنَادَهُ كُوفِيٌّ كُلَّهُ ، وَالثَّانِيَةُ أَنَّ فِيهِ ثَلَاثَةً تَابِعِيِّينَ يَرْوِي بَعْضُهُمْ عَنْ بَعْضٍ ، وَهُمُ الْأَعْمَشُ وَالْمُسَيَّبُ وَعَامِرٌ ، وَهَذِهِ فَائِدَةٌ نَفِيسَةٌ قَلَّ أَنْ يَجْتَمِعَ فِي إِسْنَادِ هَاتَانِ اللَّطِيفَتَانِ
- ما ثبت عند مسلم مماهو صحيح بالقطع ولا يتحقق فيه البخاري
- وَهَذَا أَبُو عُثْمَانَ النَّهْدِيُّ وَأَبُو رَافِعٍ الصَّائِغُ - وَهُمَا ممَنْ أَدْرَكَ الْجَاهِلِيَّةَ ، وَصَحِبَا أَصْحَابَ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ مِنْ الْبَدْرِيِّينَ هَلُمَّ جَرًّا ، وَنَقَلَا عَنْهُمْ الْأَخْبَارَ حَتَّى نَزَلَا إِلَى مِثْلِ أَبِي هُرَيْرَةَ وَابْنِ عُمَرَ وَذَوِيهِمَا - قَدْ أَسْنَدَ كُلُّ وَاحِدٍ مِنْهُمَا عَنْ أُبَيِّ بْنِ كَعْبٍ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ حَدِيثًا ، وَلَمْ نَسْمَعْ فِي رِوَايَةٍ بِعَيْنِهَا أَنَّهُمَا عَايَنَا أُبَيًّا أَوْ سَمِعَا مِنْهُ شَيْئًا . وَأَسْنَدَ أَبُو عَمْرٍو الشَّيْبَانِيُّ - وَهُوَ مِمَّنْ أَدْرَكَ الْجَاهِلِيَّةَ ، وَكَانَ فِي زَمَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ رَجُلًا - وَأَبُو مَعْمَرٍ عَبْدُ اللَّهِ بْنُ سَخْبَرَةَ كُلُّ وَاحِدٍ مِنْهُمَا عَنْ أَبِي مَسْعُودٍ الْأَنْصَارِيِّ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ خَبَرَيْنِ . وَأَسْنَدَ عُبَيْدُ بْنُ عُمَيْرٍ عَنْ أُمِّ سَلَمَةَ زَوْجِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ حَدِيثًا ، وَعُبَيْدُ بْنُ عُمَيْرٍ وُلِدَ فِي زَمَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ . وَأَسْنَدَ قَيْسُ بْنُ أَبِي حَازِمٍ - وَقَدْ أَدْرَكَ زَمَنَ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ - عَنْ أَبِي مَسْعُودٍ الْأَنْصَارِيِّ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ ثَلَاثَةَ أَخْبَارٍ . وَأَسْنَدَ عَبْدُ الرَّحْمَنِ بْنُ أَبِي لَيْلَى - وَقَدْ حَفِظَ عَنْ عُمَرَ بْنِ الْخَطَّابِ ، وَصَحِبَ عَلِيًّا - ، عَنْ أَنَسِ بْنِ مَالِكٍ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ حَدِيثًا . وَأَسْنَدَ رِبْعِيُّ بْنُ حِرَاشٍ ، عَنْ عِمْرَانَ بْنِ حُصَيْنٍ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ حَدِيثَيْنِ ، وَعَنْ أَبِي بَكْرَةَ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ حَدِيثًا ، وَقَدْ سَمِعَ رِبْعِيٌّ مِنْ عَلِيِّ بْنِ أَبِي طَالِبٍ وَرَوَى عَنْهُ . وَأَسْنَدَ نَافِعُ بْنُ جُبَيْرِ بْنِ مُطْعِمٍ ، عَنْ أَبِي شُرَيْحٍ الْخُزَاعِيِّ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ حَدِيثًا ، وَأَسْنَدَ النُّعْمَانُ بْنُ أَبِي عَيَّاشٍ ، عَنْ أَبِي سَعِيدٍ الْخُدْرِيِّ ثَلَاثَةَ أَحَادِيثَ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ ، وَأَسْنَدَ عَطَاءُ بْنُ يَزِيدَ اللَّيْثِيُّ ، عَنْ تَمِيمٍ الدَّارِيِّ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ حَدِيثًا ، وَأَسْنَدَ سُلَيْمَانُ بْنُ يَسَارٍ ، عَنْ رَافِعِ بْنِ خَدِيجٍ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ حَدِيثًا ، وَأَسْنَدَ حُمَيْدُ بْنُ عَبْدِ الرَّحْمَنِ الْحِمْيَرِيُّ ، عَنْ أَبِي هُرَيْرَةَ عَنْ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ أَحَادِيثَ . فَكُلُّ هَؤُلَاءِ التَّابِعِينَ الَّذِينَ نَصَبْنَا رِوَايَتَهُمْ عَنْ الصَّحَابَةِ الَّذِينَ سَمَّيْنَاهُمْ لَمْ يُحْفَظْ عَنْهُمْ سَمَاعٌ عَلِمْنَاهُ مِنْهُمْ فِي رِوَايَةٍ بِعَيْنِهَا ، وَلَا أَنَّهُمْ لَقُوهُمْ فِي نَفْسِ خَبَرٍ بِعَيْنِهِ ، وَهِيَ أَسَانِيدُ عِنْدَ ذَوِي الْمَعْرِفَةِ بِالْأَخْبَارِ وَالرِّوَايَاتِ مِنْ صِحَاحِ الْأَسَانِيدِ ، لَا نَعْلَمُهُمْ وَهَّنُوا مِنْهَا شَيْئًا قَطُّ وَلَا الْتَمَسُوا فِيهَا سَمَاعَ بَعْضِهِمْ مِنْ بَعْضٍ


Matn: 
-نسبة موافقة لفظ البخاري مع لفظ مسلم في الأحاديث المتوافقة في الإسناد
- 
