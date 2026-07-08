'use strict';
window.CAPSULE_DISTRO_PROFILE = {
    name: 'AlmaLinux',
    version: '10 — GNOME',
    tagline: 'Distribution entreprise RHEL-compatible, communauté AlmaLinux OS Foundation.',
    description: 'AlmaLinux est une distribution libre compatible RHEL, maintenue par la fondation AlmaLinux OS. L\'édition GNOME Workstation reprend le socle RPM/DNF avec une politique de stabilité long terme.',
    logo: './assets/images/vendors/alma/alma-logo.svg',
    logoAlt: 'Logo AlmaLinux',
    url: 'https://almalinux.org/',
    stats: {
        ease: 3,
        community: 4,
        support: 4,
    },
    highlights: [
        { icon: 'GNOME', text: 'Bureau GNOME Workstation (dock vertical, aperçu activités)' },
        { icon: 'RPM', text: 'Paquets RPM et DNF — même famille que Fedora et RHEL' },
        { icon: 'Entreprise', text: 'Cible serveurs et postes en environnement professionnel' },
        { icon: 'Lab', text: 'Parité visée avec la VM lab documentée (Wayland + Xwayland)' },
    ],
};
