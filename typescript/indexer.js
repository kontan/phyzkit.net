$(function () {
    var ol = $('<ul class="nav nav-list bs-docs-sidenav" />');
    var chapter_index = 0;
    var section_index = 0;
    var chapter_anchor = '';
    $('.markdown').children().each(function () {
        var _this = $(this);
        switch(this.nodeName.toLowerCase()) {
            case 'h2':
                chapter_index++;
                section_index = 0;
                var chapter_title = _this.text();
                chapter_anchor = "chapter" + chapter_index;
                var link = $('<a/>');
                link.attr('id', chapter_anchor);
                link.attr('href', '#' + chapter_anchor);
                link.text(chapter_index + ". " + chapter_title);
                _this.html('');
                _this.append(link);
                var item = $("<a></a>");
                item.attr("href", "#" + chapter_anchor);
                item.text(chapter_index + '. ' + chapter_title);
                var li = $('<li class="chapter"/>');
                li.append(item);
                ol.append(li);
                break;
            case 'h3':
                section_index++;
                var section_title = _this.text();
                var section_anchor = chapter_anchor + "_section" + section_index;
                var link = $('<a/>');
                link.attr('id', section_anchor);
                link.attr('href', '#' + section_anchor);
                link.text(section_index + ". " + section_title);
                _this.html('');
                _this.append(link);
                var a = $("<a/>");
                a.attr("href", "#" + section_anchor);
                a.text(chapter_index + '-' + section_index + '. ' + section_title);
                var sli = $('<li class="section"/>').append(a);
                ol.append(sli);
                break;
            default:
                break;
        }
        return true;
    });
    $('div.menu').append(ol);
});
