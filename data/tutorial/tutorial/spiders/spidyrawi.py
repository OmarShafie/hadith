import scrapy
page = 1
startpage = 1070
class SpidyQuotesViewStateSpider(scrapy.Spider):
    name = 'spidyrawi'
    start_urls = ['https://sunnah.alifta.net/ViewRwah.aspx']
    download_delay = 1

    def parse(self, response):
        global page
        if page < startpage:
            page+=10
            yield scrapy.FormRequest.from_response(
                    response,
                    formdata={
                        '__EVENTTARGET': 'ctl00$ContentPlaceHolder1$ViewRwahUC1$gvRwah',
                        '__EVENTARGUMENT': "Page$"+str(page),
                    },
                    dont_click = True,
                    callback=self.parse,
                )
        else:
            rawi_index = response.css('input#ContentPlaceHolder1_ViewRwahUC1_UCViewRawyServices1_hidRawyID::attr(value)').get()
            name = response.css('span#ContentPlaceHolder1_ViewRwahUC1_UCViewRawyServices1_ViewRawyInfoCardUC1_dlvRawyInfoCard_lblName::text').get()
            grade = response.css('span#ContentPlaceHolder1_ViewRwahUC1_UCViewRawyServices1_ViewRawyInfoCardUC1_dlvRawyInfoCard_lblMartabaIbnHajar::text').get()
            row = int(response.css('tr.select').re(r"Select.*")[0][7])
            yield {
                    'rawi_index': rawi_index,
                    'name': name,
                    'grade': grade,
                }
            if row < 8:
                yield scrapy.FormRequest.from_response(
                    response,
                    formdata={
                        '__EVENTTARGET': 'ctl00$ContentPlaceHolder1$ViewRwahUC1$gvRwah',
                        '__EVENTARGUMENT': "Select$"+str(row+1),
                    },
                    dont_click = True,
                    callback=self.parse,
                )
            if row ==7:

                print("\nFinished Page :",page)
                page+=1
                yield scrapy.FormRequest.from_response(
                        response,
                        formdata={
                            '__EVENTTARGET': 'ctl00$ContentPlaceHolder1$ViewRwahUC1$gvRwah',
                            '__EVENTARGUMENT': "Page$"+str(page),
                        },
                        dont_click = True,
                        callback=self.parse,
                    )