import jqueryI18next from "jquery-i18next";
import i18next from "i18next";
import XHR from "i18next-xhr-backend";

//on page load
$(document).ready(function(){
    //initialization code taken from https://github.com/i18next/jquery-i18next/blob/master/README.md
    jqueryI18next.init(i18next, $, {
        tName: 't',
        i18nName: 'i18n',
        handleName: 'localize',
        selectorAttr: 'data-i18n',
        targetAttr: 'i18n-target',
        optionsAttr: 'i18n-options',
        useOptionsAttr: false,
        parseDefaultValueFromContent: true});

        //initialize our document language to english. Get translations from 'loadPath'
        i18next
        .use(XHR)
        .init({
            "lng" : 'en',
            "debug": true,
            "fallbackLng" : 'en',
            backend: {
                loadPath: 'locales/{{lng}}/{{ns}}.json'
            }
        },
        //throw error if initialization fails
        function(err,t){
            if(err) return console.error(err)
            $(document).localize();
        });

        //langSelector is our dropdown box
        $('.langSelector').change(function() {
            //get the value from our dropdown and store it into lang
            var lang = $(this).val();
            //change language to whatever the value is
            i18next.init({
                lng : lang
            }, function (t){
                //translate document using language
                $(document).localize();
            })
        })
    });