import scrapy

chunkstart = 0
class SpidyQuotesViewStateSpider(scrapy.Spider):
    name = 'spidytakhreeg'
    start_urls = ['https://sunnah.alifta.net/ViewHadith.aspx?BookID=1&Method=2&MainID=5&HadithType=Matn&TarqeemType=TarqeemHarf']

    def parse(self, response):
        yield scrapy.FormRequest.from_response(
            response,
            formdata={'__EVENTTARGET': 'ctl00$ContentPlaceHolder1$ucViewHadith$lnkbtnTakhreeg'},
            callback=self.parse_hadith,
        )

    def parse_hadith(self, response):
        hadithNum = int(response.css('span#TarqeemHarf::text').get())
        if hadithNum > chunkstart:
            if hadithNum < 7285:
                yield {
                        'hadithNum': hadithNum,
                        'mainID': response.css('input#ContentPlaceHolder1_ucViewHadith_hidMainID').attrib['value'],
                        'takhreegIDs': list(map(lambda x:x[19:-2], response.css('a.HighlightWithLink').re(r'ViewServiceContent.*"') ))  ,
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
