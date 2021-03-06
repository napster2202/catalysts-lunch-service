var request = require('request');
var cheerio = require('cheerio');
var PDFParser = require('pdf2json');

module.exports = {

    intent: /.*gkk.*/i,
    menu: function(callback) {
        var url = 'http://www.caseli.at/content/download/1363/6617/file/Speiseplan_O%C3%96_GKK_Hauptstelle.pdf'

        var day = new Date().getDay();
        var result = "**GKK**\n\n";

        if (day < 1 || day > 5) {
            result += "No menu today."
            callback(result);
            return;
        }

        var pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));

        pdfParser.on("pdfParser_dataReady", pdfData => {
            //console.log(JSON.stringify(pdfData));
            //console.log(pdfData.formImage.Pages[0].Texts);

            var text = pdfData.formImage.Pages[0].Texts.reduce(function(a, b) {
                return a + b.R.reduce(function(a, b) {
                    return a + b.T;
                }, "");
            }, "");
            text = decodeURI(text);
            //console.log(text);

            var results = text.split(/(MONTAG|DIENSTAG|MITTWOCH|DONNERSTAG|FREITAG)/)

            //console.log(results);
            /*
                 0...empty
                 1...MONTAG
                 2...<monday menu>
                 3...DIENSTAG
                 4...<tuesday menu>
                 5...WEDNESDAY
                 6...<wednesday menu>
                 7...THURSDAY
                 8...<thursday menu>
                 9...FRIDAY
                 10..<friday menu>
                 
                 Monday  -> day==1 --> day+day==2 --> monday menu
                 Tuesday -> day==2 --> day+day==4 --> tuesday menu
                 */
            var index = day * 2;

            var menu = results[index].trim().replace(/Classic (I+)/g, "\n\nClassic $1\n\n").replace(/^, /g, "").replace("%2C", "");
            result += menu;
            callback(result);
        });

        var pdfPipe = request(url).pipe(pdfParser);
    }
}