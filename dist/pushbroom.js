/*! pushbroom.c0 0.0.1 */
!async function(e,t,n){n="{"===n[0]?"analytics.pushbroom.co":n;const o=e.navigator;if(o.userAgent.search(/(bot|spider|crawl)/gi)>-1)return;const r="disablePushbroom",s="addEventListener",a="/cache?",i="pushState",c="sendBeacon",l="timing",d="localStorage",u="Pushbroom is",h=["unblocked","blocked"],p="data-pushbroom-event",m=console.log,v=t=>{let n=parseFloat(e[d].getItem(h[1]));return n&&t&&m(u+" blocked on "+f.hostname+" - Use pushbroom.blockMe(0) to unblock"),n},b=(e,t)=>{if(v(t))return new Promise((e=>e()));const n=new XMLHttpRequest;return new Promise(((t,o)=>{n.onreadystatechange=()=>{4===n.readyState&&t(parseFloat(n.response))},n.open("GET",e),n.send()}))},f=e.location,y=e.performance,g=e.screen,w="https://"+n,E=()=>Date.now(),k=()=>A+=E()-$,S=e=>Object.keys(e).map((t=>`${t}=${encodeURIComponent(e[t])}`)).join("&"),P=(e,t)=>{if(!v())return o[c]?void o[c](e,JSON.stringify(t)):b(`${e}?${S(t)}`)};let L,$,A,I;const M=async()=>{if(e[r])return void delete e[r];delete e[r],L=E(),$=L,A=0;let n=y&&y[l]?y[l].domContentLoadedEventEnd-y[l].navigationStart:0;I={r:t.referrer,w:g.width,s:0,t:n>0?n:0,p:f.href};let o=f.hostname,s=f.pathname;await Promise.all([b(w+a+o).then((e=>{I.u=e})),b(w+a+o+s).then((e=>{I.up=e}))]),b(w+"/hello?"+S(I),!0)};t[s]("visibilitychange",(()=>{t.hidden?k():$=E()}));const j=async()=>{e[r]||(!t.hidden&&k(),await P(w+"/duration",{d:A,n:L,p:f.href}))};e[s]("beforeunload",j);e.history[i]=function(t){let n=history[t];return function(){let o,r=n.apply(this,arguments);return"function"==typeof Event?o=new Event(t):(o=doc.createEvent("Event"),o.initEvent(t,!0,!0)),o.arguments=arguments,e.dispatchEvent(o),r}}(i),e[s](i,(()=>{j(),M()}));let q=e=>pushbroom.event(e.target.getAttribute(p));e.pushbroom={async event(e,t){k();const n={e:e,p:f.href,d:A,n:L};await P(w+"/event",n),t&&t()},initEvents(){t.querySelectorAll("["+p+"]").forEach((e=>{e.removeEventListener("click",q),e[s]("click",q)}))},blockMe(t){t=t?1:0,e[d].setItem(h[1],t),m(u+" now "+h[t]+" on "+f.hostname)}},M(),pushbroom.initEvents()}(window,document,"{{.Host}}");