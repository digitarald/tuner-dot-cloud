/* global ga */
let ga;
if (process.env.NODE_ENV === 'production') {
  ga = window.ga = window.ga || function() {
    (ga.q = ga.q || []).push(arguments);
  };
  ga.l = Date.now();

  ga('create', 'UA-74996908-1', 'auto');
  if (window.matchMedia('(display-mode: standalone)').matches) {
    ga('set', 'campaignSource', 'web-app-manifest');
  }
  ga('send', 'pageview');
} else {
  ga = function() {};
}
export default ga;
