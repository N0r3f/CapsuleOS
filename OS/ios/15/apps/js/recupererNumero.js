document.addEventListener('DOMContentLoaded', function () {
    var callButton = document.getElementById('call-button');
    callButton.addEventListener('click', function (e) {
        e.preventDefault(); // Empêche le comportement par défaut du lien
        var numero = document.getElementById('input').value; // Récupère la valeur de l'input
        window.location.href = "appel.html?numero=" + encodeURIComponent(numero); // Redirige vers appel.html avec le numéro
    });
});