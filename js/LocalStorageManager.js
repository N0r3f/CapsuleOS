class LocalStorageManager {
 constructor() {
    if (!window.localStorage) {
      console.error('LocalStorage is not supported by this browser.');
    }
 }

 // Stocker une valeur
 setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
 }

 // Récupérer une valeur
 getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error retrieving from localStorage:', error);
      return null;
    }
 }

 // Supprimer une valeur
 removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
 }

 // Supprimer toutes les valeurs
 clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
 }
}

// Utilisation de la classe LocalStorageManager
const storageManager = new LocalStorageManager();

// Exemple d'utilisation
storageManager.setItem('color', 'Pink');
console.log(storageManager.getItem('color')); // Affiche "Pink"
storageManager.removeItem('color');
console.log(storageManager.getItem('color')); // Affiche null
