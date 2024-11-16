document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = '';

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            imagePreview.appendChild(img); 
        };
        reader.readAsDataURL(file);
    }
});
