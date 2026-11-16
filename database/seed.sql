CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO categories(name) VALUES
 ('Phones & Electronics'),('Bags'),('Books & Stationery'),('ID & Cards'),
 ('Keys'),('Clothing'),('Wallets & Money'),('Other');

INSERT INTO users(matric_no, full_name, email, phone, password_hash, role)
VALUES (NULL, 'Lost & Found Admin', 'admin@campus.edu.ng', '08000000000',
        crypt('admin1234', gen_salt('bf', 10)), 'admin');
