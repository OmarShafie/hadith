# The Hadith Visual Search Engine

Welcome to **[Hadith Visual Search Engine](https://omarshafie.github.io/hadith/)**, a search engine which provides Visual analysis of *Hadith Isnad tree* (Narration routes) highlighting narrators and narrator grades. The engine also provides the ability to search for Isnad patterns.

**The Hadith** is Narration of sayings and actions of the prophet. In its classic form, a hadith has two parts — the sequence of reporting individuals who have transmitted the report (*the isnad*), and the actual sayings of the prophet/companion (*the matn*). Hadith books are collections of hadiths written in the classic forms.

## The Hadith Sankey Diagram ##

![Sankey Diagram example](https://github.com/OmarShafie/hadith/blob/master/Hadith%20Sankey.png)

## The Sanad Pattern Search ##

## The Narrator Grade Classification ##

## Current Release Features ##

- [x] **Sankey Diagram**
 - Visulaize Sankey diagram of Hadiths of any rawi in bukhari
 - Rotate sankey, view top down
 - Sankey Diagram weights represent number of hadiths between any 2 rawis'

- [x] **Narrator Nodes**
 - Narrators are color coded to highlight grade of narration with grade legend
 - On node hover: rawi details
 
- [x] **Sanad Query**
 - Sanad Search (squence of rawi's) 
 - Query Error Handling messages

- [X] **Interactive: Route Link Tooltip**
 - Populate Hadiths in Link in a table tooltip
 - Click on any hadith to retrieve all related hadith in the same Takhreeg group (mutaba'at & shuhood)

- [ ] **Hadith Retrieval**
 - filter by top K number of narrators (reduce size)
 - Filter Hadiths by book

- [ ] **UI Design**
 - semi-responsivness
 - dark theme
 
- [ ] **System Details**
 - Completely Static Website
 - No Server, No Database
 - Entirely runs on the browser

- [ ] **Documentation**
 - readme formatting


## The Development and Data ##

Purely developed using HTML, Bootstrap and JavaScript. Visualization library in use, is Google Chart's Sankey. Only needs a browser to run!For research purposes only, data Sets are scraped from: ...

###### Development Libraries: ######
- [Google Chart - Sankey Diagram](https://developers.google.com/chart/interactive/docs/gallery/sankey)
- [Papa Parse](https://www.papaparse.com/) - JS cvs Parsing Library
- [Scrapy](https://scrapy.org/) - Python for scraping the data (Narrators and Hadith)
- [PEG.js](https://pegjs.org/) - Grammer construction library for query parsing

###### Development Challenges: ######
- Scraping
- Parse CSV
- Cycle detection
- Query Grammer

### Available Data ###
###### 18,800+ Narrators ######
ID | Name | Grade(source: Tah'theeb Al-Tah'theeb by Ibn Hajar)

###### 7,200  Ahadeeth :Bukhari (other 34 books to be scraped later) ######
ID | Title | Hadith Span | Asaneed (Comma separated) | Hadith XML

###### Use Case Examples ######
What I would like to be able to do with this tool?
