const navigation = document.querySelector('[data-document-toc]');

if (navigation) {
  const panel = navigation.querySelector('.document-toc__panel');
  const viewport = navigation.querySelector('.document-toc__viewport');
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const linkTargets = links
    .map((link) => {
      try {
        const id = decodeURIComponent(new URL(link.href).hash.slice(1));
        return {link, target: document.getElementById(id)};
      } catch {
        return {link, target: null};
      }
    })
    .filter(({target}) => target !== null);

  let branchId = 0;
  const setBranchExpanded = (toggle, childList, link, expanded) => {
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute(
      'aria-label',
      `「${link.textContent.trim()}」の下位項目を${expanded ? '折りたたみ' : '展開'}`,
    );
    childList.hidden = !expanded;
  };

  for (const item of [...navigation.querySelectorAll('li')]) {
    const childList = [...item.children].find((child) => child.matches('ol'));
    const link = [...item.children].find((child) => child.matches('a'));
    if (!childList || !link) continue;

    branchId += 1;
    childList.id = `document-toc-branch-${branchId}`;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'document-toc__toggle';
    toggle.setAttribute('aria-controls', childList.id);
    item.insertBefore(toggle, link);
    setBranchExpanded(toggle, childList, link, false);
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      setBranchExpanded(toggle, childList, link, !expanded);
    });
  }

  navigation.classList.add('document-toc--enhanced');

  function revealCurrentBranch(link) {
    let ancestor = link.parentElement?.parentElement;
    while (ancestor && navigation.contains(ancestor)) {
      if (ancestor.matches('ol[hidden]')) {
        const owner = ancestor.parentElement;
        const toggle = owner?.querySelector(':scope > .document-toc__toggle');
        const link = owner?.querySelector(':scope > a');
        if (toggle && link) setBranchExpanded(toggle, ancestor, link, true);
      }
      ancestor = ancestor.parentElement;
    }
  }

  function markCurrentSection() {
    let current = linkTargets[0];
    const activationLine = Math.min(180, window.innerHeight * 0.25);
    for (const candidate of linkTargets) {
      if (candidate.target.getBoundingClientRect().top <= activationLine) current = candidate;
    }

    for (const {link} of linkTargets) link.removeAttribute('aria-current');
    if (!current) return;
    current.link.setAttribute('aria-current', 'location');
    revealCurrentBranch(current.link);
  }

  let frameRequest;
  const scheduleCurrentSectionUpdate = () => {
    if (frameRequest) return;
    frameRequest = window.requestAnimationFrame(() => {
      frameRequest = undefined;
      markCurrentSection();
    });
  };

  window.addEventListener('scroll', scheduleCurrentSectionUpdate, {passive: true});
  window.addEventListener('hashchange', markCurrentSection);
  markCurrentSection();

  const narrowViewport = window.matchMedia('(max-width: 1099px)');
  if (panel && narrowViewport.matches && window.location.hash === '') panel.open = false;
  panel?.addEventListener('toggle', () => {
    if (panel.open) viewport?.scrollTo({top: 0});
  });
}
