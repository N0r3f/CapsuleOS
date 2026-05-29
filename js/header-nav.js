(function () {
    const anchorCenter = new Set(['a-propos']);

    const getHeaderOffset = () => {
        const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head')) || 40;
        return head * 1.5;
    };

    const scrollToPickWithFooter = () => {
        const pick = document.getElementById('choisir-os');
        const footer = document.querySelector('.footer');
        if (!pick) return;

        const headerOffset = getHeaderOffset();
        const pickTop = pick.getBoundingClientRect().top + window.scrollY;
        const blockBottom = footer
            ? footer.getBoundingClientRect().bottom + window.scrollY
            : pick.getBoundingClientRect().bottom + window.scrollY;
        const viewport = window.innerHeight;
        const blockHeight = blockBottom - pickTop;
        const maxScroll = document.documentElement.scrollHeight - viewport;

        let top = pickTop - headerOffset;

        if (blockHeight + headerOffset <= viewport) {
            top = Math.max(pickTop - headerOffset, blockBottom - viewport);
        }

        window.scrollTo({
            top: Math.max(0, Math.min(top, maxScroll)),
            behavior: 'smooth'
        });
    };

    const closeMobileMenu = () => {
        const mobileMenu = document.getElementById('header-mobile-menu');
        const menuToggle = document.getElementById('header-menu-toggle');
        if (!mobileMenu?.open) return;
        mobileMenu.close();
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    };

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const id = decodeURIComponent(href.slice(1));
        const target = document.getElementById(id);
        if (!target) return;

        link.addEventListener('click', (event) => {
            event.preventDefault();
            closeMobileMenu();

            if (id === 'choisir-os') {
                scrollToPickWithFooter();
            } else {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: anchorCenter.has(id) ? 'center' : 'start',
                    inline: 'nearest'
                });
            }

            history.pushState(null, '', href);
        });
    });

    const menuToggle = document.getElementById('header-menu-toggle');
    const menuClose = document.getElementById('header-menu-close');
    const mobileMenu = document.getElementById('header-mobile-menu');

    if (!mobileMenu || !menuToggle) return;

    const closeMenu = () => {
        mobileMenu.close();
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', () => {
        mobileMenu.showModal();
        menuToggle.setAttribute('aria-expanded', 'true');
    });

    if (menuClose) {
        menuClose.addEventListener('click', closeMenu);
    }

    mobileMenu.addEventListener('click', (event) => {
        if (event.target === mobileMenu) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileMenu.open) closeMenu();
    });

    if (location.hash === '#choisir-os' || new URLSearchParams(location.search).has('pick')) {
        requestAnimationFrame(() => scrollToPickWithFooter());
    }
})();
