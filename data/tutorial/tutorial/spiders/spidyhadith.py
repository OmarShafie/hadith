import scrapy

chunkstart = 3122
class SpidyQuotesViewStateSpider(scrapy.Spider):
    name = 'spidyhadith'
    start_urls = ['https://sunnah.alifta.net/ViewHadith.aspx?BookID=1&Method=2&MainID=5&HadithType=Matn&TarqeemType=TarqeemHarf']

    def parse(self, response):
        yield scrapy.FormRequest.from_response(
            response,
            formdata={'__EVENTTARGET': 'ctl00$ContentPlaceHolder1$ucViewHadith$lnkbtnAsnad'},
            callback=self.parse_hadith,
        )

    def parse_hadith(self, response):
        hadithNum = int(response.css('span#TarqeemHarf::text').get())
        if hadithNum > chunkstart:
            if hadithNum < 7564:
                yield {
                        'hadithNum': hadithNum,
                        'title': response.css('span#ContentPlaceHolder1_ucViewHadith_lblTocPath::text').get(),
                        'hadithTxt': response.css('span#ContentPlaceHolder1_ucViewHadith_lblContent').get(),
                        'hadithXML': response.css('input#ContentPlaceHolder1_AsnadTreeServiceUC1_hfDocumentXML').get(),
                        'asaneed': response.css('a.tree').re(r"'s.*5495"),
                    }
                yield scrapy.FormRequest.from_response(
                    response,
                    formdata={
                        '__EVENTTARGET': 'ctl00$ContentPlaceHolder1$ucViewHadith$btnDisplayByHadithNum',
                        '__EVENTARGUMENT': "",
                        'ctl00$ContentPlaceHolder1$ucViewHadith$txtHadithNumber': str(hadithNum+1),
                    },
                    callback=self.parse_hadith,
                )
        else:
            yield scrapy.FormRequest.from_response(
                    response,
                    formdata={
                        '__EVENTTARGET': 'ctl00$ContentPlaceHolder1$ucViewHadith$btnDisplayByHadithNum',
                        '__EVENTARGUMENT': "",
                        'ctl00$ContentPlaceHolder1$ucViewHadith$txtHadithNumber': str(chunkstart+1),
                    },
                    callback=self.parse_hadith,
                )
