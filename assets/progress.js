/* progress.js — localStorage-backed lesson completion tracker.
   Used by both lessons (mark-complete button) and index.html (progress display). */

const STORAGE_KEY = 'ai-curriculum-progress';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function setComplete(lessonId, done = true) {
  const progress = getProgress();
  if (done) {
    progress[lessonId] = true;
  } else {
    delete progress[lessonId];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent('progress-change', { detail: { lessonId, done } }));
}

function isComplete(lessonId) {
  return !!getProgress()[lessonId];
}

/* Initialises the mark-complete button on a lesson page.
   Call with the lesson's unique id (e.g. "0001-numpy-arrays"). */
function initMarkComplete(lessonId) {
  const btn = document.getElementById('btn-complete');
  if (!btn) return;

  function render() {
    const done = isComplete(lessonId);
    btn.textContent = done ? '✓ Completed' : 'Mark as complete';
    btn.classList.toggle('completed', done);
    btn.disabled = done;
  }

  btn.addEventListener('click', () => {
    setComplete(lessonId, true);
    render();
  });

  render();
}

export { getProgress, setComplete, isComplete, initMarkComplete };
