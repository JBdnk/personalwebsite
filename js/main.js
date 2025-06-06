function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
});

const phrases = [
  'I build stuff that works (most of the time)',
  'Automating the boring with AI, so you don’t have to',
  'Creating visuals that actually get noticed (hopefully)',
  'I also sell stuff online',
  'Hire me before I realize my rates should go up',
];

const typingSpeed = 50; 
const erasingSpeed = 50;
const delayBetween = 1500;  

const typingElement = document.getElementById('typing-text');


if (typingElement) {
  typingElement.style.whiteSpace = 'nowrap';
  typingElement.style.display = 'inline-block';
  typingElement.style.margin = '0 auto';
  typingElement.style.textAlign = 'center';
}

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
  const currentPhrase = phrases[phraseIndex];

  if (!isDeleting) {
    typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentPhrase.length) {
      isDeleting = true;
      setTimeout(type, delayBetween);
    } else {
      setTimeout(type, typingSpeed);
    }
  } else {
    typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(type, typingSpeed);
    } else {
      setTimeout(type, erasingSpeed);
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  if (typingElement) {
    type();
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.message-form');
  const textarea = form ? form.querySelector('textarea') : null;
  const button = form ? form.querySelector('button[type="submit"]') : null;
  const RATE_LIMIT_MINUTES = 30;
  const LAST_SENT_KEY = 'anonMessageLastSent';

  function checkRateLimit() {
    const lastSent = localStorage.getItem(LAST_SENT_KEY);
    if (lastSent) {
      const now = Date.now();
      const diff = now - parseInt(lastSent, 10);
      if (diff < RATE_LIMIT_MINUTES * 60 * 1000) {
        const minutesLeft = Math.ceil((RATE_LIMIT_MINUTES * 60 * 1000 - diff) / 60000);
        button.disabled = true;
        textarea.disabled = true;
        button.textContent = `Wait ${minutesLeft} min to send again`;
        return true;
      }
    }
    button.disabled = false;
    textarea.disabled = false;
    button.textContent = 'Send 💌';
    return false;
  }

  if (form && textarea && button) {
    checkRateLimit();
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (checkRateLimit()) {
        return false;
      }
      button.disabled = true;
      textarea.disabled = true;
      button.textContent = 'Sending...';
      try {
        const response = await fetch('https://formspree.io/f/mrbkeewg', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: textarea.value })
        });
        if (response.ok) {
          localStorage.setItem(LAST_SENT_KEY, Date.now().toString());
          button.textContent = 'Sent!';
          textarea.value = '';
        } else {
          button.textContent = 'Error! Try again';
          textarea.disabled = false;
        }
      } catch (err) {
        button.textContent = 'Error! Try again';
        textarea.disabled = false;
      }
      setTimeout(checkRateLimit, 1000); 
    });
    setInterval(checkRateLimit, 10000); 
  }
});