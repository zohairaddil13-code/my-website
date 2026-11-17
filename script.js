(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollProgress = document.querySelector('.scroll-progress > span');

    if (scrollProgress) {
        let progressFrame = 0;
        const updateScrollProgress = () => {
            if (progressFrame) return;
            progressFrame = window.requestAnimationFrame(() => {
                const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
                scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
                progressFrame = 0;
            });
        };

        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        window.addEventListener('resize', updateScrollProgress);
        updateScrollProgress();
    }

    const heroVisual = document.querySelector('.hero-visual');
    const browserFrame = heroVisual?.querySelector('.browser-frame');

    if (
        heroVisual &&
        browserFrame
    ) {
        let pointerFrame = 0;
        let pointerX = 0;
        let pointerY = 0;

        const resetPointer = () => {
            heroVisual.classList.remove('is-pointer-active');
            heroVisual.style.setProperty('--pointer-x', '50%');
            heroVisual.style.setProperty('--pointer-y', '50%');
            heroVisual.style.setProperty('--tilt-x', '2deg');
            heroVisual.style.setProperty('--tilt-y', '0deg');
            heroVisual.style.setProperty('--shift-x', '0px');
            heroVisual.style.setProperty('--shift-y', '0px');
            heroVisual.style.setProperty('--glow-shift-x', '0px');
            heroVisual.style.setProperty('--glow-shift-y', '0px');
            heroVisual.querySelectorAll('[data-pointer-depth]').forEach(element => {
                element.style.translate = '0px 0px';
            });
        };

        heroVisual.addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse') return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                resetPointer();
                return;
            }

            const bounds = heroVisual.getBoundingClientRect();
            pointerX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
            pointerY = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));

            if (pointerFrame) return;
            pointerFrame = window.requestAnimationFrame(() => {
                const horizontal = pointerX * 2 - 1;
                const vertical = pointerY * 2 - 1;
                heroVisual.classList.add('is-pointer-active');
                heroVisual.style.setProperty('--pointer-x', `${(pointerX * 100).toFixed(1)}%`);
                heroVisual.style.setProperty('--pointer-y', `${(pointerY * 100).toFixed(1)}%`);
                heroVisual.style.setProperty('--tilt-x', `${(2 - vertical * 5).toFixed(2)}deg`);
                heroVisual.style.setProperty('--tilt-y', `${(horizontal * 7).toFixed(2)}deg`);
                heroVisual.style.setProperty('--shift-x', `${(horizontal * 5).toFixed(1)}px`);
                heroVisual.style.setProperty('--shift-y', `${(vertical * 4).toFixed(1)}px`);
                heroVisual.style.setProperty('--glow-shift-x', `${(-horizontal * 2.5).toFixed(1)}px`);
                heroVisual.style.setProperty('--glow-shift-y', `${(-vertical * 2).toFixed(1)}px`);
                heroVisual.querySelectorAll('[data-pointer-depth]').forEach(element => {
                    const depth = Number(element.dataset.pointerDepth);
                    element.style.translate = `${(-horizontal * depth).toFixed(1)}px ${(-vertical * depth).toFixed(1)}px`;
                });
                pointerFrame = 0;
            });
        });

        heroVisual.addEventListener('pointerleave', resetPointer);
    }

    const revealTargets = document.querySelectorAll(
        '.section-heading, .feature-card, .tour-shell, .screenshot-card, .privacy-note, .detail-card, .setup-steps > li, .faq-list details, .closing'
    );

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -36px 0px' });

        revealTargets.forEach((element, index) => {
            element.classList.add('scroll-reveal');
            element.style.setProperty('--reveal-delay', `${(index % 3) * 90}ms`);
            revealObserver.observe(element);
        });
    }

    const root = document.querySelector('[data-tour]');
    if (root) {
        const steps = [
            {
                id: 'sale',
                kicker: 'STEP 01 · CHECKOUT',
                title: 'A smoother sale, start to finish.',
                description: 'Find products by name, SKU, or barcode. Build the cart, review the total, choose a payment method, and complete checkout.',
                items: ['Search or scan a product.', 'Review items, customer, discount, and tax.', 'Choose payment and complete the sale.']
            },
            {
                id: 'combo',
                kicker: 'STEP 02 · COMBOS',
                title: 'Bring related products together.',
                description: 'Choose active component products, set their quantities, and give the bundle a single selling price.',
                items: ['Create and stock the component products.', 'Set each included quantity.', 'Save the bundle; availability follows component stock.']
            },
            {
                id: 'barcode',
                kicker: 'STEP 03 · BARCODE LABELS',
                title: 'Make products easier to scan.',
                description: 'Use an assigned barcode or generate a unique internal EAN-13, then print a test label from the browser.',
                items: ['Find the item in Products.', 'Create an internal barcode if needed.', 'Print at actual size on matching label stock.']
            },
            {
                id: 'print',
                kicker: 'STEP 04 · PRINTING',
                title: 'Send each print job where it belongs.',
                description: 'Print from the browser or configure network printers for receipts, store copies, and kitchen tickets.',
                items: ['Connect a supported printer on the private network.', 'Configure the printer type and address.', 'Send a test print and keep a manual fallback.']
            },
            {
                id: 'offline',
                kicker: 'STEP 05 · OFFLINE REGISTER',
                title: 'Keep checkout moving through an outage.',
                description: 'Prepare the register while online, use its saved catalog during an outage, then review and sync queued sales.',
                items: ['Prepare the offline register and catalog online.', 'Sell from the same device and browser.', 'Reconnect, review the queue, and sync safely.']
            }
        ];
        const tabs = [...root.querySelectorAll('[data-tour-tab]')];
        const panels = [...root.querySelectorAll('[data-tour-panel]')];
        const kicker = root.querySelector('#tour-kicker');
        const heading = root.querySelector('#tour-heading');
        const description = root.querySelector('#tour-description');
        const list = root.querySelector('#tour-steps');
        const progress = root.querySelector('#tour-progress');
        const playButton = root.querySelector('[data-tour-play]');
        let activeIndex = 0;
        let timer;

        function stopPlayback() {
            window.clearInterval(timer);
            timer = undefined;
            playButton.setAttribute('aria-pressed', 'false');
            playButton.textContent = 'Play tour';
        }

        function showStep(index) {
            activeIndex = (index + steps.length) % steps.length;
            const step = steps[activeIndex];
            tabs.forEach((tab, tabIndex) => {
                const active = tabIndex === activeIndex;
                tab.classList.toggle('is-active', active);
                tab.setAttribute('aria-selected', String(active));
                tab.tabIndex = active ? 0 : -1;
            });
            panels.forEach(panel => {
                panel.hidden = panel.dataset.tourPanel !== step.id;
            });
            kicker.textContent = step.kicker;
            heading.textContent = step.title;
            description.textContent = step.description;
            list.replaceChildren(...step.items.map(text => {
                const item = document.createElement('li');
                item.textContent = text;
                return item;
            }));
            progress.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                stopPlayback();
                showStep(index);
            });
            tab.addEventListener('keydown', event => {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                event.preventDefault();
                const direction = event.key === 'ArrowRight' ? 1 : -1;
                const nextIndex = (index + direction + steps.length) % steps.length;
                stopPlayback();
                showStep(nextIndex);
                tabs[nextIndex].focus();
            });
        });

        root.querySelector('[data-tour-prev]').addEventListener('click', () => {
            stopPlayback();
            showStep(activeIndex - 1);
        });
        root.querySelector('[data-tour-next]').addEventListener('click', () => {
            stopPlayback();
            showStep(activeIndex + 1);
        });
        playButton.addEventListener('click', () => {
            if (timer) {
                stopPlayback();
                return;
            }
            playButton.setAttribute('aria-pressed', 'true');
            playButton.textContent = 'Pause tour';
            timer = window.setInterval(() => showStep(activeIndex + 1), 5000);
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopPlayback();
        });
        showStep(0);
    }

    const dialog = document.querySelector('.image-dialog');
    if (dialog instanceof HTMLDialogElement) {
        const image = dialog.querySelector('img');
        const caption = dialog.querySelector('p');
        document.querySelectorAll('.image-trigger[data-image]').forEach(button => {
            button.addEventListener('click', () => {
                const preview = button.querySelector('img');
                image.src = button.dataset.image;
                image.alt = preview.alt;
                caption.textContent = button.dataset.caption || preview.alt;
                dialog.showModal();
            });
        });
        dialog.addEventListener('click', event => {
            if (event.target === dialog) dialog.close();
        });
    }
})();
