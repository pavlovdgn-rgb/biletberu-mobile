/** Свайп мышью для горизонтальных лент (чипсы фильтров, карусели карточек): на компьютере ленту можно взять курсором и протащить, как пальцем.
 *  Срабатывает только для мыши; ленты со своим перетаскиванием (cursor: grab — карта, билеты) не трогаем. Клик после протаскивания гасится. */
const scrollerX = (from: EventTarget | null): HTMLElement | null => {
  for (let el = from instanceof HTMLElement ? from : null; el && el !== document.body; el = el.parentElement) {
    if (el.style.cursor === 'grab') return null;
    const ox = getComputedStyle(el).overflowX;
    if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 1) return el;
  }
  return null;
};

export function installDragScroll() {
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = scrollerX(e.target); if (!el) return;
    const sx = e.clientX, left = el.scrollLeft, snap = el.style.scrollSnapType;
    let moved = false;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx;
      if (!moved && Math.abs(dx) < 5) return;
      if (!moved) { moved = true; el.style.scrollSnapType = 'none'; el.style.cursor = 'grabbing'; document.getSelection()?.removeAllRanges(); }
      el.scrollLeft = left - dx;
    };
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      if (!moved) return;
      el.style.cursor = '';
      // вернуть «примагничивание» карточек после отпускания
      requestAnimationFrame(() => { el.style.scrollSnapType = snap; });
      // клик по чипсе/карточке после протаскивания — не нажатие
      const eat = (c: MouseEvent) => { c.stopPropagation(); c.preventDefault(); };
      window.addEventListener('click', eat, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', eat, { capture: true }), 0);
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  });
  // картинки внутри лент не должны утаскиваться браузером как файл
  document.addEventListener('dragstart', (e) => { if (scrollerX(e.target)) e.preventDefault(); });
}
