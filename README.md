# VizHadith
Search engine which provides Visual analysis of Hadith from the Six Books Data.

Web-based using pure HTML, Bootstrap and JavaScript.

Sankey Diagram is built using Google Chart's Sankey.

Data Sets are:
https://www.kaggle.com/fahd09/hadith-dataset/
and
https://www.kaggle.com/fahd09/hadith-narrators

Libraies:
- Google Chart - Sankey Diagram
- Papa Parse - JS cvs Parsing Library

Challenges:
- Parse
- Cycle detection

Data Challenges:
- It misses the narration term between the links (صيغ الأداء)
- student-teacher relation is not complete list [Needed for the Isnad]
- some narrators are missing from the data
- chain does not show if this is a Prophet Hadith or a Companion (منتهى الإسناد)
- Some grades are missing (درجة الراوي)
- Grade are inconsistant
- chain data is incorrect (Test ran found 19348 mistaken chain out of 34409!) - Bukhari had 2475 faulty chains.

Out of scope:
- *Encoding: Get more resource data/books. Scale to all avaible Sunnah Books.
- *Classification of Hadith (Saheeh/ hasan/ Dha'eef)
  - Possible crowd sourced
  - Percentage of score for each rawi of accuracy
  - filter by classification

  - add rawi notes and tags: weak in arabic - israeliyat - marfoo3 7ukmn - 
  - Tadlees
  - *Predict Missing
    -who could be missing between any 2 rawi?
  - different places
  - narration term (صيغ التخمل)
- *Named Entity Recognition
  - Identifying Entity
- *Knowledge Extraction: Extract tags/grades from Narrator Discription
- tooltip rawi details
- prefix and suffix + ignore punctuations?
- color code each route/chain as visual analysis
- combine the "Zeyadat" narrations into one steched narration color coded by its route
- custom range nodePadding
  

Ready Features:
- *Visulaize Sankey diagram of Hadiths of any rawi in the 6 books
- filter by top K number of narrators
- Filter Hadiths by book
- Narrators are color coded to highlight grade of narration with grade legend
- Sankey Diagram weights represent number of hadiths between any 2 rawis'
- Populate Hadiths in Link in a table

Next Steps:
- case of shifting isnad using ح
- case of using عطف
- Color code links based on the connection level?
- Review and test code blocks

- Sanad Search (squence of rawi's)
  - Regex Search/ Bool Search
- search for rawi by name
- *Information Retrieval: search for hadith (content) and view its sankey
  - find similar hadiths (mutaba'at & shuhood)
  - Search by أطراف , تخريج, or exact match+similarity => then select list of wanted ahadith
- Optimize performance

سائل واللطائف والفوائد واستخدامات البرنامج:
* ثم إضافة هذه الفوائد في وصف الحديث/الراوي

- نسبة موافقة لفظ البخاري مع لفظ مسلم في الأحاديث المتوافقة في الإسناد

-ابن حجر في كتاب التفسير في الفتح:
وهذا أحد الأحاديث الأربع التي على فيها مسلم على البخاري عن نفس الشيخ

- من روى عن شيخ حديثا واحدا او عدد بحصر

* قول الطبراني وتفرد به فلان في الكتب الستة ... مع تحفة الأشراف للمزي
