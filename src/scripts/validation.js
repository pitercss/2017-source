/**
 * As mobile safari currently does not support interactive form validation,
 * do it manually via form.checkValidity().
 *
 * See: https://github.com/pitercss/pitercss.com/issues/14
 */

if (isMobileSafari()) {
    document.addEventListener('DOMContentLoaded', addValidation);
}

function addValidation() {
    var form = document.querySelector('form.Footer-Subscribe');
    if (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                form.EMAIL.focus();
            }
        });
    }
}

// See: http://stackoverflow.com/questions/3007480/determine-if-user-navigated-from-mobile-safari/29696509#29696509
function isMobileSafari() {
    var ua = window.navigator.userAgent;
    var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    var webkit = !!ua.match(/WebKit/i);
    return iOS && webkit && !ua.match(/CriOS/i);
}
