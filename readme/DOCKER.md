## Explanation of the DOCKER commands in details

Uranio have some utility commands for running inside a Docker container.
This is not the only way for running Uranio inside a container but it is the
recommended one.

Uranio build only one Docker image, but creates different containers
according with the command and the `--prod` flag.

The Uranio image has the name in the format: `<project_name>_uranio_img`.

The Uranio containers have the name in the format: `<project_name>_uranio_con_<command>`.

The Uranio containers for production have the name in the format:
`<project_name>_uranio_con_<command>_prod`.

---

### $ `uranio docker start`

| Flag | Description |
|:-----|:---------|
| `--prod` | To use for production |

When running both `uranio docker start` the following happens:

- if the Uranio image does not exist it builds it [Same as `uranio docker build`];
- if the Uranio container does not exist it creates it;
- it starts the container.

The container created run the command: `uranio start`.

---

### $ `uranio docker dev`

| Flag | Description |
|:-----|:---------|
| `--prod` | To use for production |

When running both `uranio docker dev` the following happens:

- if the Uranio image does not exist it builds it [Same as `uranio docker build`];
- if the Uranio container does not exist it creates it;
- if it is the first time it has been called, it copies the `node_modules` dir
from the Uranio image to the host machine;
> This is needed because some libraries, when installed, will have
> platform-specific binary executable.
- it starts the container.

The container created run the command: `uranio dev`.

Uranio also create the container with the following volumes:
- ` -v $(pwd)/src/:/app/src/`;
- ` -v $(pwd)/.env:/app/.env`;
- ` -v ${toml_path}:/app/uranio.toml`;
- ` -v $(pwd)/package.json:/app/package.json`;
- ` -v $(pwd)/node_modules/:/app/node_modules/`;
- ` -v $(pwd)/.uranio/uranio-schema:/app/.uranio/uranio-schema`;
- ` -v $(pwd)/cert/:/app/cert/`;

This allow to have a correspondence between the host and the container files,
so that if something change in the host will also change in the container.

The command `uranio dev` make possible also to restart the services when a file
changed.

---

### $ `uranio docker build`

| Flag | Description |
|:-----|:---------|
| `--docker_load` | Same as `--output=type=docker` in Docker |

This is the command that builds the Uranio image. The Docker commands is:

```bash
docker build --ssh default \
	-t <project_name>_uranio_img \
	-f .uranio/.docker/Dockerfile \
	--build-arg repo=<repo>
	--build-arg project=<project_name>
```

The flag `--load` allow to keep the image locally when building with `buildx`.

---

The following commands are less common to use but still available.

### $ `uranio docker stop`

This command stops all Uranio running containers.


### $ `uranio docker push`

This command allow to push the image to the Docker Registry.


### $ `uranio docker prune`

This command stops and deletes all the created containers, images and networks.
It also deletes the build cache.


### $ `uranio docker unbuild`

This command deletes the Uranio image.


### $ `uranio docker db start`

When running `uranio docker db start` the following happens:

- if the Uranio DB image does not exist it builds it;
- if the Uranio DB container does not exist it creates it;
- it starts the container.

> For now only `mongo` DB is available.


### $ `uranio docker db stop`

This command stop the Uranio DB container.


### $ `uranio docker db remove`

This command remove the Uranio DB container.

