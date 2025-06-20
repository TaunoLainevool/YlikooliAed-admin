async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        const result = await response.json();

        if (result.userId) {
            document.getElementById('userId').textContent = result.userId;
            document.getElementById('username').textContent = result.username;
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        window.location.href = '/';
    }
}

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });

        if (response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);

async function loadQuizzes() {
    try {
        const response = await fetch('/api/quizzes');
        const quizzes = await response.json();
        const container = document.getElementById('quizContainer');
        //console.log(response);
        
        if (quizzes.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">Pole küsimusi. <a href="/add">Lisa esimene küsimus!</a></p>';
            return;
        }
        
        container.innerHTML = quizzes.slice(0, 5).map(quiz => `
            <div class="quiz-item">
                <div class="quiz-title">${quiz.title}</div>
                <div class="quiz-question">${quiz.question}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Viga küsimuste laadmisel:', error);
        document.getElementById('quizContainer').innerHTML = '<p style="color: red; text-align: center;">Viga küsimuste laadmisel</p>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadQuizzes();
});