let currentEditId = null;
let allQuestions = [];
let searchResults = [];

document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    
    const searchInput = document.getElementById('searchText');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 300);
        });
    }
});

document.getElementById('questionFormElement').addEventListener('submit', handleFormSubmit);

async function loadQuestions() {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('questionsList').innerHTML = '';

    try {
        const response = await fetch('/api/quizzes');
        const questions = await response.json();

        allQuestions = questions;
        searchResults = [...allQuestions];

        document.getElementById('loadingSpinner').style.display = 'none';
        displayQuestions(questions);
    } catch (error) {
        document.getElementById('loadingSpinner').style.display = 'none';
        console.error('Error loading questions:', error);
        document.getElementById('questionsList').innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Viga küsimuste laadimisel, palun proovi uuesti.</p>';
    }
}

function displayQuestions(questions) {
    const container = document.getElementById('questionsList');

    if (questions.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Küsimusi pole. Lisa uus küsimus!</p>';
        return;
    }

    container.innerHTML = questions.map(q => `
                <div class="question-item">
                    <div class="question-title">${escapeHtml(q.title)}</div>
                    <div class="question-text">${escapeHtml(q.question)}</div>
                    <div class="question-options">
                        <div class="option ${q.correct_answer === 'A' ? 'correct' : ''}">A: ${escapeHtml(q.option_a)}</div>
                        <div class="option ${q.correct_answer === 'B' ? 'correct' : ''}">B: ${escapeHtml(q.option_b)}</div>
                        <div class="option ${q.correct_answer === 'C' ? 'correct' : ''}">C: ${escapeHtml(q.option_c)}</div>
                        <div class="option ${q.correct_answer === 'D' ? 'correct' : ''}">D: ${escapeHtml(q.option_d)}</div>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-edit" onclick="editQuestion(${q.id})">Muuda</button>
                    </div>
                </div>
            `).join('');
}

function performSearch() {
    const searchText = document.getElementById('searchText').value.toLowerCase().trim();
    
    if (!searchText) {

        searchResults = [...allQuestions];
        hideSearchInfo();
        displayQuestions(searchResults);
    } else {

        searchResults = allQuestions.filter(question => {
            const titleMatch = question.title.toLowerCase().includes(searchText);
            const questionMatch = question.question.toLowerCase().includes(searchText);
            const optionAMatch = question.option_a.toLowerCase().includes(searchText);
            const optionBMatch = question.option_b.toLowerCase().includes(searchText);
            const optionCMatch = question.option_c.toLowerCase().includes(searchText);
            const optionDMatch = question.option_d.toLowerCase().includes(searchText);
            
            return titleMatch || questionMatch || optionAMatch || optionBMatch || optionCMatch || optionDMatch;
        });
        
        updateSearchResultsDisplay();
        displayQuestions(searchResults);
    }
}

function updateSearchResultsDisplay() {
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const searchResultCount = document.getElementById('searchResultCount');
    const noSearchResults = document.getElementById('noSearchResults');
    
    if (searchResults.length > 0) {
        searchResultCount.textContent = searchResults.length;
        searchResultsInfo.style.display = 'block';
        noSearchResults.style.display = 'none';
    } else {
        searchResultsInfo.style.display = 'none';
        noSearchResults.style.display = 'block';
    }
}

function hideSearchInfo() {
    document.getElementById('searchResultsInfo').style.display = 'none';
    document.getElementById('noSearchResults').style.display = 'none';
}

async function editQuestion(id) {
    try {
        const response = await fetch(`/api/quizzes/${id}`);
        const question = await response.json();

        currentEditId = id;
        document.getElementById('submitBtn').textContent = 'Uuenda';
        document.getElementById('questionId').value = id;
        document.getElementById('title').value = question.title;
        document.getElementById('question').value = question.question;
        document.getElementById('option_a').value = question.option_a;
        document.getElementById('option_b').value = question.option_b;
        document.getElementById('option_c').value = question.option_c;
        document.getElementById('option_d').value = question.option_d;
        document.getElementById('correct_answer').value = question.correct_answer;

        document.getElementById('questionForm').classList.add('active');
        document.getElementById('title').focus();
    } catch (error) {
        console.error('Viga küsimuste laadimisel:', error);
        alert('Viga küsimuste laadimisel');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        title: document.getElementById('title').value,
        question: document.getElementById('question').value,
        option_a: document.getElementById('option_a').value,
        option_b: document.getElementById('option_b').value,
        option_c: document.getElementById('option_c').value,
        option_d: document.getElementById('option_d').value,
        correct_answer: document.getElementById('correct_answer').value
    };

    try {
        let response;
        if (currentEditId) {
            response = await fetch(`/api/quizzes/${currentEditId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            hideForm();
            await loadQuestions();
        } else {
            alert('Viga küsimuse salvestamisel!');
        }
    } catch (error) {
        console.error('Viga küsimuse salvestamisel:', error);
        alert('Viga küsimuse salvestamisel!');
    }
}

function hideForm() {
    document.getElementById('questionForm').classList.remove('active');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}