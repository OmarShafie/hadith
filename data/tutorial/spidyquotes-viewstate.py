import scrapy
class SpidyQuotesViewStateSpider(scrapy.Spider):
    name = 'spidyquotes'
    start_urls = ['http://quotes.toscrape.com/search.aspx']
    download_delay = 1.5

    def parse(self, response):
        for author in response.css('select#author > option ::attr(value)').extract():
            yield scrapy.FormRequest(
                'http://quotes.toscrape.com/filter.aspx',
                formdata={
                    'author': author,
                    '__VIEWSTATE': response.css('input#__VIEWSTATE::attr(value)').extract_first()
                },
                callback=self.parse_tags
            )

    def parse_tags(self, response):
        for tag in response.css('select#tag > option ::attr(value)').extract():
            yield scrapy.FormRequest(
                'http://quotes.toscrape.com/filter.aspx',
                formdata={
                    'author': response.css(
                        'select#author > option[selected] ::attr(value)'
                    ).extract_first(),
                    'tag': tag,
                    '__VIEWSTATE': response.css('input#__VIEWSTATE::attr(value)').extract_first()
                },
                callback=self.parse_results,
            )

    def parse_tags_simple(self, response):
        for tag in response.css('select#tag > option ::attr(value)').extract():
            yield scrapy.FormRequest.from_response(
                response,
                formdata={'tag': tag},
                callback=self.parse_results,
            )

    def parse_results(self, response):
        for quote in response.css("div.quote"):
            yield {
                'quote': quote.css('span.content ::text').extract_first(),
                'author': quote.css('span.author ::text').extract_first(),
                'tag': quote.css('span.tag ::text').extract_first(),
            }


