if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('service worker registered', reg))
    .catch(er => console.log("sw not registered", er));
}







