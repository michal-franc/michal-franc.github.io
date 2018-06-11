$(function () {

    $('.tofigure').each(function() {
        $(this).replaceWith($('<figure class="img-with-caption tofigure">' + this.innerHTML + '</figure>'));
    });
    $('.tofigure').children('img').each(function() {
        var caption;
        caption = $(this).attr('title');
        $(this).after('<figcaption class="caption">' + caption + '</figcaption>');
    });

    $('.footnote').each(function() {
      var $this = $(this);

      var refid = $this.attr('href').substr(1);
      var footnote = $("[id='" + refid + "']").children(0).children(1)

      var href = footnote.attr('href');
      var text = footnote.text();

      $this.hover(function() {
            $this.css('cursor','pointer').attr('title', text);
      }, function() {
            $this.css('cursor','auto');
      });

      $this.attr('href', href);
    });
})
