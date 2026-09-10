'use strict';
// Keep local previews out of production visitor statistics.
if (location.hostname === 'seeya-fanpage.com' || location.hostname === 'www.seeya-fanpage.com') {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-0S36GKBD8C');
}
