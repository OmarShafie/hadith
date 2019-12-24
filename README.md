# VizHadith
Search engine which provides Visual analysis of Hadith from the Six Books Data.

Web-based using pure HTML, Bootstrap and JavaScript.

Sankey Diagram is built using Google Chart's Sankey.

Data Sets are scraped from: ...
18,800 Narrators [ID, Name, Grade(source: Ibn Hajar)]
7,200  Ahadeeth [ID, Title, Hadith Span, Asaneed (Comma separated),Hadith XML]:Bukhari (other 34 books to be scraped later)

Libraies:
- Google Chart - Sankey Diagram
- Papa Parse - JS cvs Parsing Library
- Scrapy - Python for scraping the data (Narrators and Hadith)

Challenges:
- Scrape
- Parse
- Cycle detection

Data Challenges:
XML needs to be extracted:
  - Narration term between the links (صيغ الأداء) to show connection
  - chain does not show if this is a Prophet Hadith or a Companion (منتهى الإسناد)
- 56.8% grades are missing (10,680 / 18,800 ) (درجة الراوي)
- Grade are not uniformed (1363 unique terms)
- Other sources of grades are missing
- Main known name is missing
- Narrators Special comments
- Narrators time/places - useful to verify connection

Out of scope (Research Topics):
- *Classification of Hadith (Saheeh/ hasan/ Dha'eef) or (Prophet-like-speech "textual finger print")
  - Possible crowd sourced
  - Percentage of score for each rawi of accuracy
  - filter by classification
  - add rawi/hadith notes and tags: weak in arabic-evidency- israeliyat - marfoo3 7ukmn - 
- *Named Entity Recognition
  - Identifying Entity
  - case of shifting isnad using ح
  - case of using عطف
- *Predict Missing / Missing check
  - Connectivity who could be missing between any 2 rawi?
- *Knowledge Extraction: Extract tags/grades from Narrator Discription
- prefix and suffix + ignore punctuations?
- color code each route/chain as visual analysis
- combine the "Zeyadat" narrations into one steched narration and color code links to highlight sources

Ready Features:
- *Visulaize Sankey diagram of Hadiths of any rawi in bukhari
- filter by top K number of narrators (reduce size)
- Filter Hadiths by book
- Narrators are color coded to highlight grade of narration with grade legend
- Sankey Diagram weights represent number of hadiths between any 2 rawis'
- Populate Hadiths in Link in a table

Next Steps (I know how to do):
- *uniform grades
  - tool tips!!
- Color links based on narration term (صيغ التخمل)
- highlight Tadlees
- Sanad Search (squence of rawi's) - Regex Search/ Bool Search
- search for rawi by name
- *Information Retrieval: search for hadith (content)then select list of wanted ahadith

Possible feature (possible, but not now):
-transliterate names
- *Scraping: Get more resource data/books. Scale to all avaible Sunnah Books.
  - Collapse nodes
  - view top down rather than left right
  - responsivness
  - On node click: retrive rawi details from website
  - All controllers on a drawer
  - font sizes controller
  - find similar hadiths (mutaba'at & shuhood)
  - Search by أطراف , تخريج, or exact match+similarity => 

سائل واللطائف والفوائد واستخدامات البرنامج:
* ثم إضافة هذه الفوائد في وصف الحديث/الراوي

- نسبة موافقة لفظ البخاري مع لفظ مسلم في الأحاديث المتوافقة في الإسناد

-ابن حجر في كتاب التفسير في الفتح:
وهذا أحد الأحاديث الأربع التي على فيها مسلم على البخاري عن نفس الشيخ

- من روى عن شيخ حديثا واحدا او عدد بحصر

* قول الطبراني وتفرد به فلان في الكتب الستة ... مع تحفة الأشراف للمزي
