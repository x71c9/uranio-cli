# Uranio toml configuration file

Uranio onfiguration file follow the [TOML](https://github.com/toml-lang/toml)
syntax for defining options.

All the options can be defined in 2 ways:

- with grouping:
```toml
[service]
	protocol = "https"
```
- with underscore
```toml
service_protocol = "https"
```
> The two methods above are equivalent.

During developing some values can be change by prefixing respectively with
`dev.` and `dev_`.

For example:

- with grouping:
```toml
[service]
	protocol = "https"
[dev.service]
	protocol = "http"
```
- with underscore
```toml
service_protocol = "https"
dev_service_protocol = "http"
```
> The two methods above are equivalent.

All the **client** options are prefixed respectively with `client.` and `client_`.

For example:

- with grouping:
```toml
[client.panel]
	protocol = "https"
[client.dev.panel]
	protocol = "http"
```
- with underscore
```toml
client_panel_protocol = "https"
client_dev_panel_protocol = "http"
```
> The two methods above are equivalent.

---

### db

This option defines the database used by Uranio.

<!-- Type: `string` | Possible values: `mongo` | Default: `mongo` -->

| Type | Default  | Possible values |
|:-----|:---------|:----------------|
| `string` | `mongo` | `mongo` |

```toml
# uranio.toml
db = "mongo"
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### token_expire_seconds

This option defines the expiration time of the authentication token in seconds.

<!-- Default: `6048000` -->

| Type | Default  |
|:-----|:---------|
| `number` | `6048000` |

```toml
# uranio.toml
token_expire_seconds = 604800 # 1 week
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### auth_cookie_expire_seconds

This option defines the expiration time of the authentication cookie in seconds.

<!-- Default: `604800` -->

| Type | Default  |
|:-----|:---------|
| `number` | `6048000` |

```toml
# uranio.toml
auth_cookie_expire_seconds = 604800 # 1 week
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### encryption_rounds

This option defines the encryption rounds when encrypting data, like password.
Uranio uses [`bcrypt`](https://github.com/kelektiv/node.bcrypt.js). In their
documentation it is defined as `the cost of processing the data`.
The first parameter of the method `.genSalt`.

All Atom's parameters of type `PropertyType.ENCRYPTED` uses the `bcrypt`
`genSalt` method for encrypting the data.

<!-- Default: `12` -->

| Type | Default  |
|:-----|:---------|
| `number` | `12` |

```toml
# uranio.toml
encryption_rounds = 12
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### max_password_length

This option defines the maximum password length for AuthAtoms.
> **Warning**
>
> Uranio has a limitation on this options, it cannot be grater than 60.

<!-- Default: `58` -->

| Type | Default  |
|:-----|:---------|
| `number` | `58` |

```toml
# uranio.toml
max_password_length = 58
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### storage

This option defines the Storage type for uploading media.

<!-- Possible values: `aws` | Default: `aws` -->

| Type | Default  | Possible values |
|:-----|:---------|:----------------|
| `string` | `aws` | `aws` |

```toml
# uranio.toml
storage = 'aws'
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### connect_on_init

This option defines if Uranio should connect to all databases on initiallization
or wait for when the first call to the database is fired.

<!-- Type: `boolean` | Default: `false` -->

| Type | Default  |
|:-----|:---------|
| `boolean` | `false` |

```toml
# uranio.toml
connect_on_init = false
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### prefix_api

This option defines the prefix in the URL of the web service that expose the API.

| Type | Default  |
|:-----|:---------|
| `string` | `/uranio/api` |

```toml
# uranio.toml
prefix_api = '/uranio/api'
```

> Valid for Uranio repos: `api`, `trx`, `adm`.

---

### prefix_log

This option defines the prefix in the URL of the web service that expose the API
for the `log` database.

| Type | Default  |
|:-----|:---------|
| `string` | `/logs` |

```toml
# uranio.toml
prefix_log = '/logs'
```

> Valid for Uranio repos: `api`, `trx`, `adm`.

---

### lambda

This option defines the type of Lambda function where Uranio will be deployed.

| Type | Default  | Possible values |
|:-----|:---------|:----------------|
| `string` | `netlify` | `netlify` |

```toml
# uranio.toml
lambda = 'netlify'
```

> Valid for Uranio repos: `api`, `trx`, `adm`.

---

### fetch

This option defines the library used for `fetch` in `uranio-trx`.

| Type | Default  | Possible values |
|:-----|:---------|:----------------|
| `string` | `axios` | `axios` |

```toml
# uranio.toml
fetch = 'axios'
```

> Valid for Uranio repos: `trx`, `adm`.

---

## [default_atoms]

### superuser

This option defines whether to install the default Atom: `superuser`.

| Type | Default  |
|:-----|:---------|
| `boolean` | `true` |

```toml
# uranio.toml
[default_atoms]
	superuser = true
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.


### group

This option defines whether to install the default Atom: `group`.

| Type | Default  |
|:-----|:---------|
| `boolean` | `true` |

```toml
# uranio.toml
[default_atoms]
	group = true
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.


### user

This option defines whether to install the default Atom: `user`.

| Type | Default  |
|:-----|:---------|
| `boolean` | `false` |

```toml
# uranio.toml
[default_atoms]
	user = false
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.


### media

This option defines whether to install the default Atom: `media`.

| Type | Default  |
|:-----|:---------|
| `boolean` | `false` |

```toml
# uranio.toml
[default_atoms]
	media = false
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.


### request

This option defines whether to install the default Atom: `request`.

| Type | Default  |
|:-----|:---------|
| `boolean` | `false` |

```toml
# uranio.toml
[default_atoms]
	request = false
```

> Valid for Uranio repos: `api`, `trx`, `adm`.


### error

This option defines whether to install the default Atom: `error`.

| Type | Default  |
|:-----|:---------|
| `boolean` | `false` |

```toml
# uranio.toml
[default_atoms]
	error = false
```

> Valid for Uranio repos: `api`, `trx`, `adm`.


### setting

This option defines whether to install the default Atom: `setting`.

| Type | Default  |
|:-----|:---------|
| `boolean` | `true` |

```toml
# uranio.toml
[default_atoms]
	setting = true
```

> Valid for Uranio repos: `adm`.

---

## [service]

### platform

This option defines the library use for generating the Web Service.

| Type | Default | Possible values |
|:-----|:--------|:----------------|
| `string` | `express` | `express` |

```toml
# uranio.toml
[service]
	platform = 'express'
```

> Valid for Uranio repos: `api`, `trx`, `adm`.

---

### protocol

This option defines the protocol used by the Web Service.

| Type | Default | Possible values |
|:-----|:--------|:----------------|
| `string` | `http` | `http`, `https` |

```toml
# uranio.toml
[service]
	protocol = 'https'
```

> Valid for Uranio repos: `api`, `trx`, `adm`.

---

### domain

This option defines the domain where the Web Service is deployed.

| Type | Default |
|:-----|:--------|
| `string` | `localhost` |

```toml
# uranio.toml
[service]
	domain = localhost
```

> Valid for Uranio repos: `trx`, `adm`.

---

### port

This option defines the port where the Web Service is deployed.

| Type | Default |
|:-----|:--------|
| `number` | `3000` |

```toml
# uranio.toml
[service]
	port = 3000
```

> Valid for Uranio repos: `api`, `trx`, `adm`.

---

### url

This option defines the full url where the Web Service is deployed. It must be
explicitly defined since it can be under a proxy.

| Type | Default |
|:-----|:--------|
| `string` | `http://localhost:7777/uranio/api` |

```toml
# uranio.toml
[service]
	url = "http://localhost:7777/uranio/api"
```

> Valid for Uranio repos: `trx`, `adm`.

---

## [client.panel]

### protocol

This option defines the protocol used by the Admin panel.

| Type | Default | Possible values |
|:-----|:--------|:----------------|
| `string` | `http` | `http`, `https` |

```toml
# uranio.toml
[client.panel]
	protocol = 'https'
```

---

> Valid for Uranio repos: `adm`.

### domain

This option defines the domain where the Admin panel is deployed.

| Type | Default |
|:-----|:--------|
| `string` | `localhost` |

```toml
# uranio.toml
[client.panel]
	domain = 'localhost'
```

> Valid for Uranio repos: `adm`.

---

> Valid for Uranio repos: `adm`.

### port

This option defines the port where the Admin panel is deployed.

| Type | Default |
|:-----|:--------|
| `string` | `express` |

```toml
# uranio.toml
[client.panel]
	port = 4444
```

> Valid for Uranio repos: `adm`.

---

## [client.service]

### url

This option defines the fetch url for the client. This must be defined entirely
since it can be proxied.

| Type | Default |
|:-----|:--------|
| `string` | `http://localhost:7777/uranio/api` |

```toml
# uranio.toml
[client.service]
	url = 'https://localhost:7777/uranio/api'
```

> Valid for Uranio repos: `adm`.

---

## [log]

### debug_info

This option defines if for each line of log also it is printed info about when
and from where the log comes.

| Type | Default |
|:-----|:--------|
| `boolean` | `false` |

```toml
# uranio.toml
[log]
	debug_info = false
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---

### color

This option defines if the log should be colored.

| Type | Default |
|:-----|:--------|
| `boolean` | `true` |

```toml
# uranio.toml
[log]
	color = true
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---


### time_format

This option defines the time format in the log `debug_info`. Check
[dateformat](https://github.com/felixge/node-dateformat) for more all the format.

| Type | Default |
|:-----|:--------|
| `string` | `yyyy-mm-dd'T'HH:MM:ss:l` |

```toml
# uranio.toml
[log]
	time_format = "yyyy-mm-dd'T'HH:MM:ss:l"
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---


### max_str_length

This option defines the max string length to be logged.

| Type | Default |
|:-----|:--------|
| `number` | `174` |

```toml
# uranio.toml
[log]
	max_str_length = 174
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---


### prefix

This option defines a string prefix to prepend to the logs.

| Type | Default |
|:-----|:--------|
| `string` | '' |

```toml
# uranio.toml
[log]
	prefix = ''
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.

---


### prefix_type

This option defines whether the log should prepend its `log_type`.

| Type | Default |
|:-----|:--------|
| `boolean` | `false` |

```toml
# uranio.toml
[log]
	prefix_type = false
```

> Valid for Uranio repos: `core`, `api`, `trx`, `adm`.


