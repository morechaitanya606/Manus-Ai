# 17. UML (Text Representation)

## 17.1 Use Case

Customer:

- Login
- Browse Products
- Checkout

Admin:

- Manage Products
- Manage Orders

## 17.2 Sequence - Login

```text
Client -> API
API -> DB
DB -> API
API -> JWT
JWT -> Client
```

## 17.3 Sequence - Order

```text
Client -> Create Order
API -> Save Order
API -> Response
```

## 17.4 Class Diagram

```text
User
Product
Order

User 1..* Order
Order *..* Product
```
