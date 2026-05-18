
document.querySelectorAll('.menuHeader li').forEach(function (li) {
        li.addEventListener('click', function (event) {
                var sousMenu = this.querySelector('.listeSousMenu');
                if (sousMenu.style.display === 'none') {
                        sousMenu.style.display = 'block';
                } else {
                        sousMenu.style.display = 'none';
                }
        });
});