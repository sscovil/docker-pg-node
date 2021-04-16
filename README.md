# Docker/PostgreSQL/Node Tutorial

Follow these instructions to create a simple Node.js application that runs in a Docker container and
connects to a PostgreSQL database running in a separate Docker container.

## Prerequisites (MacOS)

### Docker Desktop - https://docs.docker.com/docker-for-mac/install/

* Download correct installer for your Mac
    * To determine which chip you have (Intel or Apple), click Apple icon then About This Mac
    * In the Overview tab, you should see the chip manufacturer listed
* Double-click Docker.dmg to open installer, then drag Docker icon to Applications folder
* Double-click Docker.app in Applications folder to start Docker
* Docker menu in top status bar indicates Docker Desktop is running & accessible from Terminal
* Click Docker menu (whale icon) to see Preferences & other options
* From Terminal, run `docker -v` and `docker-compose -v` to confirm installation

### Node Version Manager (NVM) - https://github.com/nvm-sh/nvm

* From Terminal, run `touch ~/.zshrc`
* Run `xcode-select -p` to ensure X-Code Command Line Tools are installed
    * If not, start Xcode on the Mac 
    * Choose Preferences from Xcode menu
    * In General panel, click Downloads
    * On Downloads window, choose Components tab
    * Click Install button next to Command Line Tools
* Run `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash`
* Close Terminal window, open new Terminal window, then run `nvm -v` to confirm installation

### Node v14.16.1 & Node Package Manager (NPM) - https://nodejs.org/dist/latest-v14.x/docs/api/

* From Terminal, run `nvm install v14.16.1` and go grab a coffee
* In project root directory, run `nvm use` to use this Node version (based on `.nvmrc` file)
* Run `node -v` to confirm node version
* NPM is automatically installed with Node

### Node Modules

* From Terminal in project root directory, run `npm install`

## Getting Started

To start the Docker containers with PostgreSQL and the HTTP server, open a Terminal window and navigate
to the root directory of this project, then run:

```shell
docker-compose up -d
```

To check the status of the containers, run:

```shell
docker-compose ps
```

This command should produce an output like this:

```shell
          Name                         Command                  State               Ports         
--------------------------------------------------------------------------------------------------
docker-pg-node_api_1        docker-entrypoint.sh ./bin ...   Up (healthy)   0.0.0.0:5000->5000/tcp
docker-pg-node_database_1   docker-entrypoint.sh postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
```

To view the server logs for a container, run:

```shell
docker-compose logs api
```

_Note: Replace `api` with `database` to view the logs for the PostgreSQL server._

To stop the containers without deleting them, run:

```shell
docker-compose stop
```

If you want to delete the containers and clean up after yourself, run:

```shell
docker-compose down --remove-orphans -v
```

## Documentation

* Node.js v14.16.1 - https://nodejs.org/dist/latest-v14.x/docs/api/index.html
* Node PostgreSQL Library - https://node-postgres.com/features/queries
* Docker Compose Commands - https://docs.docker.com/compose/reference/overview/
