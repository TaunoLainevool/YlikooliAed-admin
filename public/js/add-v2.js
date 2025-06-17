 let questionCount = 0;

        function showAlert(message, type = 'success') {
            const alertContainer = document.getElementById('alert-container');
            alertContainer.innerHTML = `
                <div class="alert alert-${type}">
                    ${message}
                </div>
            `;
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 5000);
        }

        function addQuestion() {
            questionCount++;
            const questionsList = document.getElementById('questions-list');
            
            const questionBlock = document.createElement('div');
            questionBlock.className = 'question-block';
            questionBlock.id = `question-${questionCount}`;
            
            questionBlock.innerHTML = `
                <div class="question-header">
                    <span class="question-number">Question ${questionCount}</span>
                    <button type="button" class="remove-question" onclick="removeQuestion(${questionCount})">🗑️ Remove</button>
                </div>
                
                <div class="form-group">
                    <label>Question Text *</label>
                    <input type="text" class="question-text" required placeholder="Enter your question...">
                </div>
                
                <div class="form-group">
                    <label>Points</label>
                    <input type="number" class="question-points" value="1" min="1" max="10">
                </div>
                
                <div class="options-container">
                    <label>Answer Options *</label>
                    <div class="options-list" id="options-${questionCount}">
                        ${createOptionHTML(questionCount, 1)}
                        ${createOptionHTML(questionCount, 2)}
                        ${createOptionHTML(questionCount, 3)}
                    </div>
                    <button type="button" class="add-option" onclick="addOption(${questionCount})">➕ Add Option</button>
                </div>
            `;
            
            questionsList.appendChild(questionBlock);
        }

        function createOptionHTML(questionId, optionId) {
            return `
                <div class="option-block" id="option-${questionId}-${optionId}">
                    <input type="checkbox" class="correct-checkbox" title="Mark as correct answer">
                    <input type="text" class="option-input" placeholder="Enter option text..." required>
                    <button type="button" class="remove-option" onclick="removeOption(${questionId}, ${optionId})" ${optionId <= 3 ? 'style="display:none"' : ''}>✖️</button>
                </div>
            `;
        }

        function addOption(questionId) {
            const optionsList = document.getElementById(`options-${questionId}`);
            const optionCount = optionsList.children.length + 1;
            
            const optionBlock = document.createElement('div');
            optionBlock.className = 'option-block';
            optionBlock.id = `option-${questionId}-${optionCount}`;
            optionBlock.innerHTML = createOptionHTML(questionId, optionCount).replace(/id="option-\d+-\d+"/, `id="option-${questionId}-${optionCount}"`);
            
            optionsList.appendChild(optionBlock);
        }

        function removeOption(questionId, optionId) {
            const optionBlock = document.getElementById(`option-${questionId}-${optionId}`);
            if (optionBlock) {
                optionBlock.remove();
            }
        }

        function removeQuestion(questionId) {
            const questionBlock = document.getElementById(`question-${questionId}`);
            if (questionBlock) {
                questionBlock.remove();
            }
        }

        // Initialize with one question
        addQuestion();

        // Form submission
        document.getElementById('quiz-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('quiz-title').value;
            const description = document.getElementById('quiz-description').value;
            
            const questions = [];
            const questionBlocks = document.querySelectorAll('.question-block');
            
            for (const block of questionBlocks) {
                const questionText = block.querySelector('.question-text').value;
                const points = parseInt(block.querySelector('.question-points').value) || 1;
                
                const options = [];
                const optionBlocks = block.querySelectorAll('.option-block');
                
                let hasCorrectAnswer = false;
                for (const optionBlock of optionBlocks) {
                    const optionText = optionBlock.querySelector('.option-input').value;
                    const isCorrect = optionBlock.querySelector('.correct-checkbox').checked;
                    
                    if (optionText.trim()) {
                        options.push({
                            option_text: optionText,
                            is_correct: isCorrect
                        });
                        
                        if (isCorrect) hasCorrectAnswer = true;
                    }
                }
                
                if (!hasCorrectAnswer) {
                    showAlert('Each question must have at least one correct answer!', 'error');
                    return;
                }
                
                if (options.length < 2) {
                    showAlert('Each question must have at least 2 options!', 'error');
                    return;
                }
                
                questions.push({
                    question_text: questionText,
                    points: points,
                    options: options
                });
            }
            
            if (questions.length === 0) {
                showAlert('Please add at least one question!', 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/quizzes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: title,
                        description: description,
                        questions: questions
                    })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showAlert('Quiz created successfully! 🎉', 'success');
                    // Reset form after 2 seconds
                    setTimeout(() => {
                        document.getElementById('quiz-form').reset();
                        document.getElementById('questions-list').innerHTML = '';
                        questionCount = 0;
                        addQuestion();
                    }, 2000);
                } else {
                    showAlert(result.error || 'Failed to create quiz', 'error');
                }
            } catch (error) {
                showAlert('Network error. Please try again.', 'error');
            }
        });


 /*
 
 // Get all quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, 
             COUNT(qu.id) as question_count 
      FROM minigames q 
      LEFT JOIN questions qu ON q.id = qu.minigame_id 
      GROUP BY q.id 
      ORDER BY q.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get quiz with questions and options
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Get quiz details
    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Get questions with options
    const questionsResult = await pool.query(`
      SELECT q.*, 
             json_agg(
               json_build_object(
                 'id', qo.id,
                 'option_text', qo.option_text,
                 'is_correct', qo.is_correct,
                 'option_order', qo.option_order
               ) ORDER BY qo.option_order
             ) as options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE q.quiz_id = $1
      GROUP BY q.id
      ORDER BY q.id
    `, [quizId]);
    
    const quiz = {
      ...quizResult.rows[0],
      questions: questionsResult.rows
    };
    
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Create new quiz with questions and options
app.post('/api/quizzes', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { title, description, questions } = req.body;
    
    // Validate input
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question are required' });
    }
    
    // Create quiz
    const quizResult = await client.query(
      'INSERT INTO quizzes (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    const quiz = quizResult.rows[0];
    
    // Create questions and options
    for (const question of questions) {
      if (!question.question_text || !question.options || question.options.length < 2) {
        throw new Error('Each question must have text and at least 2 options');
      }
      
      // Create question
      const questionResult = await client.query(
        'INSERT INTO questions (quiz_id, question_text, question_type, points) VALUES ($1, $2, $3, $4) RETURNING *',
        [quiz.id, question.question_text, question.question_type || 'multiple_choice', question.points || 1]
      );
      const questionId = questionResult.rows[0].id;
      
      // Create options
      for (let i = 0; i < question.options.length; i++) {
        const option = question.options[i];
        await client.query(
          'INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES ($1, $2, $3, $4)',
          [questionId, option.option_text, option.is_correct || false, i]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json({ message: 'Quiz created successfully', quiz });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to create quiz' });
  } finally {
    client.release();
  }
});

// Update quiz
app.put('/api/quizzes/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const quizId = req.params.id;
    const { title, description, questions } = req.body;
    
    // Update quiz
    await client.query(
      'UPDATE quizzes SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [title, description, quizId]
    );
    
    // Delete existing questions and options (cascade will handle options)
    await client.query('DELETE FROM questions WHERE quiz_id = $1', [quizId]);
    
    // Recreate questions and options
    for (const question of questions) {
      const questionResult = await client.query(
        'INSERT INTO questions (quiz_id, question_text, question_type, points) VALUES ($1, $2, $3, $4) RETURNING *',
        [quizId, question.question_text, question.question_type || 'multiple_choice', question.points || 1]
      );
      const questionId = questionResult.rows[0].id;
      
      for (let i = 0; i < question.options.length; i++) {
        const option = question.options[i];
        await client.query(
          'INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES ($1, $2, $3, $4)',
          [questionId, option.option_text, option.is_correct || false, i]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Quiz updated successfully' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  } finally {
    client.release();
  }
});

// Delete quiz
app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    const quizId = req.params.id;
    const result = await pool.query('DELETE FROM quizzes WHERE id = $1 RETURNING *', [quizId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Serve the quiz creation page
app.get('/create-quiz', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'create-quiz.html'));
});  
