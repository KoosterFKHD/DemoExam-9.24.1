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

INSERT INTO User_a (login, password, FCs, Email, Phone, Date_of_birth, role_id) VALUES
('Rabaka_Vadim','123123','Рабака Вадим Сергеевич','RabakaVadim@mail.ru','+71111111111','02-04-2008', 1),
('Petrin_Bob','123123','Петрин Боб Александрович','PetrinBob@mail.ru','+72222222222','01-02-2003', 2),
('Gogin_Zen','123123','Гогин Зен Сидорович','GoginZen@mail.ru','+73333333333','03-02-2001', 3);

INSERT INTO applications (status, user_id, methods_of_payment, start_time, transport_id) VALUES
('Ожидает подтверждения', 1, 'Банконская карта', '2026-05-12 09:41:00', 1),
('Выполняется', 2, 'Банконская карта', '2026-10-07 14:26:10', 2),
('Завершена', 3, 'Банконский перевод', '2026-04-02 18:57:15', 3);

-- Админка

-- Добавляем статусы, если их нет
ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'Новая';

-- Обновляем существующие статусы
UPDATE applications SET status = 'Новая' WHERE status NOT IN ('Новая', 'Идет обучение', 'Обучение завершено');

--Тестовые заявки

INSERT INTO applications (status, user_id, methods_of_payment, start_time, transport_id) VALUES
('Новая', 1, 'Банковская карта', NOW(), 1),
('Идет обучение', 2, 'Наличные', NOW(), 2),
('Обучение завершено', 3, 'Банковский перевод', NOW(), 3);

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

--ТЕСТОВЫЕ ЗАЯВКИ

INSERT INTO applications (status, user_id, methods_of_payment, start_time, transport_id) VALUES
('Новая', 1, 'Банковская карта', NOW(), 1),
('Идет обучение', 2, 'Наличные', NOW(), 2),
('Обучение завершено', 3, 'Банковский перевод', NOW(), 3);

--ТЕСТОВЫЕ ОТЗЫВЫ

INSERT INTO reviews (user_id, application_id, rating, review_text, created_at) VALUES
(1, 1, 5, 'Отличная автошкола! Инструкторы профессионалы. Всё понравилось!', NOW()),
(2, 2, 4, 'Хорошее обучение, но немного долго записывали на практику.', NOW()),
(3, 3, 5, 'Спасибо большое! Сдал экзамен с первого раза!', NOW());