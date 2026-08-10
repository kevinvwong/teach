/**
 * quiz-renderer.js
 *
 * Client-side IRT quiz component.
 * Loads items from item-bank.json, sends responses to /api/irt-score,
 * displays adaptive quiz with inline feedback.
 *
 * Usage: Add to any lesson HTML:
 *   <div id="quiz-container" data-item-bank="../assessments/item-bank.json"
 *        data-domain="civil-war-module-3" data-n-items="5" data-se-threshold="0.5">
 *   </div>
 *   <script src="../assessments/quiz-renderer.js" defer></script>
 */

(function () {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  const itemBankUrl = container.dataset.itemBank || '../assessments/item-bank.json';
  const domain = container.dataset.domain || '';
  const nItems = parseInt(container.dataset.nItems) || 5;
  const seThreshold = parseFloat(container.dataset.seThreshold) || 0.5;
  const apiEndpoint = container.dataset.apiEndpoint || '/api/irt-score';

  let state = {
    sessionId: crypto.randomUUID(),
    items: [],
    responses: [],
    currentIndex: 0,
    theta: 0,
    thetaSE: Infinity,
    exposedIds: new Set(),
    completed: false,
  };

  // 3PL probability
  function irt3PL(theta, a, b, c) {
    const D = 1.702;
    return c + (1 - c) / (1 + Math.exp(-D * a * (theta - b)));
  }

  // Item information function
  function itemInfo(theta, a, b, c) {
    const P = irt3PL(theta, a, b, c);
    const Q = 1 - P;
    if (P <= c || P >= 1) return 0;
    return (a * a * Q * (P - c) * (P - c)) / ((1 - c) * (1 - c) * P);
  }

  // Select next item by max Fisher information
  function selectNext(items, theta, exposed) {
    let best = null, bestInfo = -1;
    for (const item of items) {
      if (exposed.has(item.id)) continue;
      const info = itemInfo(theta, item.a, item.b, item.c);
      if (info > bestInfo) {
        bestInfo = info;
        best = item;
      }
    }
    return best;
  }

  // Render a question
  function renderQuestion(item) {
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');
    const qNum = document.getElementById('q-num');
    const qTotal = document.getElementById('q-total');

    qNum.textContent = state.currentIndex + 1;
    qTotal.textContent = nItems;

    questionEl.innerHTML = `<p>${item.stem}</p>`;

    if (item.type === 'mc' || item.type === 'tf') {
      optionsEl.innerHTML = item.options.map(opt =>
        `<label class="quiz-option">
          <input type="radio" name="quiz-answer" value="${opt.key}">
          <span>${opt.text}</span>
        </label>`
      ).join('');
    } else if (item.type === 'fr') {
      optionsEl.innerHTML = `<input type="text" id="quiz-free-response" placeholder="Type your answer...">`;
    }

    optionsEl.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', () => handleResponse(item));
    });

    feedbackEl.innerHTML = '';
    document.querySelector('.quiz-progress').style.display = 'block';
  }

  // Handle student response
  async function handleResponse(item) {
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');

    // Disable inputs
    optionsEl.querySelectorAll('input').forEach(el => el.disabled = true);

    // Get response
    let response, correct;
    if (item.type === 'mc' || item.type === 'tf') {
      const selected = optionsEl.querySelector('input[name="quiz-answer"]:checked');
      if (!selected) return;
      response = selected.value;
      correct = response === item.correct;
    } else {
      response = document.getElementById('quiz-free-response')?.value || '';
      correct = response.toLowerCase().trim() === item.correct.toLowerCase().trim();
    }

    // Show feedback
    feedbackEl.innerHTML = correct
      ? `<div class="info-box" style="border-color:var(--success)"><p><strong>Correct!</strong> The answer was ${item.correct}.</p></div>`
      : `<div class="info-box" style="border-color:var(--error)"><p><strong>Not quite.</strong> The correct answer was <strong>${item.correct}</strong>.</p></div>`;

    // Record response
    state.responses.push({
      itemId: item.id,
      response: response,
      correct: correct,
      responseTimeMs: 0
    });
    state.exposedIds.add(item.id);
    state.currentIndex++;

    // Score via API
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          itemBank: domain,
          responses: state.responses,
          currentTheta: state.theta
        })
      });

      if (res.ok) {
        const result = await res.json();
        state.theta = result.theta;
        state.thetaSE = result.thetaSE;

        if (result.sessionComplete || state.currentIndex >= nItems || state.thetaSE < seThreshold) {
          showResults();
          return;
        }
      }
    } catch (err) {
      console.warn('IRT API unavailable, continuing locally');
    }

    // Load next item
    const next = selectNext(state.items, state.theta, state.exposedIds);
    if (next && state.currentIndex < nItems) {
      setTimeout(() => renderQuestion(next), 1200);
    } else {
      setTimeout(showResults, 1200);
    }
  }

  // Show final results
  function showResults() {
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');
    const progressEl = document.querySelector('.quiz-progress');

    questionEl.innerHTML = '';
    optionsEl.innerHTML = '';
    progressEl.style.display = 'none';

    const nCorrect = state.responses.filter(r => r.correct).length;

    const bands = [
      { max: -1.5, label: 'Beginning', desc: 'Great start! Keep reviewing earlier modules.' },
      { max: -0.5, label: 'Emerging', desc: 'You\'re building a foundation. Review the areas you missed.' },
      { max: 0.5, label: 'Developing', desc: 'Solid progress! You understand the core concepts.' },
      { max: 1.5, label: 'Proficient', desc: 'Strong understanding. You\'re ready for advanced material.' },
      { max: Infinity, label: 'Advanced', desc: 'Excellent mastery! You could teach this module.' },
    ];
    const band = bands.find(b => state.theta < b.max) || bands[bands.length - 1];

    feedbackEl.innerHTML = `
      <div class="info-box">
        <h3>Quiz Complete</h3>
        <p><strong>Score:</strong> ${nCorrect}/${state.responses.length}</p>
        <p><strong>Ability estimate:</strong> ${state.theta.toFixed(2)} (SE: ${state.thetaSE.toFixed(2)})</p>
        <p><strong>Classification:</strong> ${band.label}</p>
        <p>${band.desc}</p>
      </div>
    `;
  }

  // Initialise quiz
  async function init() {
    const progressEl = document.querySelector('.quiz-progress');
    const questionEl = document.getElementById('quiz-question');

    try {
      const res = await fetch(itemBankUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const bank = await res.json();

      // Filter by domain if specified
      state.items = domain
        ? bank.items.filter(i => i.domain === domain && i.status === 'active')
        : bank.items.filter(i => i.status === 'active');

      if (state.items.length === 0) {
        questionEl.innerHTML = '<p class="warning">No items available for this quiz.</p>';
        return;
      }

      // Select first item (max info at theta=0)
      const first = selectNext(state.items, 0, state.exposedIds);
      if (first) renderQuestion(first);
    } catch (err) {
      questionEl.innerHTML = `<div class="warning-box">
        <p>Could not load quiz items. <a href="javascript:location.reload()">Try again</a></p>
      </div>`;
    }
  }

  init();
})();
