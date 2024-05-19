# KASHAF: The Hadith Visual Search Engine

[![YOUTUBE_TALK_QU](https://github.com/OmarShafie/hadith/blob/master/QU.png)](https://youtu.be/WXzXmeWEz2o)

### الكشاف: محرك بحثي بصري لتتبع شجرة أسانيد الأحاديث النبوية
###### تتفرد نصوص الأخبار المسندة بكونها ذات شقين: السند والمتن. 
###### هنا نستعرض **[الكشاف](https://dev.omarshafie.com/hadith/)**، وهو محرك بحث بصري للأحاديث النبوية يقدم تجسيداً بصرياً مرضِ وفعّال لمختلف احتياجات المستخدمين الدارسين للأحاديث النبوية، ويتيح للمستخدم دراسة أي مجموعة من الأحاديث (سواء مجموعة تخريج أو مجموعته خاصة) عن طريق أتمتة رسم شجرة والتي تمكنه من تحديد المدارات العالية والنازلة وتعيين فروقات المتن والمدار المتفرع عنها. تم عرض المحرك على أساتذة كلية الشريعة في ندوة في جامعة قطر ونشر [الورقة البحثية](https://drive.google.com/file/d/1N_oa_m_W8y8QMs4s3HNkgdh5VvHdCjp5/view) على اليوتيوب: https://youtu.be/WXzXmeWEz2o?si=De57nvNXtxVD4cuM

**The Hadith** is Narration of sayings and actions of the prophet. In its classic form, a hadith has two parts — the sequence of reporting individuals who have transmitted the report (*the isnad*), and the actual sayings of the prophet/companion (*the matn*). Hadith books are collections of hadiths written in the classic forms.

**[KHASHAF](https://dev.omarshafie.com/hadith/)** is a search engine which provides Visual analysis of *Hadith Isnad tree* (Narration routes) highlighting narrators and narrator grades. It attempts to provide a satisfactory and effective visual embodiment for the various needs of users studying the Prophet’s hadiths.
The engine also allows the user to study any group of hadiths (whether a known *Takhreej* collection of hadiths or a private collection) by automating the drawing of a tree, which enables the researcher to identify common links and determine the differences in the reports branches from it. 

## The Hadith Sankey Diagram ##

###### مخططات "سانكي Sanky" التي تعطي استعارة بصرية مناسبة للعديد من مهام تحليل الحديث. مخططات سانكي هي رسوم بيانية للمشجرات تجسد بصريا الروابط بين العناصر وإضافة قيمة وزنية للروابط. مخططات سانكي مناسبة لتصوير "تدفقات" نقل الرواية في شجرة الأسانيد، حيث تمثل عناصر الشجرة الرواة ، وتمثل الروابط علاقة الرواية والتلقي بين الرواة. على سبيل المثال، تجسد روابط المدخلات للعنصر روابط التلاميذ عن الراوي في الشجرة ويقابلها روابط المخرجات التي تجسد روابط الراوي عن شيوخه.

![Sankey Diagram example](https://github.com/OmarShafie/hadith/blob/master/Sankey_example.png)

## The Narrator Grade Classification ##
###### يمكن تلوين عناصر المخطط لتعكس درجات الراوي  أمام اسمه، علما أن درجات الرواة المستخرجة من كتاب تقريب التهذيب لا تغني عن النظر في تراجمهم ولا يمكن الحكم على الحديث من خلالها وحسب، إلا أنها تعد مفاتيح تذكير لبداية النظر في أحوال الرواة وللإشارة إلى أي علامة واضحة على الضعف في إحدى طرق الإسناد.

![Narrator_Grades](https://github.com/OmarShafie/hadith/blob/master/Narrator_Grades.png)
![Sankey_Narrator_Grades](https://github.com/OmarShafie/hadith/blob/master/Sankey_Narrator_Grades.png)


## The Narrator Grade Classification ##
###### على غرار العناصر، يمكن تلوين الروابط وتجميعها لتلبي مختلف الاستخدامات والحاجات. فعلى سبيل المثال ، في الشكل 6 ، يمكن تلوين الروابط لعرض علاقات المسارات المختلفة واستمراريتها لتوضيح اضطراب الرواة من حيث الوقف والرفع. فمثلا، بمجرد النظر يمكن للباحث معرفة أن المسار ذو اللون البني وهي رواية عبدالرحمن بن زيد (وهو ضعيف) تفردت بالرفع.

![Sankey_Path_highlihgt](https://github.com/OmarShafie/hadith/blob/master/Sankey_Path_highlihgt.png)


## Multiple Matn Alignment ##
###### بناء مصفوفة مقارنة متعددة المتون آليا هو أحد أشكال مسألة محاذاة السلاسل المتعددة Multiple Sequence Alignment. استخدام خوارزميات البرمجة الديناميكية التقريبية Star Alignment Approximation using Dynamic Programming، والتي تعتمد مسافة التعديل وهي الحد الأدنى من التغييرات المطلوبة للانتقال من نص إلى آخر. النتيجة هي مصفوفة من الكلمات في مواقع توافقها بين المتون كما في الشكل:


![MMA_1](https://github.com/OmarShafie/hadith/blob/master/MMA_1.png)
###### يلي ذلك، اختيار الكلمة الأكثر شيوعا في كل موضع لتشكيل نص جديد ملفق من مجموع الروايات مع ترك فراغات للدلالة على الزيادات والتفردات، أما في باقي نصوص المقارنة يتم استبدال التوافق بالنقط للدلالة على التوافق (...) أو ( x ) للدلالة على الحذف أو الكلمة الأقل شيوعا للدلالة على المخالفة كما في الشكل
![MMA_2](https://github.com/OmarShafie/hadith/blob/master/MMA_2.png)
###### وأخيرا، يتم تلوين مواضع تفرد كل إسناد فرعي عن الأفرع التي تشترك معها في نفس المدار كما في الشكل

![MMA_3](https://github.com/OmarShafie/hadith/blob/master/MMA_3.png)
![MMA_4](https://github.com/OmarShafie/hadith/blob/master/MMA_4.png)


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

### If you used this tool, please cite my thesis:
Shafie, Omar Abdulfattah. KASHAF: A Knowledge-Graphs Approach Search-Engine for Hadith Analysis & Flow-Visualization. MS thesis. Hamad Bin Khalifa University (Qatar), 2021.

```
@mastersthesis{shafie2021kashaf,
  title={KASHAF: A Knowledge-Graphs Approach Search-Engine for Hadith Analysis \& Flow-Visualization},
  author={Shafie, Omar Abdulfattah},
  year={2021},
  school={Hamad Bin Khalifa University (Qatar)}
}
```
