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
      var refid = $(this).attr('href').substr(1);
      var href = $("[id='" + refid + "']").children(0).children(1).attr('href');
      $(this).attr('href', href);
    });
})
