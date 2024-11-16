document.querySelector('.comments-button').addEventListener('click', () => {
    const commentsContainer = document.querySelector('.comments-container');
    commentsContainer.style.display = commentsContainer.style.display === 'block' ? 'none' : 'block';
});
