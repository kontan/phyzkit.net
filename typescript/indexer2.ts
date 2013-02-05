/// <reference path="jquery.d.ts" />
$(()=>{
	var ol = $('<ul class="chapters nav nav-list bs-docs-sidenav" />');
	$.each($("section"), (i, section)=>{
		var h2 = $(section).children("h2");
		var chapter_title = h2.text();
		var chapter_index = i + 1;
		h2.text(chapter_index + ". " + chapter_title);
		var chapter_anchor = "chapter" + chapter_index;
		var li = $('<li class="chapter"/>').append($("<a></a>").attr("href", "#" + chapter_anchor).text(chapter_index + '. ' + chapter_title));
		ol.append(li);
		$(h2).before($("<a></a>").attr("name", chapter_anchor));

		$.each($(section).children("h3"), (k, h3)=>{
			var section_title = $(h3).text();
			var section_index = k + 1;
			$(h3).text(section_index + ". " + section_title);
			var section_anchor = chapter_anchor + "_section" + section_index;
			var a = $("<a></a>").attr("href", "#" + section_anchor).text(
				chapter_index + '-' + section_index + '. ' + section_title);
			var sli = $('<li class="section"/>').append(a);
			ol.append(sli);
			$(h3).before($("<a></a>").attr("name", section_anchor));			
		});
	});

	$('div.menu').append(ol);
});