'use strict';
window.CAPSULE_DISTRO_PROFILE = {
    name: 'Rocky Linux',
    version: '10 — GNOME',
    tagline: 'Distribution entreprise compatible RHEL, pour serveurs et postes de travail.',
    description: 'Rocky Linux est une reconstruction communautaire de Red Hat Enterprise Linux, maintenue par RESF. L\'édition GNOME Workstation partage le même socle que Fedora (RPM, DNF, GNOME Shell) avec une politique de stabilité orientée entreprise.',
    logo: './assets/images/vendors/debian/debian-logo.svg',
    logoAlt: 'Logo Rocky Linux',
    url: 'https://kalilinux.org/',
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
