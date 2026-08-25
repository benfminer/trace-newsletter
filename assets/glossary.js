/* ==========================================================================
   glossary.js — on-demand definitions for the TRACE newsletters
   --------------------------------------------------------------------------
   Adds a hover/tap/keyboard definition popover to jargon terms WITHOUT
   changing a single word of the article. The prose stays exactly the length
   it was published at; the explanation lives one gesture away.

   How it works
     1. TERMS below is the dictionary. One definition per concept, reused
        across every issue.
     2. On load, the script walks the text nodes of the article prose and
        wraps the FIRST occurrence of each term in a <button class="term">.
     3. That button opens a single shared popover, positioned under the word
        and clamped to the viewport.

   Deliberate choices
     - Only the first occurrence of a term is wired up. Marking every "IEP"
       on the page would pepper the article with dotted underlines and make
       it harder to read, which is the opposite of the point.
     - Interactive modules are skipped entirely. Their innerHTML is rewritten
       by each issue's own script, which would blow away injected markup.
     - A <button> rather than a <span>: focusable, Enter/Space activates, and
       screen readers announce it, all for free.

   To use on another issue, add two lines:
     <link rel="stylesheet" href="assets/glossary.css" />
     <script src="assets/glossary.js" defer></script>
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------- terms --
     `match` is optional; it overrides how the term is found in the text.
     Keep definitions to a sentence or two — this is a popover, not a page. */

  var TERMS = [
    /* --- the plans ------------------------------------------------------ */
    { term: 'IEP', match: /\bIEPs?\b/,
      title: 'IEP — Individualized Education Program',
      def: 'The yearly written plan for a student in special education. A legal document, agreed at a meeting with the family. It says where the student is headed and what the school will do about it.' },

    { term: '504 Plan', match: /\b504 Plans?\b/i,
      title: '504 Plan',
      def: 'A plan for a student who has a disability but does not need special education — so they get adjustments like extra time or a quiet room, rather than different teaching. Not the same as an IEP, and it opens some of the same doors.' },

    { term: 'IDEA',
      title: 'IDEA — Individuals with Disabilities Education Act',
      def: 'The federal special education law. It sets the rules every IEP has to follow. Said out loud as "eye-dee-ee-ay."' },

    { term: 'PLAAFP',
      title: 'PLAAFP',
      def: 'Present Levels of Academic Achievement and Functional Performance — the section near the front of the IEP describing where the student is right now. Where assessment results get written up. Said out loud as "pee-laff."' },

    /* --- the agencies --------------------------------------------------- */
    { term: 'DOR',
      title: 'DOR — California Department of Rehabilitation',
      def: 'The state agency that helps people with disabilities find and keep jobs. They hold the money and assign the counselors. Getting in takes time, so an invitation sent late costs real months.' },

    { term: 'VR',
      title: 'VR — vocational rehabilitation',
      def: 'The public system that helps people with disabilities get and keep jobs. Every state has one. California’s is the Department of Rehabilitation, or DOR.' },

    { term: 'Regional Center',
      title: 'Regional Center',
      def: 'One of 21 nonprofit agencies under contract with California that arrange lifelong services for people with developmental disabilities.' },

    { term: 'SELPA',
      title: 'SELPA',
      def: 'Special Education Local Plan Area — a group of school districts that plan and run special education together.' },

    { term: 'DSPS',
      title: 'DSPS',
      def: 'Disabled Student Programs and Services — the office at every California community college that arranges accommodations for students with disabilities. The college equivalent of school support, except that here the student has to go and ask for it.' },

    { term: 'NTACT:C',
      title: 'NTACT:C',
      def: 'National Technical Assistance Center on Transition: The Collaborative. A federally funded center that publishes free tools and guidance for transition work.' },

    { term: 'CTI',
      title: 'CTI — Center on Transition Innovations',
      def: 'A practitioner-facing hub at Virginia Commonwealth University publishing free briefs, guides and courses on transition. Funded by Virginia, so where it names an agency, substitute the California one.' },

    { term: 'VCU',
      title: 'VCU — Virginia Commonwealth University',
      def: 'Home of the Center on Transition Innovations and a large share of the research on supported employment and job coaching.' },

    /* --- the money and the services ------------------------------------- */
    { term: 'Pre-ETS', match: /\bPre-ETS\b/i,
      title: 'Pre-ETS — Pre-Employment Transition Services',
      def: 'Five kinds of job-related help that DOR pays for while a student is still in school. Not a program you enrol in — a set of services you receive. Said out loud as "pree-ets."' },

    { term: 'WIOA',
      title: 'WIOA',
      def: 'Workforce Innovation and Opportunity Act — the federal law that requires each state vocational rehabilitation agency to reserve 15% of its federal VR funds for Pre-Employment Transition Services for students with disabilities.' },

    { term: 'IPE',
      title: 'IPE — Individualized Plan for Employment',
      def: 'The plan DOR writes with an adult client once they have been formally approved. The adult-world equivalent of an IEP, aimed at a job.' },

    { term: 'potentially eligible',
      title: '"Potentially eligible"',
      def: 'The legal term that unlocks the money. It means a student can receive Pre-ETS without being formally approved for VR first — having an IEP or a 504 Plan is enough on its own.' },

    { term: 'entitlement',
      title: 'Entitlement vs. eligibility',
      def: 'An entitlement is something you get automatically because you qualify — school is one, and the system comes and finds you. Adult services are eligibility-based: you get nothing unless you apply and prove you qualify.' },

    { term: 'Lanterman Act',
      title: 'The Lanterman Act',
      def: 'A California law giving Californians with developmental disabilities a genuine legal right to Regional Center services — a real exception to the rule that nothing is an entitlement after school.' },

    { term: 'SSI',
      title: 'SSI and SSDI',
      def: 'Two federal disability benefit payments. They matter here because earning money can change them, which is why benefits counseling counts as a Pre-ETS service rather than an optional extra.' },

    /* --- the measures --------------------------------------------------- */
    { term: 'Indicator 13',
      title: 'Indicator 13',
      def: 'Every state sends the federal government a yearly report on special education, built from numbered measures called indicators. Number 13 counts whether transition IEPs contain every legally required part. The expectation is 100%, checked by reading the file.' },

    { term: 'Indicator 14',
      title: 'Indicator 14',
      def: 'The other half of that report. A year after students leave, somebody surveys them and asks what they are doing now — working, studying, or neither. Measured against a target the state sets, and nobody expects 100%.' },

    { term: 'compliance', match: /\bcompliance review\b|\bcompliant\b/i,
      title: 'Compliance / compliance review',
      def: 'A check that the legally required parts of a plan are present. It is done by reading the document. Nobody visits the student and nobody asks whether the plan did anything.' },

    { term: 'predictor', match: /\bpredictors?\b/i,
      title: 'Predictor',
      def: 'Something researchers found tends to go along with students doing better after school. A pattern in the data, not proof one thing causes the other — and it says nothing about how much, or when.' },

    /* --- planning vocabulary -------------------------------------------- */
    { term: 'postsecondary goal', match: /\bpostsecondary (?:employment )?goals?\b/i,
      title: 'Postsecondary goal',
      def: 'A sentence in the IEP describing what the student will be doing after school ends — working, studying, or living on their own. "Postsecondary" just means after high school.' },

    { term: 'transition assessment', match: /\b(?:age-appropriate )?transition assessment\b/i,
      title: 'Transition assessment',
      def: 'Everything you do to find out what a student wants and what they can do: interest surveys, interviews, watching them work, job try-outs. Not one test — and the law says it has to keep happening, not happen once.' },

    { term: 'course of study',
      title: 'Course of study',
      def: 'The classes and experiences this year that actually point at the student’s goal, rather than just piling up credits.' },

    { term: 'agency linkage',
      title: 'Agency linkage',
      def: 'Inviting the outside agencies whose help may be needed after school — DOR, a Regional Center. One of the four legally required parts of a transition IEP, and the one that quietly gets skipped.' },

    { term: 'competitively employed', match: /\bcompetitively employed\b|\bcompetitive (?:integrated )?employment\b/i,
      title: 'Competitively employed',
      def: 'A regular job in the community — one anybody could apply for, paying at least minimum wage, working alongside people who do not have disabilities. The phrase rules out sheltered work at sub-minimum wage.' },

    { term: 'work-based learning',
      title: 'Work-based learning',
      def: 'Learning that happens at a real job site rather than in a classroom: job shadows, work experience placements, internships.' },

    { term: 'job shadow', match: /\bjob shadows?\b|\bjob shadowing\b/i,
      title: 'Job shadow',
      def: 'Spending a day following a worker around to see what a job is actually like, without doing it yourself.' },

    { term: 'career cluster', match: /\bcareer clusters?\b|\bclusters\b/i,
      title: 'Career clusters',
      def: 'The standard groupings that sort hundreds of jobs into families — health science, manufacturing, hospitality — so a student can explore a direction rather than a job title.' },

    { term: 'job analysis',
      title: 'Job analysis',
      def: 'Going to an actual workplace and writing down what the job really demands — the noise, the hours, the supervisor, how you get there — so you can hold it up against the person.' },

    { term: 'SPIN',
      title: 'SPIN',
      def: 'A way of describing a person in four parts — Strengths, Preferences, Interests, Needs. It describes the person only. It says nothing about any particular job.' },

    { term: 'functional vocational evaluation',
      title: 'Functional vocational evaluation',
      def: 'Finding out what someone can do by having them actually do it — real tasks in a real setting, watched — rather than by asking them to fill in a survey.' },

    { term: 'person-centered planning',
      title: 'Person-centered planning',
      def: 'Sitting down with the people who know a student best and building a picture of them together, led by what the student wants rather than by what services exist.' },

    { term: 'O*NET', match: /O\*NET/,
      title: 'O*NET',
      def: 'The US Department of Labor’s free database of occupations — what each job involves, what it pays, what it needs. My Next Move is its plain-language front end.' },

    /* --- job coaching ---------------------------------------------------- */
    { term: 'natural support', match: /\bnatural supports?\b/i,
      title: 'Natural supports',
      def: 'Help that comes from the workplace itself — a coworker, a supervisor, the way the job is set up — rather than from someone paid to support the student.' },

    { term: 'systematic instruction', match: /\bsystematic[- ]instruction\b/i,
      title: 'Systematic instruction',
      def: 'Teaching a job in a deliberate, planned way: breaking it into steps, prompting the same way each time, and taking the prompts back off in a planned order.' },

    { term: 'supported employment',
      title: 'Supported employment',
      def: 'A real paid job in a regular workplace, with ongoing help from a coach or agency to keep it. Most of the research on job coaching comes from here, not from school placements.' },

    { term: 'job developer',
      title: 'Job developer',
      def: 'The person whose job is finding and negotiating placements with employers. In your program that may be a teacher or a transition specialist.' },

    { term: 'fading', match: /\bfad(?:e|es|ed|ing)\b/i,
      title: 'Fading',
      def: 'Deliberately reducing your help step by step so the student does more of the job themselves. The companion question is who picks up whatever does not fade away.' },

    { term: 'Summary of Performance',
      title: 'SOP — Summary of Performance',
      def: 'A document the school must write for a student leaving school, describing what they can do and what help they need, handed to whoever supports them next. It has a legal deadline: the student’s final year.' },

    { term: 'SOP',
      title: 'SOP — Summary of Performance',
      def: 'A document the school must write for a student leaving school, describing what they can do and what help they need, handed to whoever supports them next. It has a legal deadline: the student’s final year.' },

    /* --- behaviour ------------------------------------------------------- */
    { term: 'dysregulation', match: /\bdysregulation\b|\bdysregulated\b/i,
      title: 'Dysregulated',
      def: 'Someone whose feelings have got bigger than their ability to manage them right now. Not misbehaving on purpose — genuinely unable to steer at that moment.' },

    { term: 'escalating', match: /\bescalating\b|\bescalation\b/i,
      title: 'Escalating',
      def: 'Winding up. A student getting progressively more upset, louder, more rigid or more withdrawn — heading toward a blow-up.' },

    { term: 'de-escalat', match: /\bde-escalation\b|\bde-escalating\b/i,
      title: 'De-escalation',
      def: 'Anything that brings the temperature down instead of up.' },

    { term: 'PBIS',
      title: 'PBIS',
      def: 'Positive Behavioral Interventions and Supports — a widely used approach to school behaviour built on teaching and prevention rather than punishment.' },

    { term: 'BIP',
      title: 'BIP — Behavior Intervention Plan',
      def: 'A formal written plan attached to a student’s IEP setting out how staff should respond to that particular student. If one exists, it overrides general advice.' },

    { term: 'executive functioning',
      title: 'Executive functioning',
      def: 'The mental skills for getting yourself organised: planning, starting a task, keeping track of time, switching between things, remembering what you were in the middle of.' },

    { term: 'self-determination',
      title: 'Self-determination',
      def: 'A person’s ability to make their own choices and act on them — deciding what they want, speaking up for it, and steering their own life.' },

    { term: 'self-advocacy',
      title: 'Self-advocacy',
      def: 'Speaking up for yourself: saying what you need, asking for it, and explaining why. It is the skill the adult world requires and the school system rarely asks for.' },


    /* --- paraprofessional practice (Side by Side) ------------------------ */
    { term: 'AAC',
      title: 'AAC — Augmentative and Alternative Communication',
      def: 'Anything a person uses to communicate other than speech: a tablet with a speech app, a picture board, signs, or a single-message button.' },

    { term: 'prompting', match: /\bprompt(?:ing|s)?\b/i,
      title: 'Prompting',
      def: 'Any help you give to get a response started — a word, a gesture, a point, a hand on the elbow. The skill is giving the least you can, and taking it back as soon as you can.' },

    { term: 'task analysis',
      title: 'Task analysis',
      def: 'Breaking a job into its individual steps and teaching them one at a time, so you can see exactly which step someone is stuck on.' },

    { term: 'natural cue', match: /\bnatural cues?\b/i,
      title: 'Natural cue',
      def: 'Something already in the environment that says what to do next — the timer going off, the bin being full — rather than a person telling them.' },

    { term: 'travel training',
      title: 'Travel training',
      def: 'Teaching someone to use public transport on their own: a specific route to a specific place, or the general skill of getting around.' },

    { term: 'modeling', match: /\bmodel(?:ing|led|ling)\b/i,
      title: 'Modeling',
      def: 'Showing someone how by doing it yourself where they can see. With a communication device it means using the device to talk to them, not just handing it over.' },

    { term: 'generalization', match: /\bgeneraliz\w+\b/i,
      title: 'Generalization',
      def: 'Using a skill somewhere other than where it was taught. It does not happen automatically, which is the whole reason where you teach matters.' },

    { term: 'reinforcement',
      title: 'Reinforcement',
      def: 'Anything that follows a behaviour and makes it more likely to happen again. It is defined by the effect, not the intention — so attention can reinforce something you meant to discourage.' },

    { term: 'community-based instruction',
      title: 'Community-based instruction (CBI)',
      def: 'Teaching skills in the actual place they get used — the shop, the bus, the job site — rather than practising them in a classroom first.' },

    { term: 'peer support', match: /\bpeer (?:support|network)s?\b/i,
      title: 'Peer support',
      def: 'Help that comes from other students rather than from an adult — which is usually less stigmatising and always more sustainable than a para standing beside someone.' },

    /* --- named resources -------------------------------------------------- */
    { term: 'MTS',
      title: 'MTS — San Diego Metropolitan Transit System',
      def: 'The buses and trolleys across most of San Diego County, and the agency that runs a free travel-training program.' },

    { term: 'TIES',
      title: 'The TIES Center',
      def: 'A national centre at the University of Minnesota working on including students with significant disabilities in general education classrooms. Publishes free practice guides.' },

    { term: 'IRIS',
      title: 'The IRIS Center',
      def: 'Free online modules on evidence-based teaching practices, widely used for staff training and cited in this vault for task analysis and prompting.' },

    { term: 'AFIRM',
      title: 'AFIRM',
      def: 'Autism Focused Intervention Resources and Modules — free online training modules on autism practices, from the University of North Carolina.' },

    /* --- local ----------------------------------------------------------- */
    { term: 'TRACE',
      title: 'TRACE',
      def: 'The program these newsletters are written for — students aged 18 to 22. A program, not an age range, which matters for several of the rules below.' },

    { term: 'CBI',
      title: 'CBI — community-based instruction',
      def: 'Teaching skills in the actual place they get used — the shop, the bus, the job site — rather than practising them in a classroom first.' },

    { term: 'CFR', match: /\b34 C\.?F\.?R\.?\b|\bCFR\b/,
      title: 'CFR — Code of Federal Regulations',
      def: 'The detailed federal rulebook that spells out how a law actually works. A citation like 34 CFR § 361.5 is just an address for one specific rule — useful because you can point at it.' },

    { term: 'CCR', match: /\b9 CCR\b|\bCCR\b/,
      title: 'CCR — California Code of Regulations',
      def: 'California’s equivalent rulebook. 9 CCR § 7026.5 is the DOR rule that lets a student keep receiving Pre-ETS past their 22nd birthday while still in the program.' },

    { term: 'fiscal year',
      title: 'Fiscal year',
      def: 'The government’s budget year rather than the calendar year. For these rules it runs 1 July to 30 June — which is why a student’s birth month decides how long they can stay.' }
  ];

  /* ------------------------------------------------------------- plumbing -- */

  /* Containers whose innerHTML is rewritten by each issue's own script, or
     whose layout is too tight to survive an injected element. */
  var SKIP_SEL = 'script,style,button,a,svg,code,pre,input,select,textarea,' +
                 'h1,h2,.term,.module,.readout,.moves,.buckets,.jobtally,' +
                 '[data-seg],.rail,.topbar,.testbar,.glosshint,.foot__next';

  var popover, currentBtn, hideTimer;

  function buildPopover() {
    popover = document.createElement('div');
    popover.className = 'gloss-pop';
    popover.setAttribute('role', 'tooltip');
    popover.id = 'gloss-pop';
    popover.hidden = true;
    popover.innerHTML =
      '<p class="gloss-pop__t"></p><p class="gloss-pop__d"></p>' +
      '<button type="button" class="gloss-pop__x" aria-label="Close definition">&times;</button>';
    document.body.appendChild(popover);

    popover.querySelector('.gloss-pop__x').addEventListener('click', hide);
    /* keep it open while the pointer is inside it */
    popover.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    popover.addEventListener('mouseleave', scheduleHide);
  }

  function show(btn) {
    clearTimeout(hideTimer);
    if (currentBtn && currentBtn !== btn) currentBtn.setAttribute('aria-expanded', 'false');
    currentBtn = btn;

    popover.querySelector('.gloss-pop__t').textContent = btn.dataset.title;
    popover.querySelector('.gloss-pop__d').textContent = btn.dataset.def;
    popover.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-describedby', 'gloss-pop');

    position(btn);
  }

  function position(btn) {
    /* measure first, then clamp to the viewport so a term near the right
       edge does not push a 20rem panel off-screen */
    popover.style.left = '0px';
    popover.style.top = '0px';

    var r = btn.getBoundingClientRect();
    var p = popover.getBoundingClientRect();
    var pad = 12;

    var left = r.left + (r.width / 2) - (p.width / 2);
    left = Math.max(pad, Math.min(left, window.innerWidth - p.width - pad));

    /* prefer below; flip above when there is no room */
    var top = r.bottom + 10;
    if (top + p.height > window.innerHeight - pad) {
      var above = r.top - p.height - 10;
      if (above > pad) top = above;
      else top = Math.max(pad, window.innerHeight - p.height - pad);
    }

    popover.style.left = Math.round(left) + 'px';
    popover.style.top = Math.round(top) + 'px';
  }

  function hide() {
    clearTimeout(hideTimer);
    if (!popover) return;
    popover.hidden = true;
    if (currentBtn) {
      currentBtn.setAttribute('aria-expanded', 'false');
      currentBtn.removeAttribute('aria-describedby');
      currentBtn = null;
    }
  }

  function scheduleHide() { hideTimer = setTimeout(hide, 220); }

  function wire(btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (currentBtn === btn && !popover.hidden) hide(); else show(btn);
    });
    /* hover only where hovering is real — a touch device reports 'none' */
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      btn.addEventListener('mouseenter', function () { show(btn); });
      btn.addEventListener('mouseleave', scheduleHide);
    }
    btn.addEventListener('focus', function () { show(btn); });
    btn.addEventListener('blur', scheduleHide);
  }

  /* ------------------------------------------------------------ wrapping -- */

  function wrapFirst(entry) {
    /* An all-caps token (IDEA, SPIN, VR) must match case-sensitively, or
       "IDEA" would light up the ordinary word "idea". Everything else is
       ordinary prose and should match however the sentence capitalised it. */
    var re = entry.match;
    if (!re) {
      var acronym = /^[A-Z0-9:*.]+$/.test(entry.term);
      re = new RegExp('\\b' + entry.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b',
                      acronym ? '' : 'i');
    }
    var root = document.querySelector('main') || document.body;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement.closest(SKIP_SEL)) return NodeFilter.FILTER_REJECT;
        return re.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    var node = walker.nextNode();
    if (!node) return false;

    var m = node.nodeValue.match(re);
    if (!m) return false;

    var after = node.splitText(m.index);
    after.nodeValue = after.nodeValue.slice(m[0].length);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'term';
    btn.textContent = m[0];
    btn.dataset.title = entry.title;
    btn.dataset.def = entry.def;
    btn.setAttribute('aria-expanded', 'false');
    node.parentNode.insertBefore(btn, after);
    wire(btn);
    return true;
  }

  function init() {
    if (!document.querySelector('main')) return;
    buildPopover();

    /* longest first, so "Summary of Performance" wins before "SOP", and
       "transition assessment" before "assessment" */
    TERMS.slice().sort(function (a, b) { return b.term.length - a.term.length; })
         .forEach(function (entry) { try { wrapFirst(entry); } catch (e) {} });

    var n = document.querySelectorAll('.term').length;
    var hint = document.querySelector('.glosshint__n');
    if (hint) hint.textContent = n;
    if (!n) {
      var wrap = document.querySelector('.glosshint');
      if (wrap) wrap.hidden = true;
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hide();
    });
    document.addEventListener('click', function (e) {
      if (!popover || popover.hidden) return;
      if (e.target.closest('.term') || e.target.closest('.gloss-pop')) return;
      hide();
    });
    window.addEventListener('resize', hide);
    window.addEventListener('scroll', function () {
      if (popover && !popover.hidden && currentBtn) position(currentBtn);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
