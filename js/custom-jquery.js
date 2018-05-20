$(function () {

    $('.tofigure').each(function() {
        $(this).replaceWith($('<figure class="img-with-caption tofigure">' + this.innerHTML + '</figure>'));
    });
    $('.tofigure').children('img').each(function() {
        var caption;
        caption = $(this).attr('title');
        $(this).after('<figcaption class="caption">' + caption + '</figcaption>');
    });
})
