/* ============================================================
   QUIZ FUNNEL JS — Julie Cosmétique — QUIZ 2 (Variante)
   Fichier : quiz-funnel-2.js (Shopify Assets)
   ============================================================ */

/* ============================================================
   TRACKING CONFIG
   ============================================================ */
var QUIZ_ID = 'quiz_2';
var QUIZ_NAME = 'Quiz Variante';
var TRACKING_URL = 'https://script.google.com/macros/s/AKfycbw2_CMrfFuLkd5mAPDTgqdHEU488B5sF0NXnI62bXSpcMG0_trHcj0vEUx2UnPHigeL/exec';

var sessionId = (function() {
  var id = sessionStorage.getItem('quiz2_sid');
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('quiz2_sid', id);
  }
  return id;
})();

var QUESTION_MAP = {
  1: 'Âge',
  2: 'Préoccupation peau',
  3: 'Zones à effacer',
  4: 'Sévérité rides',
  6: 'Exposition soleil',
  7: 'Heures de sommeil',
  8: 'Niveau de stress',
  9: 'Carnation',
  10: 'Peau sensible',
  13: 'Solutions déjà essayées',
  14: 'Expérience produits',
  16: 'Traitements professionnels',
  17: 'Routine actuelle'
};

function trackAnswer(step, answer) {
  if (!TRACKING_URL || TRACKING_URL === 'COLLE_TON_URL_APPS_SCRIPT_ICI') return;
  var payload = {
    quiz_id: QUIZ_ID,
    session_id: sessionId,
    step: step,
    question: QUESTION_MAP[step] || 'Étape ' + step,
    answer: Array.isArray(answer) ? answer.join(', ') : String(answer),
    user_agent: navigator.userAgent
  };
  try {
    navigator.sendBeacon(TRACKING_URL, JSON.stringify(payload));
  } catch (e) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', TRACKING_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(payload));
  }
}

/* ============================================================
   CORE QUIZ LOGIC
   ============================================================ */
var TOTAL_STEPS=24, currentStep=1, stepHistory=[1], answers={}, multiSelections={};

function updateProgressBar(step) {
  var bar = document.getElementById('progressBar');
  if (!bar) return;
  var pct = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);
  bar.style.width = pct + '%';
}

function goToStep(step, addToHistory) {
  /* Track multi-select answers when clicking Continue */
  var prevStep = currentStep;
  if (multiSelections[prevStep] && multiSelections[prevStep].length > 0 && QUESTION_MAP[prevStep]) {
    trackAnswer(prevStep, multiSelections[prevStep]);
  }

  var cur = document.querySelector('.quiz-step.active');
  if (cur) cur.classList.remove('active');
  currentStep = step;
  var next = document.querySelector('[data-step="'+step+'"]');
  if (next) { void next.offsetWidth; next.classList.add('active'); }
  updateProgressBar(step);
  window.scrollTo({top:0,behavior:'smooth'});
  if (addToHistory !== false) { stepHistory.push(step); history.pushState({step:step},'','#step-'+step); }
  if (step===11) startProfileLoading();
  if (step===12) setTimeout(lvlAnimate,400);
  if (step===23) updateResultsPage();
  if (step===24) startCircleRedirect();
}

window.addEventListener('popstate',function(){
  if(stepHistory.length>1){stepHistory.pop();goToStep(stepHistory[stepHistory.length-1],false);}
});

function selectSingle(step,value){
  answers[step]=value;
  trackAnswer(step, value);
  var el=document.querySelector('[data-step="'+step+'"]');
  el.querySelectorAll('.option-btn').forEach(function(b){b.classList.remove('selected');});
  event.currentTarget.classList.add('selected');
  setTimeout(function(){goToStep(step+1);},350);
}

function toggleMulti(btn,step,value){
  if(!multiSelections[step])multiSelections[step]=[];
  btn.classList.toggle('selected');
  var i=multiSelections[step].indexOf(value);
  if(i>-1)multiSelections[step].splice(i,1);else multiSelections[step].push(value);
  answers[step]=multiSelections[step];
}

function toggleImageOption(el,step,value){
  if(!multiSelections[step])multiSelections[step]=[];
  el.classList.toggle('selected');
  var i=multiSelections[step].indexOf(value);
  if(i>-1)multiSelections[step].splice(i,1);else multiSelections[step].push(value);
  answers[step]=multiSelections[step];
}

function toggleZone(el,step,value){
  if(!multiSelections[step])multiSelections[step]=[];
  el.classList.toggle('selected');
  var i=multiSelections[step].indexOf(value);
  if(i>-1)multiSelections[step].splice(i,1);else multiSelections[step].push(value);
  answers[step]=multiSelections[step];
}

function toggleSeverity(el,step,value){
  if(!multiSelections[step])multiSelections[step]=[];
  el.classList.toggle('selected');
  var i=multiSelections[step].indexOf(value);
  if(i>-1)multiSelections[step].splice(i,1);else multiSelections[step].push(value);
  answers[step]=multiSelections[step];
}

function startLoading(step,dur,next){
  var s=document.getElementById('spinner'+step),c=document.getElementById('check'+step);
  if(s)s.style.display='block';if(c){c.classList.remove('visible');c.style.display='none';}
  setTimeout(function(){
    if(s)s.style.display='none';if(c)c.style.display='flex';
    setTimeout(function(){if(c)c.classList.add('visible');},50);
    setTimeout(function(){goToStep(next);},800);
  },dur);
}

function startLoadingRedirect(step,dur){
  var s=document.getElementById('spinner'+step),c=document.getElementById('check'+step);
  if(s)s.style.display='block';if(c){c.classList.remove('visible');c.style.display='none';}
  setTimeout(function(){
    if(s)s.style.display='none';if(c)c.style.display='flex';
    setTimeout(function(){if(c)c.classList.add('visible');},50);
    setTimeout(function(){window.location.href='https://juliecosmetique.fr/products/serum-liftant-julie';},800);
  },dur);
}

/* ============================================================
   PROFILE LOADING (étape 11) — barre + 3 points progressifs
   ============================================================ */
function startProfileLoading() {
  var bar = document.getElementById('profileLoadingBar');
  var s1 = document.getElementById('pls1');
  var s2 = document.getElementById('pls2');
  var s3 = document.getElementById('pls3');
  // Reset + force reflow pour restart l'animation CSS
  if (bar) {
    bar.classList.remove('animating');
    void bar.offsetWidth;
    bar.classList.add('animating');
  }
  if (s1) { s1.classList.remove('visible'); setTimeout(function() { s1.classList.add('visible'); }, 300); }
  if (s2) { s2.classList.remove('visible'); setTimeout(function() { s2.classList.add('visible'); }, 1400); }
  if (s3) { s3.classList.remove('visible'); setTimeout(function() { s3.classList.add('visible'); }, 2600); }
  setTimeout(function() { goToStep(12); }, 3500);
}

/* ============================================================
   CIRCLE PROGRESS + REDIRECT (étape 24) — 3.5s ease-in-out
   ============================================================ */
function startCircleRedirect() {
  var circle = document.getElementById('circleProgress');
  var txt = document.getElementById('circleText');
  if (!circle || !txt) return;
  var totalDash = 515, dur = 3500, startTime = null;
  function ease(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2) / 2; }
  function frame(ts) {
    if (!startTime) startTime = ts;
    var p = Math.min((ts - startTime) / dur, 1);
    var e = ease(p);
    var pct = Math.round(e * 100);
    circle.style.strokeDashoffset = totalDash - (totalDash * e);
    txt.textContent = pct + '%';
    if (p < 1) requestAnimationFrame(frame);
    else setTimeout(function() {
      window.location.href = 'https://juliecosmetique.fr/products/serum-liftant-julie';
    }, 5000);
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   LEVEL BAR (étape 12)
   ============================================================ */
var lvlTarget = 82;
var lvlDuration = 3500;
var lvlStarted = false;

function lvlEase(t) { return 1 - Math.pow(1 - t, 3); }

function lvlAnimate() {
  if (lvlStarted) return;
  var dot = document.getElementById('lvlIndicator');
  var tip = document.getElementById('lvlTooltip');
  if (!dot || !tip) return;
  lvlStarted = true;
  tip.style.opacity = '1';
  var startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / lvlDuration, 1);
    var eased = lvlEase(progress);
    var current = eased * lvlTarget;
    dot.style.left = current + '%';
    tip.style.left = current + '%';
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ============================================================
   REVIEWS CAROUSEL (étape 5)
   Desktop: 3 avis visibles, flèches pour naviguer par "page"
   Mobile: scroll natif horizontal libre (suit le doigt, pas de snap)
   ============================================================ */
var reviewsIdx = 0, reviewsTotal = 6;

function isMobileReviews() { return window.innerWidth < 768; }
function getReviewsVisibleCount() { return isMobileReviews() ? 1 : 3; }
function getReviewsPages() { return reviewsTotal - getReviewsVisibleCount() + 1; }

function updateReviews() {
  var track = document.getElementById('reviewsTrack');
  if (!track) return;

  // Mobile: on laisse le scroll natif faire — on ne touche pas au transform
  if (isMobileReviews()) {
    track.style.transform = '';
    track.style.transition = '';
    return;
  }

  // Desktop: transform-based navigation
  var pages = getReviewsPages();
  if (reviewsIdx > pages - 1) reviewsIdx = pages - 1;
  if (reviewsIdx < 0) reviewsIdx = 0;
  var blockW = 100 / getReviewsVisibleCount();
  track.style.transform = 'translateX(-' + (reviewsIdx * blockW) + '%)';

  var dotsC = document.getElementById('reviewsDots');
  if (dotsC) {
    dotsC.innerHTML = '';
    for (var i = 0; i < pages; i++) {
      var d = document.createElement('button');
      d.className = 'reviews-dot' + (i === reviewsIdx ? ' active' : '');
      (function(n) {
        d.addEventListener('click', function() { reviewsIdx = n; updateReviews(); });
      })(i);
      dotsC.appendChild(d);
    }
  }
  var pb = document.getElementById('reviewsPrevBtn'), nb = document.getElementById('reviewsNextBtn');
  if (pb) pb.disabled = reviewsIdx === 0;
  if (nb) nb.disabled = reviewsIdx >= pages - 1;
}

function reviewsNext() {
  if (isMobileReviews()) return;
  var pages = getReviewsPages();
  if (reviewsIdx < pages - 1) { reviewsIdx++; updateReviews(); }
}
function reviewsPrev() {
  if (isMobileReviews()) return;
  if (reviewsIdx > 0) { reviewsIdx--; updateReviews(); }
}

/* Backward compat */
function carouselNext() { reviewsNext(); }
function carouselPrev() { reviewsPrev(); }
function carouselGoTo(i) { if (isMobileReviews()) return; reviewsIdx = i; updateReviews(); }

window.addEventListener('resize', function() { updateReviews(); });

document.addEventListener('DOMContentLoaded', function() {
  updateReviews();
});

/* ============================================================
   DATE PICKER (étape 21)
   ============================================================ */
var dpY,dpM,dpSel=null;

function initDP(){var n=new Date();dpY=n.getFullYear();dpM=n.getMonth();renderDP();}
function toggleDatePicker(){var d=document.getElementById('datepickerDropdown');if(d){d.classList.toggle('open');if(d.classList.contains('open'))initDP();}}
function dpPrevMonth(e){e.stopPropagation();dpM--;if(dpM<0){dpM=11;dpY--;}renderDP();}
function dpNextMonth(e){e.stopPropagation();dpM++;if(dpM>11){dpM=0;dpY++;}renderDP();}

function renderDP(){
  var ms=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  var t=document.getElementById('dpMonthYear');if(t)t.textContent=ms[dpM]+'    '+dpY;
  var dc=document.getElementById('dpDays');if(!dc)return;dc.innerHTML='';
  var fd=new Date(dpY,dpM,1).getDay();fd=fd===0?6:fd-1;
  var dim=new Date(dpY,dpM+1,0).getDate(),dipm=new Date(dpY,dpM,0).getDate(),today=new Date();
  for(var i=fd-1;i>=0;i--){var b=document.createElement('button');b.className='dp-day other-month';b.textContent=dipm-i;dc.appendChild(b);}
  for(var d=1;d<=dim;d++){
    var b=document.createElement('button');b.className='dp-day';b.textContent=d;
    if(d===today.getDate()&&dpM===today.getMonth()&&dpY===today.getFullYear())b.classList.add('today');
    if(dpSel&&d===dpSel.getDate()&&dpM===dpSel.getMonth()&&dpY===dpSel.getFullYear())b.classList.add('selected');
    (function(day){b.addEventListener('click',function(e){
      e.stopPropagation();dpSel=new Date(dpY,dpM,day);
      var f=String(day).padStart(2,'0')+'/'+String(dpM+1).padStart(2,'0')+'/'+dpY;
      document.getElementById('dateInput').value=f;answers[21]=f;
      trackAnswer(21, f);
      renderDP();
      setTimeout(function(){document.getElementById('datepickerDropdown').classList.remove('open');},200);
    });})(d);
    dc.appendChild(b);
  }
  var tc=fd+dim,rem=(7-(tc%7))%7;
  for(var i=1;i<=rem;i++){var b=document.createElement('button');b.className='dp-day other-month';b.textContent=i;dc.appendChild(b);}
}

/* ============================================================
   RESULTS PAGE (étape 23)
   ============================================================ */
function updateResultsPage(){
  var e=document.getElementById('eventName');if(e&&answers[20])e.textContent=answers[20];
  var t=new Date();t.setMonth(t.getMonth()+3);
  var d=document.getElementById('resultDate');
  if(d)d.textContent=String(t.getDate()).padStart(2,'0')+'/'+String(t.getMonth()+1).padStart(2,'0')+'/'+t.getFullYear();
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded',function(){
  updateProgressBar(1);
  history.replaceState({step:1},'','#step-1');
});
