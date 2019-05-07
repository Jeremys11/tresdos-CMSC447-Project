import jqueryI18next from "jquery-i18next";
import i18next from "i18next";
import XHR from "i18next-xhr-backend";

$(document).ready(function(){
    jqueryI18next.init(i18next, $, {
        tName: 't',
        i18nName: 'i18n',
        handleName: 'localize',
        selectorAttr: 'data-i18n',
        targetAttr: 'i18n-target',
        optionsAttr: 'i18n-options',
        useOptionsAttr: false,
        parseDefaultValueFromContent: true});

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
        function(err,t){
            if(err) return console.error(err)
            $(document).localize();
        });

        $('.langSelector').change(function() {
            var lang = $(this).val();
            i18next.init({
                lng : lang
            }, function (t){
                $(document).localize();
            })
        })
    });