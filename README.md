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

Out of scope (Research Topics):
- *Classification of Hadith (Saheeh/ hasan/ Dha'eef) or (Prophet-like-speech "textual finger print")
  - Possible crowd sourced (الدرر السنية)
  - Percentage of score for each rawi of accuracy based on multiple sources
  - filter by classification
- *Named Entity Recognition
  - Identifying Entity
  - case of shifting isnad using ح
  - case of using عطف
- *Predict Missing / Missing check
  - Connectivity who could be missing between any 2 rawi?
- *Knowledge Extraction: Extract tags/grades from Narrator Discription
  - add rawi/hadith notes and tags: weak in arabic-evidency- israeliyat - marfoo3 7ukmn -
  - fill missing grades + add more grading sources
  - validate connectivity (time & place)
- *Information Retrieval: search for hadith (content) full ranking system
  - prefix and suffix + ignore punctuations?
- Indexing:
  - find pages in websites /chapters in books that are linked/discussing a specific hadith
- Advanced Viz:
  - color code method: comparison by: 1)route/chain, 2)narration (matn) 3) both 4) none [current] as visual analysis
  - combine the "Zeyadat" narrations into one steched narration and color code links to highlight sources

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

Visualization Library Limitations:
- Highlight full route on node click => Documentation: "For this chart, only one entity can be selected at a time."
- To add a text on links
- Order of the nodes
- different lengths of layers
- layering

سائل واللطائف والفوائد واستخدامات البرنامج:
* ثم إضافة هذه الفوائد في وصف الحديث/الراوي

- نسبة موافقة لفظ البخاري مع لفظ مسلم في الأحاديث المتوافقة في الإسناد

-ابن حجر في كتاب التفسير في الفتح:
وهذا أحد الأحاديث الأربع التي على فيها مسلم على البخاري عن نفس الشيخ

- من روى عن شيخ حديثا واحدا او عدد بحصر

* قول الطبراني وتفرد به فلان في الكتب الستة ... مع تحفة الأشراف للمزي

* سبر مرويات الراوي للحكم عليه
