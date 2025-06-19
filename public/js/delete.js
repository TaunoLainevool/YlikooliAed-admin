let quizzes = [];
let filteredQuizzes = [];
let quizToDelete = null;

async function loadQuizzes() {
    try {
        const response = await fetch('/api/quizzes');
        quizzes = await response.json();
        filteredQuizzes = [...quizzes];
        displayQuizzes();
        updateSearchStats();
    } catch (error) {
        console.error('Error loading quizzes:', error);
        document.getElementById('questionContainer').innerHTML = '<div class="error-message" style="display: block;">Viga küsimuste laadimisel</div>';
    }
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
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
    
    if (filteredQuizzes.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>🔍 Otsingule vastavaid küsimusi ei leitud</h3>
                <p>Proovi teist otsinguterminit või kustuta filter.</p>
            </div>
        `;
        return;
    }
    
    const searchTerm = document.getElementById('filterBox').value;
    
    container.innerHTML = `
        <div class="question-grid">
            ${filteredQuizzes.map(quiz => `
                <div class="question-card">
                    <div class="question-meta">
                        <div class="question-date">
                            Created: ${new Date(quiz.created_at).toLocaleDateString()}
                        </div>
                        <button class="delete-btn" onclick="confirmDelete(${quiz.id}, '${quiz.title.replace(/'/g, "\\'")}')">
                            Kustuta
                        </button>
                    </div>
                    <div class="question-title">${highlightText(quiz.title, searchTerm)}</div>
                    <div class="question">${highlightText(quiz.question, searchTerm)}</div>
                    <div class="question-options">
                        <div class="option ${quiz.correct_answer === 'A' ? 'correct' : ''}">A: ${highlightText(quiz.option_a, searchTerm)}</div>
                        <div class="option ${quiz.correct_answer === 'B' ? 'correct' : ''}">B: ${highlightText(quiz.option_b, searchTerm)}</div>
                        <div class="option ${quiz.correct_answer === 'C' ? 'correct' : ''}">C: ${highlightText(quiz.option_c, searchTerm)}</div>
                        <div class="option ${quiz.correct_answer === 'D' ? 'correct' : ''}">D: ${highlightText(quiz.option_d, searchTerm)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function updateSearchStats() {
    const statsElement = document.getElementById('filterStats');
    const searchTerm = document.getElementById('filterBox').value;
    
    if (searchTerm) {
        statsElement.textContent = `Leitud ${filteredQuizzes.length} küsimust ${quizzes.length}-st`;
        statsElement.style.display = 'block';
    } else {
        statsElement.textContent = `Kokku ${quizzes.length} küsimust`;
        statsElement.style.display = quizzes.length > 0 ? 'block' : 'none';
    }
}

function filterQuizzes() {
    const searchTerm = document.getElementById('filterBox').value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredQuizzes = [...quizzes];
    } else {
        filteredQuizzes = quizzes.filter(quiz => {
            return quiz.title.toLowerCase().includes(searchTerm) ||
                   quiz.question.toLowerCase().includes(searchTerm) ||
                   quiz.option_a.toLowerCase().includes(searchTerm) ||
                   quiz.option_b.toLowerCase().includes(searchTerm) ||
                   quiz.option_c.toLowerCase().includes(searchTerm) ||
                   quiz.option_d.toLowerCase().includes(searchTerm);
        });
    }
    
    displayQuizzes();
    updateSearchStats();
}

function confirmDelete(quizId, quizTitle) {
    quizToDelete = quizId;
    document.getElementById('confirmText').textContent = `Oled kindel, et soovitud kustutada "${quizTitle}"?`;
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
            filteredQuizzes = filteredQuizzes.filter(quiz => quiz.id !== quizToDelete);
            
            displayQuizzes();
            updateSearchStats();
            
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
    
    const searchBox = document.getElementById('filterBox');
    let searchTimeout;
    
    searchBox.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterQuizzes, 300); 
    });
    
    searchBox.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            filterQuizzes();
        }
    });
    
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