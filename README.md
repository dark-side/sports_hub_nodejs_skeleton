# Sports-Hub Application Node.js Back-End

## Project Description

This is a draft pet project for testing Generative AI on different software engineering tasks. It is planned to evolve and grow over time. Specifically, this repo will be a Node.JS playground.

The application's legend is based on the sports-hub application description from the following repo: [Sports-Hub](https://github.com/dark-side/sports-hub).

## Available Front-End applications
- [Angular.js](https://github.com/dark-side/sports_hub_angular_skeleton)
- [React.js](https://github.com/dark-side/sports_hub_react_skeleton)

## Dependencies

- Docker
- Docker Compose

The mentioned dependencies can be installed using the official documentation [here](https://docs.docker.com/compose/install/).
Read more about alternatives to Docker [here](https://github.com/dark-side/sports_hub_angular_skeleton/blob/main/READMORE_DockerAlternatives.md).

## Setup and Running the Application

### Clone the Repositories

To run the web application with the Angular front-end, clone the following repositories within the same folder:

```sh
git clone git@github.com:dark-side/sports_hub_nodejs_skeleton.git
git clone git@github.com:dark-side/sports_hub_angular_skeleton.git
```

### Run Docker Compose

Navigate to the back-end application directory and run (`-d` for detached mode to run in the background):

```sh
docker compose up -d
```

### Attach to the Backend Container

Run `docker ps` and copy the `backend` application container ID. Then, connect to the container with the following command:

```sh
docker exec -ti <CONTAINER ID> /bin/bash
```

### Running on Windows (Tips & Tricks)
- beep boop

### Accessing the Application
To access the application in a browser locally, open the following URL:
- Mac, Linux - `http://localhost:3000/`
- Windows - `http://127.0.0.1:3000/`

## License

Licensed under either of

- [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
- [MIT license](http://opensource.org/licenses/MIT)

Just to let you know, at your option.

## Contribution
Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in your work, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

**Should you have any suggestions, please create an Issue for this repository**