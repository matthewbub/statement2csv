# Debugging in Docker

> TODO: We need to create a valid env for these containers to run in isolation due to the breaking change at `utils.GetPDFServiceURL`
> Docker Compose is the only way to work in staging

## TLDR

These are the steps to launch the containers individually. We've since moved to docker-compose.

### Run the core application

To run the app on docker:

1. **Build the Image**
   ```sh
   docker build -t zcauldron .
   ```
2. **Run the Container**
   ```sh
   docker run \
      -e ENV=staging \
      -e SESSION_SECRET_KEY=your_secret_key_here \
      -e OPENAI_API_KEY=your_openai_key_here \
      -p 8080:8080 zcauldron
   ```

Next, we need to launch the lib/image micro service

### Build the `lib/image` Python Service

1. **Build the Image**
   ```sh
   docker build -t pdf-service -f lib/image/Dockerfile lib/image/
   ```
2. **Run the Container**
   ```sh
   docker run -p 8082:8082 pdf-service
   ```

## The deets

If you're a core maintainer of this project, understanding how to **debug** the docker containers is essential. Particularly if you are planning on working in "staging" or "production" environments and want to understand what's happening behind the scenes.

Note I said **debug**, because you don't have to know how to read/write Dockerfile's. That part should be good. The two core bits of information I hope to convey with this document are:

- If there's an error in the application, the error log can be found in the Docker Container.
- If you make a change to the application code, you'll need to rebuild and rerun your Docker Container.

## Consider this

**You don't want to run a particular service**

You haven't ran a python Application in ages, no idea what environment is available on your current machine and you really can't be bothered to brush the dust off . The solution? Just run the Docker Image to establish a local Docker Container and avoid all the headache. (You'd just have to rebuild the docker image between changes, no big deal really.)

## Getting Familiar with Docker Containers

Docker is great because it's just like working on your own localhost. You know how in Next.js you have a few npm scripts available in your `package.json` by default? It typically looks something like:

```json
{
  // ...
  "scripts": {
    "start": "next start",
    "build": "next build",
    "dev": "next dev"
  }
}
```

You would run `npm run dev` to develop, and Next.js will expose a port on your localhost for you to view locally.

When you deploy you're application to Vercel, Vercel will execute `npm run build` and then `npm run start` to launch the production version of your application.

Docker Containers, and therefore this project, work similarly to Next.js, but without the `dev` command for local development. Each time we want to see an update in the Docker Container, we have to build the Docker Image, and start the Docker Container.

## Hands on with Docker Containers

We're going to be discussing Docker Containers specially under the context of ZCauldron (an open source finance utility). It's important to note that we have _two_ Dockerfile's and while yes, they will be joined with Docker-Compose, it's still helpful to know how to run the base Docker Image in each directory.

```bash
/
├── Dockerfile
└── lib
    └── image
        └── Dockerfile
```

## Running the Core Dockerfile

In a new terminal window, navigate to the root directory of this project. We'll start with the Core Dockerfile; we can run the basic build command.

```bash
docker build -t zcauldron .
```

ABove we've assigned the Container with a tag `-t` of "zcauldron". The `.` signifies this directory.

Once the build process completes, we can run the Container. This command is a bit bigger, mostly because we have to pass a few environment variables `-e` at this level.

```bash
docker run \
  -e ENV=staging \
  -e SESSION_SECRET_KEY=<your-session-secret-key> \
  -e OPENAI_API_KEY=<your-api-key> \
  -p 8080:8080 zcauldron
```

And that's all there is too it! If you look at the contents of the Dockerfile, it's building and running both our Go app and React application, and then serving them both via port 8080. This slightly differs from what you'd experience in local development, where the Go server is exposed to port 8080 but the React development server is exposed at port 3001. (hence the need for a staging environment)

If you've set your environment to "staging", you should be able to visit your application in your browser at `localhost:8080` but you will experience limited functionality until you've launched the second Container. We'll cover that Container in the next section.

## Running the lib/image Container

Why is this it's own Docker container you ask? As [mentioned above](#consider-this), you may be a React dev looking at this project and don't want to fuck with the Python portion (fair). Thats a Docker solution. By following these steps you can launch the Python server locally without actually touching Python on your local machine.

```bash
docker build -t pdf-service -f lib/image/Dockerfile lib/image/
```

This command is essentially the same things

## Debugging the Application in Docker
