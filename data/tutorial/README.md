how to use?

1) bash scrapy shell <website>

from scrapy.http import FormRequest
fetch(FormRequest.from_response(response, formdata={'__EVENTTARGET': 'ctl00$ContentPlaceHolder1$ucViewHadith$btnDisplayByHadithNum','__EVENTARGUMENT': "",'ctl00$ContentPlaceHolder1$ucViewHadith$txtHadithNumber': '1407'}))
request=FormRequest.from_response(response,formdata={'__EVENTTARGET': 'ctl00$ContentPlaceHolder1$ucViewHadith$lnkbtnTakhreeg'})
fetch(request) 

2) find data using CSS Selector
XMLhadith = response.css('input#ContentPlaceHolder1_AsnadTreeServiceUC1_hfDocumentXML').get()

title = response.css('span#ContentPlaceHolder1_ucViewHadith_lblTocPath::text').get()

hadithNum = response.css('span#TarqeemHarf::text').get()

mainID = response.css('input#ContentPlaceHolder1_TakhreegServiceUC1_hidHadithMainID').attrib['value'] 

3) use regular expressions
asaneed = response.css('a.tree').re(r"'s.*5495")

4) figure for ech bit then generalize over a loop
for quote in response.css("div.quote"):
...     text = quote.css("span.text::text").get()
...     author = quote.css("small.author::text").get()
...     tags = quote.css("div.tags a.tag::text").getall()

5) use spider
def parse(self, response):
        for quote in response.css('div.quote'):
            yield {
                'text': quote.css('span.text::text').get(),
                'author': quote.css('small.author::text').get(),
                'tags': quote.css('div.tags a.tag::text').getall(),
            }

7) follow urls

request = FormRequest.from_response(
            response,
            formdata={'ctl00$ContentPlaceHolder1$ucViewHadith$txtHadithNumber': int(hadithNum)+1},)
fetch(request)

def parse(self,response):
	...
		next_page = response.css('li.next a::attr(href)').get()
		if next_page is not None:
			# yield scrapy.follow(next_page, callback=self.parse) 
			#or
		    next_page = response.urljoin(next_page)
		    yield scrapy.Request(next_page, callback=self.parse) 


6) Output to json:
scrapy crawl <spider.name> -o quotes.json
scrapy crawl <spider.name> -o quotes.jl
rm takhreeg.csv; scrapy crawl spidytakhreeg -o takhreeg.csv

