# Hópverkefni 1, sýnilausn

## WS

Til að testa ws tengingu:

* Logga sig inn sem admin og fá token
  * `POST https://vef2-2022-h1-synilausn.herokuapp.com/users/login`
  * `{ "username": "admin", "password": "1234567890" }`
* Logga sig inn á WS fyrir admin
  * `wss://vef2-2022-h1-synilausn.herokuapp.com/admin`
  * Header `Authorization: Bearer <token>`
  * Ath þarf að refactora þ.a. token sé sent í byrjun því [WS staðall styður ekki headers almennt](https://devcenter.heroku.com/articles/websocket-security#authentication-authorization)
* Búa til körfu
  * `POST https://vef2-2022-h1-synilausn.herokuapp.com/cart`
* Bæta í körfu
  * `POST https://vef2-2022-h1-synilausn.herokuapp.com/cart/<CART UID>`
  * `{ "product": 5, "quantity": 1 }`
* Búa til pöntun úr körfu
  * `POST https://vef2-2022-h1-synilausn.herokuapp.com/orders`
  * `{ "cart": "<CART UID>", "name": "test" }`
* Sjá pöntun verða til í WS tengingu fyrir admin
* Tengjast WS fyrir client
  * `wss://vef2-2022-h1-synilausn.herokuapp.com/orders/<ORDER UID>`
* Breyta stöðu á pöntun sem admin
  * `POST https://vef2-2022-h1-synilausn.herokuapp.com/orders/<ORDER UID>`
  * `{ "status": "PREPARE" }`
* Sjá nýja stöðu koma inn á pöntunar WS

## TODO

* [x] /
* [x] /menu
  * [x] GET
  * [x] POST
  * [x] category, search
* [x] /menu/:id
  * [x] GET
  * [x] PATCH
  * [x] DELETE
* [x] /categories
  * [x] GET
  * [x] POST
* [x] /categories/:id
  * [x] GET
  * [x] PATCH
  * [x] DELETE
* [x] /cart
  * [x] POST
* [x] /cart/:cartid
  * [x] GET
  * [x] POST
  * [x] DELETE
* [x] /cart/:cartid/line/:id
  * [x] GET
  * [x] PATCH
  * [x] DELETE
* [x] /orders
  * [x] GET
  * [x] POST
* [x] /orders/:id
  * [x] GET
* [x] /orders/:id/status
  * [x] GET
  * [x] POST
* [x] /users
  * [x] GET
* [x] /users/:id
  * [x] GET
  * [x] PATCH
* [x] /users/register
  * [x] POST
* [x] /users/login
  * [x] POST
* [x] /users/me
  * [x] GET
  * [x] PATCH
* [x] orders ws
* [x] admin ws
* [ ] Docs
* [ ] nota status allstaðar, ekki state
* [ ] tests

## Myndir

* `https://unsplash.com/photos/Ae7jQFDTPk4`
* `https://unsplash.com/photos/rcUw6b4iYe0`
* `https://unsplash.com/photos/rcUw6b4iYe0`
* `https://unsplash.com/photos/PjfJWII0ivk`
* `https://unsplash.com/photos/5t4D2h3lZ74`
* `https://unsplash.com/photos/_wF6gbQIvZ8`
* `https://unsplash.com/photos/ZAiOE5lVhNM`
* `https://unsplash.com/photos/wuKMSZCGmS4`
* `https://unsplash.com/photos/jvWZYnxBDlQ`
* `https://unsplash.com/photos/kn1YORBo2DY`
* `https://unsplash.com/photos/smN1dzUTj9Y`
* `https://unsplash.com/photos/GaFDIG42370`
* `https://unsplash.com/photos/eSeo6IzOV00`
* `https://unsplash.com/photos/E38gYohvCGs`
