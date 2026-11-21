const steps = [
 { title: 'Prvo, malo mehurića.', description: 'Klikni i započni Tedijev spa dan.', action: 'Okupaj Tedija', done: 'Čist početak. Mekana dlaka.', detail: 'Kupanje je osnova nege. Sledeće je četkanje.' },
 { title: 'Svaki pramen na svom mestu.', description: 'Prođi četkom kroz virtuelnu dlaku.', action: 'Pročešljaj dlaku', done: 'Raspetljano i razigrano.', detail: 'Četkanje i uklanjanje viška dlake, korak po korak.' },
 { title: 'Isti Tedi. Nova frizura.', description: 'Sredi razbarušene pramenove.', action: 'Sredi frizuru', done: 'Frizura sa karakterom.', detail: 'Kod pravog psa izgled se dogovara prema tipu dlake.' },
 { title: 'Još pažnje za šapice.', description: 'Završi negu do vrhova noktiju.', action: 'Uredi šapice', done: 'Spreman za svoj dobar dan.', detail: 'Tedi je spreman! Za svog psa zakaži pravi termin.' }
];
const stage = document.querySelector('.stage');
const tabs = [...document.querySelectorAll('.studio-tabs button')];
const treatment = document.querySelector('#treatment');
let current = 0;
let complete = new Set();
let animationTimer;
function renderStep(index) {
 clearTimeout(animationTimer);
 current = index;
 stage.classList.remove('working');
 stage.dataset.step = index;
 stage.dataset.done = complete.has(index);
 stage.classList.toggle('trimmed', complete.has(2));
 stage.classList.toggle('all-done', complete.size === 4);
 tabs.forEach((button, i) => { button.classList.toggle('selected', i === index); button.classList.toggle('completed', complete.has(i)); button.setAttribute('aria-pressed', String(i === index)); });
 const data = steps[index];
 document.querySelector('#step-title').textContent = complete.has(index) ? data.done : data.title;
 document.querySelector('#step-description').textContent = complete.has(index) ? data.detail : data.description;
 treatment.textContent = complete.has(index) ? (index < 3 ? 'Sledeći korak' : 'Počni ponovo') : data.action;
 treatment.disabled = false;
}
tabs.forEach(button => button.addEventListener('click', () => renderStep(Number(button.dataset.step))));
function resetStudio() { complete.clear(); renderStep(0); }
document.querySelector('.reset-studio').addEventListener('click', resetStudio);
treatment.addEventListener('click', () => {
 if (complete.has(current)) { current < 3 ? renderStep(current + 1) : resetStudio(); return; }
 const selected = current;
 stage.classList.add('working');
 treatment.disabled = true;
 treatment.textContent = 'Malo pažnje…';
 animationTimer = setTimeout(() => { complete.add(selected); renderStep(selected); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 1300);
});
const menu = document.querySelector('#mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
function closeMenu() { menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Otvori meni'); }
menuToggle.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; menuToggle.setAttribute('aria-expanded', String(open)); menuToggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni'); });
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuToggle.focus(); } });
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
 document.querySelector('#service').value = button.dataset.service;
 document.querySelector('#kontakt').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
 document.querySelector('#pet').focus({ preventScroll: true });
 document.querySelector('.message-result').hidden = true;
}));
const form = document.querySelector('#inquiry');
const preview = document.querySelector('#message-preview');
const result = document.querySelector('.message-result');
const copyStatus = document.querySelector('#copy-status');
function buildMessage() {
 const value = id => document.getElementById(id).value.trim();
 return `Zdravo! Želim da se raspitam za termin.\nLjubimac: ${value('pet')}\nRasa / veličina: ${value('breed')}\nUsluga: ${value('service')}${value('note') ? `\nNapomena: ${value('note')}` : ''}\nMolim vas za informaciju o ceni i slobodnim terminima. Hvala!`;
}
form.addEventListener('submit', event => { event.preventDefault(); preview.value = buildMessage(); result.hidden = false; copyStatus.textContent = ''; preview.focus(); });
form.addEventListener('input', event => { if (event.target !== preview) { result.hidden = true; copyStatus.textContent = ''; } });
document.querySelector('#copy-message').addEventListener('click', async () => {
 try { await navigator.clipboard.writeText(preview.value); copyStatus.textContent = 'Poruka je kopirana. Nalepi je u poruku salonu na Instagramu.'; }
 catch { preview.focus(); preview.select(); copyStatus.textContent = 'Tekst je označen. Kopiraj ga pomoću opcije Kopiraj ili Ctrl+C.'; }
});
document.querySelector('#year').textContent = new Date().getFullYear();
