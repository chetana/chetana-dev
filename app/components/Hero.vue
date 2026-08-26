<template>
  <section class="hero">
    <div class="hero-text">
      <span class="hero-badge"><span class="badge-dot" aria-hidden="true"></span>{{ t('hero.badge') }}</span>

      <h1 class="hero-title">Chetana <span class="accent">YIN</span></h1>

      <div class="hero-role">
        <span>{{ t('hero.role1') }}</span>
        <span class="sep" aria-hidden="true"></span>
        <span>{{ t('hero.role2') }}</span>
      </div>

      <p class="hero-subtitle" v-html="t('hero.desc')" />

      <div class="hero-cta">
        <NuxtLink to="/contact" class="btn btn-primary">{{ t('hero.cta1') }}</NuxtLink>
        <a href="#experience" class="btn btn-outline">{{ t('hero.cta2') }}</a>
        <NuxtLink to="/cv" class="btn btn-outline">{{ t('hero.cta3') }}</NuxtLink>
      </div>
    </div>

    <div class="hero-visual">
      <div class="panel-stack">
        <div class="panel-back" aria-hidden="true"></div>

        <div class="terminal" role="img" :aria-label="t('hero.terminalAria')">
          <div class="term-chrome">
            <div class="term-dots"><span></span><span></span><span></span></div>
            <div class="term-tabs">
              <span class="term-tab active"><span class="dot-small"></span>sales-copilot</span>
              <span class="term-tab">rls-audit</span>
              <span class="term-tab">djust-cockpit</span>
            </div>
          </div>

          <div class="term-body">
            <div class="term-line user l1"><span class="prompt-marker" aria-hidden="true"></span><span>{{ t('hero.term1') }}</span></div>
            <div class="term-line l2"><span class="term-comment">&nbsp;&nbsp;// {{ t('hero.term2') }}</span></div>
            <div class="term-line l3"><span class="term-tool">grep_policy(<span class="term-key">table</span>=<span class="term-str">"accounts"</span>, <span class="term-key">tenant</span>=<span class="term-key">true</span>)</span></div>
            <div class="term-line l4"><span>&nbsp;&nbsp;↳ <span v-html="t('hero.term4')" /></span></div>
            <div class="term-line l5"><span class="term-tool"><span class="term-ok" aria-hidden="true">✓</span> <span v-html="t('hero.term5')" /></span></div>
            <div class="term-line l6"><span class="term-comment">&nbsp;&nbsp;// {{ t('hero.term6') }}</span></div>
            <div class="term-line l7"><span class="prompt-marker" aria-hidden="true"></span><span>{{ t('hero.term7') }}<span class="term-caret" aria-hidden="true"></span></span></div>
          </div>

          <div class="term-footer">
            <span class="branch"><span class="status-dot" aria-hidden="true"></span>feat/rls-multi-tenant</span>
            <span>LangGraph · claude-sonnet</span>
          </div>
        </div>

        <div class="floating-tag tag-1"><span class="fdot" aria-hidden="true"></span>{{ t('hero.tag1') }}</div>
        <div class="floating-tag tag-2"><span class="fdot" aria-hidden="true"></span>{{ t('hero.tag2') }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useLocale()
</script>

<style scoped>
.hero {
  --espresso: #2a1f18;
  --espresso-2: #35281e;
  --espresso-line: rgba(245, 239, 230, 0.10);
  --amber: #e2a15b;
  --amber-soft: #d99a58;
  --mint-ok: #9ec49a;
  --border-soft: rgba(44, 24, 16, 0.12);
  --shadow-warm: 0 30px 60px -25px rgba(139, 58, 31, 0.35), 0 10px 24px -12px rgba(44, 24, 16, 0.25);

  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(0, 1fr);
  align-items: center;
  gap: 2.5rem;
  min-height: 100vh;
  padding: 7rem 3.5rem 3rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 20% 40%, rgba(196, 150, 60, 0.06) 0%, transparent 45%);
  animation: drift 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-2%, 2%); }
}

/* ── Left: text column ─────────────────────────────────────────── */
.hero-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1.1rem 0.4rem 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--accent-light);
  letter-spacing: 0.02em;
  opacity: 0;
  animation: rise 0.7s cubic-bezier(.19, 1, .22, 1) 0.05s forwards;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--mint-ok);
  animation: pulse-dot 2.4s ease-in-out infinite;
}

.hero-title {
  font-family: 'Fraunces', serif;
  font-weight: 450;
  font-size: clamp(2.6rem, 4.6vw, 4.4rem);
  line-height: 1.02;
  letter-spacing: -0.01em;
  margin: 0;
  color: var(--text);
  opacity: 0;
  animation: rise 0.75s cubic-bezier(.19, 1, .22, 1) 0.16s forwards;
}

.hero-title .accent {
  font-weight: 600;
  font-style: italic;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.hero-role {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  opacity: 0;
  animation: rise 0.7s cubic-bezier(.19, 1, .22, 1) 0.24s forwards;
}

.hero-role .sep {
  width: 22px;
  height: 1px;
  background: var(--accent);
  display: inline-block;
}

.hero-subtitle {
  font-size: 1.08rem;
  line-height: 1.65;
  color: var(--text-muted);
  max-width: 50ch;
  margin: 0;
  opacity: 0;
  animation: rise 0.75s cubic-bezier(.19, 1, .22, 1) 0.32s forwards;
}

.hero-subtitle :deep(strong) {
  color: var(--text);
  font-weight: 700;
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 0.25rem;
  opacity: 0;
  animation: rise 0.75s cubic-bezier(.19, 1, .22, 1) 0.42s forwards;
}

/* ── Right: cockpit terminal mockup ────────────────────────────── */
.hero-visual {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 420px;
  opacity: 0;
  animation: rise-scale 0.9s cubic-bezier(.19, 1, .22, 1) 0.3s forwards;
}

.panel-stack {
  position: relative;
  width: 100%;
  max-width: 440px;
}

.panel-back {
  position: absolute;
  inset: 0;
  top: 22px;
  left: 24px;
  right: -18px;
  background: var(--bg-card-hover);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  transform: rotate(2.5deg);
  z-index: 0;
}

.terminal {
  position: relative;
  z-index: 1;
  background: linear-gradient(160deg, var(--espresso), var(--espresso-2));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-warm);
  transform: rotate(-1.4deg);
  overflow: hidden;
  border: 1px solid rgba(226, 161, 91, 0.16);
}

.term-chrome {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: rgba(0, 0, 0, 0.14);
  border-bottom: 1px solid var(--espresso-line);
}

.term-dots {
  display: flex;
  gap: 0.44rem;
  flex: 0 0 auto;
}

.term-dots span {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  display: inline-block;
}

.term-dots span:nth-child(1) { background: #e0765c; }
.term-dots span:nth-child(2) { background: var(--amber); }
.term-dots span:nth-child(3) { background: #8fb894; }

.term-tabs {
  display: flex;
  gap: 0.375rem;
  overflow: hidden;
}

.term-tab {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: rgba(245, 239, 230, 0.5);
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.term-tab.active {
  background: rgba(226, 161, 91, 0.15);
  color: var(--amber);
  font-weight: 600;
}

.term-tab .dot-small {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}

.term-body {
  padding: 1.25rem 1.25rem 1.375rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.79rem;
  line-height: 1.72;
  color: rgba(245, 239, 230, 0.82);
}

.term-line {
  display: flex;
  gap: 0.625rem;
  opacity: 0;
  animation: type-in 0.45s ease forwards;
}

.term-line.l1 { animation-delay: 0.9s; }
.term-line.l2 { animation-delay: 1.15s; }
.term-line.l3 { animation-delay: 1.4s; }
.term-line.l4 { animation-delay: 1.65s; }
.term-line.l5 { animation-delay: 1.9s; }
.term-line.l6 { animation-delay: 2.15s; }
.term-line.l7 { animation-delay: 2.4s; }

.prompt-marker {
  color: var(--amber);
  flex: 0 0 auto;
  font-weight: 600;
}

.term-line.user .prompt-marker::before { content: "❯"; }
.term-line.user { color: #f2e8dc; font-weight: 500; }

.term-comment { color: rgba(245, 239, 230, 0.42); }

.term-tool {
  background: rgba(226, 161, 91, 0.09);
  border-left: 2px solid var(--amber);
  padding: 0.5rem 0.625rem;
  border-radius: 0 6px 6px 0;
  margin: 0.125rem 0;
  color: rgba(245, 239, 230, 0.68);
  display: block;
}

.term-body :deep(.term-key) { color: var(--amber-soft); }
.term-body :deep(.term-str) { color: #c9d6a3; }
.term-body :deep(.term-ok) { color: var(--mint-ok); }
.term-key { color: var(--amber-soft); }
.term-str { color: #c9d6a3; }
.term-ok { color: var(--mint-ok); }

.term-caret {
  display: inline-block;
  width: 7px;
  height: 15px;
  background: var(--amber);
  margin-left: 2px;
  vertical-align: middle;
  opacity: 0;
  animation: blink 1.1s step-end infinite, reveal 0.1s linear 2.65s forwards;
}

.term-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.25rem;
  background: rgba(0, 0, 0, 0.16);
  border-top: 1px solid var(--espresso-line);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.66rem;
  color: rgba(245, 239, 230, 0.45);
}

.term-footer .branch {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.term-footer .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--mint-ok);
}

.floating-tag {
  position: absolute;
  z-index: 2;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 11px;
  padding: 0.56rem 0.8rem;
  box-shadow: var(--shadow-md);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.44rem;
  animation: float 5s ease-in-out infinite;
}

.floating-tag.tag-1 { top: -16px; right: 14px; animation-delay: 0.2s; }
.floating-tag.tag-2 { bottom: -14px; left: -14px; animation-delay: 1.2s; }

.floating-tag .fdot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: var(--gradient);
}

/* ── Animations ─────────────────────────────────────────────────── */
@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes rise-scale {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes type-in {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes reveal {
  to { opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@media (prefers-reduced-motion: reduce) {
  .hero *,
  .hero::before {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .hero-badge, .hero-title, .hero-role, .hero-subtitle, .hero-cta, .hero-visual, .term-line, .term-caret {
    opacity: 1 !important;
  }
}

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 1180px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 5rem 2.5rem 2.5rem;
    gap: 3.5rem;
    min-height: 0;
  }
  .hero-visual { order: -1; min-height: auto; padding-top: 0.5rem; }
  .panel-stack { max-width: 480px; margin: 0 auto; }
}

@media (max-width: 768px) {
  .hero {
    padding: calc(var(--mobile-bar-height, 56px) + 2rem) 1.5rem 2rem;
  }
  .hero-title { font-size: clamp(2.1rem, 9vw, 3rem); }
}

@media (max-width: 480px) {
  .hero-cta { flex-direction: column; align-items: stretch; }
  .hero-cta .btn { justify-content: center; }
  .panel-back { display: none; }
  .term-body { font-size: 0.72rem; }
  .floating-tag { display: none; }
}
</style>
