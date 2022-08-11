## Explanation of all the DOCKER commands in details

The following commands run when the project has been initialized with the flag
`--docker` equal to `true`.


### [DOCKER] `uranio init`

List of commands:

- create `./.uranio` directory;

- create `./.uranio/.uranio.json` init file with the important parameters
`repo`, `docker`, `pacman` and their values;

- create `./src` directory and its subdirectories if do not exist;

- create `./.tmp` directory;

- clone `uranio-assets` and `uranio-schema` in `./.tmp`;

- copy from cloned `uranio-assets`: `sample.env`, `uranio.toml`, `tsconfig.json`
in `./`;

- copy `uranio-schema` to `.uranio/uranio-schema`. This is needed for text
editors that do not check types inside `node_modules`;

- create `./.env` if not exists;

- add entries to `.gitignore`;

- update `package.json` resolutions;

- Build the **image**:

	- Download the Docker file from `uranio-assets`;
	- RUN `docker build` with the following flags:
		- `-t ${image_name}` -> image_name = `<project_name>_uranio_img`
		- `-f ${docker_folder}/Dockerfile` -> `.uranio/.docker/`[`Dockerfile`](https://github.com/x71c9/uranio-assets/blob/master/docker/Dockerfile)
		- `--build-arg repo=${repo}` repo is the uranio repo [`core`, `api`, `trx`, `adm`]
		- `--build-arg project=${project}` project = <project_name>
	- Copy the compiled file:
		- `docker create --name tmp_${container_name} ${image_name}`:
		- `docker cp tmp_${container_name}:/app/node_modules node_modules`;
		> the downloaded and compiled `node_modules` files are needed in the host
		> machine in order for the text editor to work properly;
	- Remove the temporary container
		- `docker rm tmp_${container_name}`;

- Create the **container** from the image:

	- RUN `docker create` with the following flags:
		- `--network ${network_name}` network_name = `<project_name>_uranio_net`
		- `-p ${port_server}:${port_server}`
		- `-p ${port_panel}:${port_panel}`
		- `-v $(pwd)/src/:/app/src/`
		- `-v $(pwd)/.env:/app/.env`
		- `-v ${toml_path}:/app/uranio.toml`
		- `-v $(pwd)/package.json:/app/package.json`
		- `-v $(pwd)/node_modules:/app/node_modules/`
		- `-v $(pwd)/.uranio/uranio-schema/:/app/.uranio/uranio-schema/`
		- `-v $(pwd)/cert/:/app/cert/`
		- `--name ${container_name}` container_name = `<project_name>_uranio_cont`
		- ` ${image_name}` the image defined in `docker build`

- Create the **network**:

	- RUN `docker network create ${network_name}` network_name = `<project_name>_uranio_net`


- if the flag `--docker_db` is set and equal to `true` create and start the
	**DB container**:
	
	- RUN `docker create --name ${db_container_name}` with the flags:
		- `--network ${netowork_name}`
		- `-v ~/mongo/data-${project_name}:/data/db`
		- `-p 27017:27017`
		- ` mongo:5`
		
	- RUN `docker start ${db_container_name}`;


- remove `./.tmp` directory.


---


### [DOCKER] `uranio build`


---


### [DOCKER] `uranio start`

List of commands:

- RUN `docker start -i ${container_name}` container_name = `<project_name>_uranio_con`;


---


### [DOCKER] `uranio dev`

List of commands:

- RUN `docker start -i ${container_name}` container_name = `<project_name>_uranio_con`;




