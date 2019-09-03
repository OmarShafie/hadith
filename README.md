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
- It misses the narration term between the links
- student-teacher relation is not complete list
- some narrators are missing from the data
- chain dows not show if this is a Prophet Hadith or a Companion
- Grades are missing
- Grade are inconsistant

Out of scope:
- Get more resource data/books.
- Classification of Hadith (Saheeh/ hasan/ Dha'eef)
  - Possible crowd sourced
  - Percentage of score for each rawi of accuracy
  -filter by classification
  

Ready Features:
- Visulaize Sankey diagram of Hadiths of any rawi in the 6 books
- filter by top K number of narrators
- Filter Hadiths by book
- Narrators are color coded to highlight grade of narration
- Sankey Diagram weights represent number of hadiths between any 2 rawis'

Next Steps:
- Populate Hadiths in Link in a table
- Sanad Search (squence of rawi's)
- Regex Search/ Bool Search
- search for rawi by name
- Optimize performance
- show grade legend
- Hover + color code link based on the connection level
  - tooltip rawi details
  - add notes and comments: weak kn arabic - israeliyat - marfoo3 7ukmn - 
  - Tadlees
  - No connection
    -who could be missing?
  - different places
  - narration term (صيغ التخمل)
- search for hadith (content) and view its sankey
  - prefix and suffix + ignore punctuations
  - find similar hadiths (mutaba'at & shuhood)
  - color code each route/chain as visual analysis
  - combine the "Zeyadat" narrations into one steched narration color coded by its route
