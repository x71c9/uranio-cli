# Uranio .env configuration file

As environmental configuration file Uranio uses
[`.env`](https://github.com/motdotla/dotenv)

All Uranio variable starts with `URN_`.

It is possible to add any other configuration variables with any name key.

---

### URN_LOG_LEVEL

This key defines Uranio log level.

Type: `string`

Possible values: `NONE` | `ERROR` | `WARNING` | `INFO` | `DEBUG` | `TRACE`

```toml
# .env
URN_LOG_LEVEL=TRACE
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URANIO_MONGO_MAIN_CONNECTION

This key defines the MongoDB connection for the `main` database.

Type: `string`

```toml
# .env
URN_MONGO_MAIN_CONNECTION=mongodb+srv://local:<password>@cluster0.k3dqu.mongodb.net
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URANIO_MONGO_TRASH_CONNECTION

This key defines the MongoDB connection for the `trash` database.

Type: `string`

```toml
# .env
URN_MONGO_TRASH_CONNECTION=mongodb+srv://local:<password>@cluster0.k3dqu.mongodb.net
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URANIO_MONGO_LOG_CONNECTION

This key defines the MongoDB connection for the `log` database.

Type: `string`

```toml
# .env
URN_MONGO_LOG_CONNECTION=mongodb+srv://local:<password>@cluster0.k3dqu.mongodb.net
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_DB_MAIN_NAME

This key defines the MongoDB `main` database name.

Type: `string`

```toml
# .env
URN_DB_MAIN_NAME=uranio_dev
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_DB_TRASH_NAME

This key defines the MongoDB `trash` database name.

Type: `string`

```toml
# .env
URN_DB_TRASH_NAME=uranio_trash_dev
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_DB_LOG_NAME

This key defines the MongoDB `log` database name.

Type: `string`

```toml
# .env
URN_DB_LOG_NAME=uranio_log_dev
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_SUPERUSER_CREATE_ON_INIT

This key defines if Uranio should create a `_superuser` when initializing.
Useful for generating the first account with credentials.

Type: `boolean`

```toml
# .env
URN_SUPERUSER_CREATE_ON_INIT=true
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_SUPERUSER_EMAIL

This key defines `_superuser` email. (See `URN_SUPERUSER_CREATE_ON_INIT`).

Type: `string`

```toml
# .env
URN_SUPERUSER_EMAIL=email@email.com
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_SUPERUSER_PASSWORD

This key defines `_superuser` password. (See `URN_SUPERUSER_CREATE_ON_INIT`).

Type: `string`

```toml
# .env
URN_SUPERUSER_PASSWORD=averylongandsecurepassword
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_JWT_PRIVATE_KEY

This key defines the JWT private key for encrypting/decrypting the JTW tokens.

Type: `string`

```toml
# .env
URN_JWT_PRIVATE_KEY=averylongandsecurestring
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_AWS_BUCKET_NAME

This key defines the AWS bucket name.

Type: `string`

```toml
# .env
URN_AWS_BUCKET_NAME=my-bucket
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_AWS_BUCKET_REGION

This key defines the AWS bucket region.

Type: `string`

```toml
# .env
URN_AWS_BUCKET_REGION=eu-south-1
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_AWS_USER_ACCESS_KEY_ID

This key defines the AWS user access key ID.

Type: `string`

```toml
# .env
URN_AWS_USER_ACCESS_KEY_ID=[AWSACCESSID]
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_AWS_USER_SECRET_ACCESS_KEY

This key defines the AWS user secret access key.

Type: `string`

```toml
# .env
URN_AWS_USER_SECRET_ACCESS_KEY=[AWSSECRETSTRING]
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### URN_SSL_CERTIFICATE

This key defines the SSL certificate path.

Type: `string`

```toml
# .env
URN_SSL_CERTIFICATE=/path/to/cert.crt
```

> Valid for Uranio repos: `api`, `trx`, `adm`.

---

### URN_SSL_KEY

This key defines the SSL certificate key path.

Type: `string`

```toml
# .env
URN_SSL_KEY=/path/to/cert.key
```

> Valid for Uranio repos: `api`, `trx`, `adm`.

---
