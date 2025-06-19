let quizzes = [];
let quizToDelete = null;

async function loadQuizzes() {
    try {
        const response = await fetch('/api/quizzes');
        quizzes = await response.json();
        displayQuizzes();
    } catch (error) {
        console.error('Error loading quizzes:', error);
        document.getElementById('questionContainer').innerHTML = '<div class="error-message" style="display: block;">Viga küsimuste laadimisel</div>';
    }
}

function displayQuizzes() {
    const container = document.getElementById('questionContainer');
    
    if (quizzes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Küsimusi ei leitud</h3>
                <p>Pole mida kustutada.</p>
                <a href="/add" style="color: #007bff; text-decoration: none;">Lisa esimene küsimus!</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="question-grid">
            ${quizzes.map(quiz => `
                <div class="question-card">
                    <div class="question-meta">
                        <div class="question-date">
                            Created: ${new Date(quiz.created_at).toLocaleDateString()}
                        </div>
                        <button class="delete-btn" onclick="confirmDelete(${quiz.id}, '${quiz.title.replace(/'/g, "\\'")}')">
                            Kustuta
                        </button>
                    </div>
                    <div class="question-title">${quiz.title}</div>
                    <div class="question">${quiz.question}</div>
                    <div class="question-options">
                        <div class="option ${quiz.correct_answer === 'A' ? 'correct' : ''}">A: ${quiz.option_a}</div>
                        <div class="option ${quiz.correct_answer === 'B' ? 'correct' : ''}">B: ${quiz.option_b}</div>
                        <div class="option ${quiz.correct_answer === 'C' ? 'correct' : ''}">C: ${quiz.option_c}</div>
                        <div class="option ${quiz.correct_answer === 'D' ? 'correct' : ''}">D: ${quiz.option_d}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function confirmDelete(quizId, quizTitle) {
    quizToDelete = quizId;
    document.getElementById('confirmText').textContent = `Oled kindel, et soovitud kustutada"${quizTitle}"?`;
    document.getElementById('confirmDialog').style.display = 'flex';
}

async function deleteQuiz() {
    if (!quizToDelete) return;
    
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        const response = await fetch(`/api/quizzes/${quizToDelete}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            successMessage.textContent = 'Kustutamine õnnestus!';
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            
            quizzes = quizzes.filter(quiz => quiz.id !== quizToDelete);
            displayQuizzes();
            
            window.scrollTo(0, 0);
        } else {
            throw new Error('Kustutamine ebaõnnestus');
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Kustutamine ebaõnnestus, proovi uuesti!';
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        window.scrollTo(0, 0);
    } finally {
        document.getElementById('confirmDialog').style.display = 'none';
        quizToDelete = null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadQuizzes();
    
    document.getElementById('confirmYes').addEventListener('click', deleteQuiz);
    document.getElementById('confirmNo').addEventListener('click', () => {
        document.getElementById('confirmDialog').style.display = 'none';
        quizToDelete = null;
    });
    
    document.getElementById('confirmDialog').addEventListener('click', (e) => {
        if (e.target.id === 'confirmDialog') {
            document.getElementById('confirmDialog').style.display = 'none';
            quizToDelete = null;
        }
    });
});