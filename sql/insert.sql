-- Þar sem við þurfum að búa til fá gögn.. gerum bara í höndunum!
-- Slóðir á myndir sem voru *handuploadaðar*
INSERT INTO
  categories (title)
VALUES
  ('Sterk'),
  ('Vegan'),
  ('Grænmetis'),
  ('Vinsæl'),
  ('Kjöt');

INSERT INTO
  products
  (title, price, description, image, category)
VALUES
  ('Pepperoni pizza', 2500, 'Klassísk kjötpizza', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263923/vef2-2022-h1/vita-marija-murenaite-eSeo6IzOV00-unsplash.jpg', 5),
  ('Bláa pizzan', 1200, 'Þorir þú að smakka hina rosalega bláu pizzu?', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263923/vef2-2022-h1/roam-in-color-smN1dzUTj9Y-unsplash.jpg', 2),
  ('Hálfmáninn', 3200, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263923/vef2-2022-h1/roberto-valdivia-rcUw6b4iYe0-unsplash.jpg', 5),
  ('Grænagummsið', 1, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263923/vef2-2022-h1/rizwan-ahmed-E38gYohvCGs-unsplash.jpg', 1),
  ('Kryddaða pizzan', 1, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263923/vef2-2022-h1/noemi-macavei-katocz-_wF6gbQIvZ8-unsplash.jpg', 3),
  ('Fína pizzan', 9990, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263923/vef2-2022-h1/pinar-kucuk-Ae7jQFDTPk4-unsplash.jpg', 3),
  ('Paprikupizza', 1, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263923/vef2-2022-h1/ram-ho-GaFDIG42370-unsplash.jpg', 2),
  ('Eina með öllu', 1, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263923/vef2-2022-h1/natasha-reddy-ZAiOE5lVhNM-unsplash.jpg', 5),
  ('Tómatar tómatar tómatar', 1, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263922/vef2-2022-h1/leigh-skomal-kn1YORBo2DY-unsplash.jpg', 1),
  ('Lista pizzan', 1, 'Listilega góð eða ekki? Ef þú tímir að smakka getur þú komist að því.', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263922/vef2-2022-h1/cierra-henderson-y6OcnIC58RM-unsplash.jpg', 1),
  ('Pizza', 1, 'Bara venjulega pizza, því stundum er það allt sem við þurfum', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263922/vef2-2022-h1/chad-montano-MqT0asuoIcU-unsplash.jpg', 5),
  ('Brennda pizzzan', 1, 'Okkur tekst bara ekki að ekki brenna þessa', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263922/vef2-2022-h1/clara-lacerda-wuKMSZCGmS4-unsplash.jpg', 4),
  ('Ostapizza', 1, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263922/vef2-2022-h1/klara-kulikova-jvWZYnxBDlQ-unsplash.jpg', 3),
  ('Grænmetisveisla', 1, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263922/vef2-2022-h1/jonas-jacobsson-PjfJWII0ivk-unsplash.jpg', 2),
  ('Skakka pizzan', 1, '', 'https://res.cloudinary.com/dhy3vquyz/image/upload/v1646263922/vef2-2022-h1/bahram-bayat-5t4D2h3lZ74-unsplash.jpg', 1);

-- admin/1234567890
INSERT INTO
  users (username, email, password, admin)
VALUES
  ('admin', 'admin@example.org', '$2b$04$5XvV1IIubvtw.RI3dMmDPumdpr9GQlUM.yWVbUxaRqu/3exbw3mke', true);
