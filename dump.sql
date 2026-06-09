CREATE DATABASE AutoSchool;

CREATE TABLE Role_a (
    id SERIAL PRIMARY KEY,
    name varchar(255) NOT NULL
);

CREATE TABLE Transport (
    id SERIAL PRIMARY KEY,
    name varchar(255) NOT NULL
);

CREATE TABLE User_a (
    id SERIAL PRIMARY KEY,
    login varchar(25) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    fcs varchar(255) NOT NULL,
    email varchar(254) NOT NULL UNIQUE,
    phone varchar(25) NOT NULL,
    date_of_birth date NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES Role_a(id)
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    status varchar(255) NOT NULL,
    user_id integer NOT NULL,
    methods_of_payment varchar(55),
    start_time timestamp,
    transport_id integer NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES User_a(id),
    CONSTRAINT fk_transport FOREIGN KEY (transport_id) REFERENCES Transport(id)
);

INSERT INTO Role_a (name) VALUES ('Пользователь'), ('Администратор'), ('Менеджер');

INSERT INTO Transport (name) VALUES ('Автобус'), ('Электробус'), ('Трамвай');

-- Админка

-- Добавляем статусы, если их нет
ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'Новая';

-- Обновляем существующие статусы
UPDATE applications SET status = 'Новая' WHERE status NOT IN ('Новая', 'Идет обучение', 'Обучение завершено');

--отзывы

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    application_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES User_a(id),
    CONSTRAINT fk_review_application FOREIGN KEY (application_id) REFERENCES applications(id)
);