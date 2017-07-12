/* ========= INFORMATION ============================
 
 - document:  Slick Modals - HTML5 and CSS3 powered modal popups
 - author:    Capelle @ Codecanyon
 - profile:   http://codecanyon.net/user/Capelle
 - version:   3.0
 
 ==================================================== */

 (function ($) {
    $.fn.slickModals = function (options) {

        // Settings
        var settings = $.extend({

            // Functionality
            popupType: null,
            delayTime: null,
            exitTopDistance: null,
            scrollTopDistance: null,
            setCookie: false,
            cookieDays: null,
            cookieTriggerClass: "setSlickCookie",
            cookieName: "slickCookie",

            // Overlay options
            overlayBg: false,
            overlayBgColor: null,
            overlayTransition: null,
            overlayTransitionSpeed: null,

            // Background effects
            bgEffect: null,
            blurBgRadius: null,
            scaleBgValue: null,

            // Window options
            windowWidth: null,
            windowHeight: null,
            windowLocation: null,
            windowTransition: null,
            windowTransitionSpeed: null,
            windowTransitionEffect: null,
            windowShadowOffsetX: null,
            windowShadowOffsetY: null,
            windowShadowBlurRadius: null,
            windowShadowSpreadRadius: null,
            windowShadowColor: null,
            windowBackground: null,
            windowRadius: null,
            windowMargin: null,
            windowPadding: null,

            // Close and open button
            closeButton: null,
            reopenClass: null,

        }, options);

        return this.each(function () {
            var self = this;

            // Popup types
            function showModal() {
                $(self).addClass("isActive");
            };
            function hideModal() {
                $(self).removeClass("isActive");
            };
            if (settings.popupType === "delayed") {
                if (document.cookie.indexOf(settings.cookieName) < 0) {
                    setTimeout(showModal, settings.delayTime + 200);
                    setTimeout(beginBgEffects, settings.delayTime);
                }
            }
            if (settings.popupType === "exit") {
                $(document).mousemove(function(e) {
                    if ((document.cookie.indexOf(settings.cookieName) < 0) && (e.clientY <= settings.exitTopDistance)) {
                        showModal();
                        beginBgEffects();
                    }
                });
            }
            if (settings.popupType === "scrolled") {
                $(document).scroll(function() {
                    var y = $(this).scrollTop();
                    if ((document.cookie.indexOf(settings.cookieName) < 0) && (y > settings.scrollTopDistance)) {
                        showModal();
                        beginBgEffects();
                    }
                });
            }
            if (document.cookie.indexOf(settings.cookieName) >= 0) {
                hideModal();
                endBgEffects();
            }

            // Background Effects
            var page = "body > *";
            function beginBgEffects() {
                function beginBluring() {
                    $(page).not(".slickModal").addClass("blurred").css({
                        "-webkit-filter" : "blur" + "(" + settings.blurBgRadius + ")",
                        "-moz-filter" : "blur" + "(" + settings.blurBgRadius + ")",
                        "-ms-filter" : "blur" + "(" + settings.blurBgRadius + ")",
                        "filter" : "blur" + "(" + settings.blurBgRadius + ")",
                    });
                };
                function beginScaling() {
                    $(page).not(".slickModal").addClass("scaled").css({
                        "-webkit-transform" : "scale" + "(" + settings.scaleBgValue + ")",
                        "-moz-transform" : "scale" + "(" + settings.scaleBgValue + ")",
                        "-ms-transform" : "scale" + "(" + settings.scaleBgValue + ")",
                        "transform" : "scale" + "(" + settings.scaleBgValue + ")",
                    });
                };
                if (settings.bgEffect === "blur") {
                    beginBluring()
                };
                if (settings.bgEffect === "scale") {
                    beginScaling()
                };
                if (settings.bgEffect === "both") {
                    beginBluring();
                    beginScaling();
                };
                $(page).not(".slickModal").css({
                   "-webkit-transition-duration" : settings.overlayTransitionSpeed + "s",
                   "-moz-transition-duration" : settings.overlayTransitionSpeed + "s",
                   "-ms-transition-duration" : settings.overlayTransitionSpeed + "s",
                   "transition-duration" : settings.overlayTransitionSpeed + "s",
                });
            };
            function endBgEffects() { 
                $(page).removeClass("blurred scaled").css({
                    "-webkit-transform" : "",
                    "-moz-transform" : "",
                    "-ms-transform" : "",
                    "transform" : "",
                    "-webkit-filter" : "",
                    "-moz-filter" : "",
                    "-ms-filter" : "",
                    "filter" : "",
                });
            };

            // Overlay styling
            function showOverlay() {
                $(self).prepend("<div class='overlay closeModal'>" + "</div>");
                $(self).children(".overlay").addClass(settings.overlayTransition + " " + settings.cookieTriggerClass).css({
                    "background" : settings.overlayBgColor,
                    "-webkit-transition-duration" : settings.overlayTransitionSpeed + "s",
                    "-moz-transition-duration" : settings.overlayTransitionSpeed + "s",
                    "-ms-transition-duration" : settings.overlayTransitionSpeed + "s",
                    "transition-duration" : settings.overlayTransitionSpeed + "s",
                });
            };
            if (settings.overlayBg === true) {
                showOverlay();
            };

            // Add close button
            $(self).children(".window").prepend("<div class='close closeModal'>" + "</div>");
            $(self).find(".window").children(".closeModal").addClass(settings.closeButton + " " + settings.cookieTriggerClass);

            // Window styling
            function windowStyling() {
                $(self).children(".window").addClass(settings.windowLocation + " " + settings.windowTransitionEffect + " " + settings.windowTransition).css({
                    "width" : settings.windowWidth,
                    "height" : settings.windowHeight,
                    "box-shadow" : settings.windowShadowOffsetX + " " + settings.windowShadowOffsetY + " " + settings.windowShadowBlurRadius + " " + settings.windowShadowSpreadRadius + " " + settings.windowShadowColor,
                    "background" : settings.windowBackground,
                    "border-radius" : settings.windowRadius,
                    "margin" : settings.windowMargin,
                    "padding" : settings.windowPadding,
                    "-webkit-transition-duration" : settings.windowTransitionSpeed + "s",
                    "-moz-transition-duration" : settings.windowTransitionSpeed + "s",
                    "-ms-transition-duration" : settings.windowTransitionSpeed + "s",
                    "transition-duration" : settings.windowTransitionSpeed + "s",
                });
                if (settings.windowLocation === "center") {
                    $(self).children(".window").css({
                        "margin" : "auto",
                    });
                };
            };
            windowStyling();

            // Set a cookie to hide modal
            if (settings.setCookie === true) {
                function SlickCookie() {
                    days = settings.cookieDays;
                    CookieDate = new Date();
                    if (days > 0) {
                        CookieDate.setTime(CookieDate.getTime() + (days * 24 * 60 * 60 * 1000));
                        document.cookie = settings.cookieName + "=true; expires=" + CookieDate.toGMTString() + "; path=/";
                    }
                    if (days === 0) {
                        document.cookie = settings.cookieName + "=true; path=/";
                    }
                }
                var cookie = document.cookie.split(";").map(function (x) {
                    return x.trim().split("=");
                }).filter(function (x) {
                    return x[0] === settings.cookieName;
                }).pop();
                $("." + settings.cookieTriggerClass).on("click", function () {
                    SlickCookie();
                });
            };

            // Close modal
            $(".closeModal").on("click", function () {
                hideModal();
                endBgEffects();
            });

            // Open modal after closing
            $("." + settings.reopenClass).on("click", function () {
                showModal();
                beginBgEffects();
            });

        });
    }
}(jQuery));

// Plugin invoke
$(document).ready(function () {
    $("#popup-1").slickModals({
        // Functionality
        popupType: "delayed",
        delayTime: 1000,
        exitTopDistance: 40,
        scrollTopDistance: 400,
        setCookie: true,
        cookieDays: 0,
        cookieTriggerClass: "setCookie-1",
        cookieName: "slickModal-1",

        // Overlay options
        overlayBg: true,
        overlayBgColor: "rgba(0,0,0,0.85)",
        overlayTransition: "ease",
        overlayTransitionSpeed: "0.4",

        // Background effects
        bgEffect: "scale",
        blurBgRadius: "2px",
        scaleBgValue: "0.9",

        // Window options
        windowWidth: "500px",
        windowHeight: "300px",
        windowLocation: "bottomRight",
        windowTransition: "ease",
        windowTransitionSpeed: "0.4",
        windowTransitionEffect: "zoomIn",
        windowShadowOffsetX: "0",
        windowShadowOffsetY: "0",
        windowShadowBlurRadius: "20px",
        windowShadowSpreadRadius: "0",
        windowShadowColor: "rgba(0,0,0,0.3)",
        windowBackground: "rgba(255,255,255,1)",
        windowRadius: "12px",
        windowMargin: "30px",
        windowPadding: "30px",

        // Close and reopen button
        closeButton: "icon",
        reopenClass: "openSlickModal-1",
    });
});
