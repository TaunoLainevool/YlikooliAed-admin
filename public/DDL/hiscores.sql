CREATE TABLE IF NOT EXISTS scores
(
    id SERIAL PRIMARY KEY,
    player_name character varying(50) NOT NULL,
    score integer NOT NULL,
    game_mode character varying(30),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);