$(function () {
    var ol = $('<ol class="chapters" />');
    $.each($("section"), function (i, section) {
        var h2 = $(section).children("h2");
        var chapter_title = h2.text();
        var chapter_index = i + 1;
        h2.text(chapter_index + ". " + chapter_title);
        var chapter_anchor = "chapter" + chapter_index;
        var li = $('<li class="chapter"/>').append($("<a></a>").attr("href", "#" + chapter_anchor).text(chapter_title));
        ol.append(li);
        $(h2).wrap($("<a></a>").attr("name", chapter_anchor));
        var section_ol = $('<ol class="sections" />');
        $.each($(section).children("h3"), function (k, h3) {
            var section_title = $(h3).text();
            var section_index = k + 1;
            $(h3).text(section_index + ". " + section_title);
            var sli = $('<li class="section"/>').text(section_title);
            var section_anchor = chapter_anchor + "_section" + section_index;
            var a = $("<a></a>").attr("href", "#" + section_anchor).append(sli);
            section_ol.append(a);
            ol.append(section_ol);
            $(h3).wrap($("<a></a>").attr("name", section_anchor));
        });
    });
    $('div.menu').append(ol);
});
//@ sourceMappingURL=indexer.js.map
