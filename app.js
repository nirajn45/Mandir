import { festivalConfig, teamMembers, galleryVideos } from './config.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

$$('[data-village]').forEach(node => node.textContent = festivalConfig.village);
$$('[data-post]').forEach(node => node.textContent = festivalConfig.post);
$$('[data-district]').forEach(node => node.textContent = festivalConfig.district);
$$('[data-temple]').forEach(node => node.textContent = festivalConfig.templeName);

const stars = $('.stars');
for (let i = 0; i < 18; i += 1) { const star = document.createElement('i'); star.style.cssText = `position:absolute;left:${Math.random()*100}%;top:${Math.random()*68}%;width:${Math.random()*2+1}px;height:${Math.random()*2+1}px;background:#ffe29b;border-radius:50%;opacity:${Math.random()*.7+.2};animation:twinkle ${3+Math.random()*5}s ${Math.random()*3}s infinite alternate`; stars.append(star); }
const particles = $('.particles');
for (let i = 0; i < 12; i += 1) { const particle = document.createElement('i'); particle.style.cssText = `position:absolute;left:${Math.random()*100}%;top:${55+Math.random()*35}%;width:${Math.random()*3+2}px;height:${Math.random()*3+2}px;background:#e7b755;border-radius:50%;opacity:.45;animation:floatUp ${7+Math.random()*7}s ${Math.random()*5}s infinite`; particles.append(particle); }
const style = document.createElement('style'); style.textContent = '@keyframes floatUp{to{transform:translateY(-55vh);opacity:0}}'; document.head.append(style);

const timeline = $('[data-timeline]');
festivalConfig.events.forEach((event, index) => { timeline.insertAdjacentHTML('beforeend', `<article class="event reveal-on-scroll"><div class="event-time">${event.time}</div><span class="event-marker"></span><div class="event-body"><h3>${event.title}</h3><p>${event.note}</p></div></article>`); });
const team = $('[data-team]');
team.innerHTML = `<div class="member-track">${teamMembers.map(member => `<article class="member"><img src="${member.image}" alt="${member.name}, ${member.role}" loading="lazy"><h3>${member.name}</h3><p>${member.role}</p></article>`).join('')}</div><div class="slider-controls"><button type="button" data-team-prev aria-label="पिछले सदस्य">←</button><div class="slider-dots" data-team-dots></div><button type="button" data-team-next aria-label="अगले सदस्य">→</button></div>`;
const memberTrack = $('.member-track');
const memberDots = $('[data-team-dots]');
let memberIndex = 0;
teamMembers.forEach((_member, index) => { const dot = document.createElement('button'); dot.type = 'button'; dot.className = index === 0 ? 'active' : ''; dot.setAttribute('aria-label', `सदस्य ${index + 1}`); dot.addEventListener('click', () => showMember(index)); memberDots.append(dot); });
function showMember(index) { memberIndex = (index + teamMembers.length) % teamMembers.length; memberTrack.style.transform = `translateX(-${memberIndex * (100 / (window.innerWidth <= 760 ? 1 : 2))}%)`; memberDots.querySelectorAll('button').forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === memberIndex)); }
$('[data-team-prev]').addEventListener('click', () => showMember(memberIndex - 1));
$('[data-team-next]').addEventListener('click', () => showMember(memberIndex + 1));
let memberTimer = setInterval(() => showMember(memberIndex + 2), 4200);
team.addEventListener('mouseenter', () => clearInterval(memberTimer));
team.addEventListener('mouseleave', () => { memberTimer = setInterval(() => showMember(memberIndex + 2), 4200); });
window.addEventListener('resize', () => showMember(memberIndex));
const gallery = $('[data-gallery]');
galleryVideos.forEach(video => gallery.insertAdjacentHTML('beforeend', `<div class="gallery-item ${video.size}"><video src="${video.src}" aria-label="${video.alt}" style="width:100%;height:100%;object-fit:cover;display:block" autoplay muted loop playsinline preload="metadata"></video></div>`));

const targetDate = new Date(festivalConfig.countdownDate).getTime();
function updateCountdown() { let remaining = Math.max(0, targetDate - Date.now()); const days = Math.floor(remaining / 86400000); remaining %= 86400000; const hours = Math.floor(remaining / 3600000); remaining %= 3600000; const minutes = Math.floor(remaining / 60000); const seconds = Math.floor((remaining % 60000) / 1000); [['days',days],['hours',hours],['minutes',minutes],['seconds',seconds]].forEach(([unit,value]) => { const node = $(`[data-unit="${unit}"]`); if (node) node.textContent = String(value).padStart(2,'0'); }); }
updateCountdown(); setInterval(updateCountdown, 1000);

const modalBackdrop = $('[data-modal]');
const contactActions = $('.contact-actions');
if (contactActions) {
	contactActions.style.display = 'grid';
	contactActions.style.gap = '9px';
}
$('[data-open-modal]').addEventListener('click', () => { modalBackdrop.classList.add('open'); document.body.style.overflow='hidden'; });
$('[data-close-modal]').addEventListener('click', closeModal); modalBackdrop.addEventListener('click', event => { if (event.target === modalBackdrop) closeModal(); });
function closeModal() { modalBackdrop.classList.remove('open'); document.body.style.overflow=''; }
$('[data-registration]').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const status = $('[data-form-status]'); const button = form.querySelector('button[type="submit"]'); button.disabled = true; button.firstChild.textContent = 'पंजीकरण हो रहा है...'; status.textContent = ''; try { const response = await fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(Object.fromEntries(new FormData(form))) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); status.textContent = 'पंजीकरण सफल रहा। आपकी टीम का विवरण दर्ज हो गया है।'; form.reset(); } catch (error) { status.textContent = error.message || 'कुछ समस्या हुई। कृपया दोबारा प्रयास करें।'; } finally { button.disabled = false; button.firstChild.textContent = 'टीम रजिस्टर करें '; } });

const lightbox = $('[data-lightbox]'); const lightboxImage = $('[data-lightbox-image]');
$$('[data-gallery-image]').forEach(item => item.addEventListener('click', () => { lightboxImage.src = item.dataset.galleryImage; lightboxImage.alt = item.dataset.galleryAlt; lightbox.classList.add('open'); document.body.style.overflow='hidden'; }));
$('[data-close-lightbox]').addEventListener('click', closeLightbox); lightbox.addEventListener('click', event => { if(event.target === lightbox) closeLightbox(); });
function closeLightbox() { lightbox.classList.remove('open'); document.body.style.overflow=''; }

const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); if (entry.target.classList.contains('event')) entry.target.classList.add('active'); } }), { threshold:.2 });
$$('.reveal-on-scroll').forEach(element => observer.observe(element));
const menuButton = $('.menu-button'); menuButton.addEventListener('click', () => $('.nav').classList.toggle('open')); $$('.nav a').forEach(link => link.addEventListener('click', () => $('.nav').classList.remove('open')));
const toast = $('.matki-toast'); const matki = $('.hanging-matki'); matki.addEventListener('click', () => { matki.style.animation = 'swing 1.1s ease-in-out 3'; toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); matki.style.animation = ''; }, 2600); for (let i=0;i<6;i+=1) { const petal=document.createElement('i'); petal.style.cssText=`position:fixed;z-index:80;left:${matki.getBoundingClientRect().left+Math.random()*100}px;top:180px;width:7px;height:4px;background:#e7954b;border-radius:50%;animation:floatUp 2s reverse`; document.body.append(petal); setTimeout(()=>petal.remove(),2000); } });
const glow = $('.cursor-glow'); window.addEventListener('pointermove', event => { glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; });
