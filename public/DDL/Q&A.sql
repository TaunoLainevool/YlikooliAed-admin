CREATE TABLE IF NOT EXISTS quizzes
(
    id SERIAL PRIMARY KEY,
    title character varying(255)  NOT NULL,
    question text NOT NULL,
    option_a character varying(255) NOT NULL,
    option_b character varying(255) NOT NULL,
    option_c character varying(255) NOT NULL,
    option_d character varying(255) NOT NULL,
    correct_answer character(1)   NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
