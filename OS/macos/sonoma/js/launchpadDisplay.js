document.addEventListener('DOMContentLoaded', function () {
    const footer = document.querySelector('footer');
    const padContainer = document.querySelector('.padContainer');
    const padSearchBar = document.querySelector('.search');
    const padFooter = document.querySelector('.launchPadFoot');
    const padIcons = padContainer.querySelectorAll('a');
    const windowElements = document.getElementsByClassName('windowElement');

    let isDisplayed = true;

    function toggleVisibility(event) {
        if (event.target.matches('a[data-link]')) {
            event.preventDefault();

            document.querySelectorAll('.windowElement').forEach(elements => {
                elements.style.display = 'none';
            });

            const targetElement = document.querySelector(`div[data-link="${event.target.dataset.link}"]`);
            if (targetElement) {
                targetElement.style.display = 'block';
            }

            // Toggle the visibility of padContainer, padSearchBar, and padFooter
            isDisplayed = !isDisplayed;
            padContainer.style.display = isDisplayed ? 'block' : 'none';
            padSearchBar.style.display = isDisplayed ? 'block' : 'none';
            padFooter.style.display = isDisplayed ? 'block' : 'none';
        }
    }

    footer.addEventListener('click', toggleVisibility);
    if(isDisplayed == true){
    padIcons.forEach(padIcon => {
        padIcon.addEventListener('click', e => {
            isDisplayed = false;
            padContainer.style.display = 'none'; // Hide padContainer when padIcon is clicked
            padSearchBar.style.display = 'none'; // Hide padSearchBar when padIcon is clicked
            padFooter.style.display = 'none'; // Hide padFooter when padIcon is clicked
            // Set backdropFilter to none for all windowElements
            Array.from(windowElements).forEach(windowElement => {
                windowElement.style.backdropFilter = 'none';
            });
        });
    });}
    else
    {
        padIcons.forEach(padIcon => {
            padIcon.addEventListener('click', e => {
                isDisplayed = false;
                padContainer.style.display = 'block'; // Hide padContainer when padIcon is clicked
                padSearchBar.style.display = 'block'; // Hide padSearchBar when padIcon is clicked
                padFooter.style.display = 'block'; // Hide padFooter when padIcon is clicked
                // Set backdropFilter to none for all windowElements
                Array.from(windowElements).forEach(windowElement => {
                    windowElement.style.backdropFilter = '40px';
                });
            });
        });}
    });
