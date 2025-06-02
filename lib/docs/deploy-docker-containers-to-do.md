# Deploy docker containers to Digital Ocean

This is just my preferred flow, feel free to let me know what you might do different!

## Create the droplet (and enter)

- Go to Digital Ocean and create a Droplet
- Grab the ipv4 address from the droplet dashboard
- In your terminal; ssh into the droplet `ssh root@123.123.123.12`

## Connect GitHub account to the droplet

- From within the droplet, generate an ssh key pair `ssh-keygen -t ed25519 -C "your_email@example.com"`
- Walk through the prompts
- Copy the public key `cat ~/.ssh/id_ed25519.pub`
- Add the key to GitHub
  1. Log in to GitHub and navigate to Settings.
  2. On the left sidebar, click SSH and GPG keys.
  3. Click the New SSH key button.
  4. Give it a descriptive title (like “DigitalOcean Droplet”) and paste the public key you copied.
  5. Click Add SSH key.
- Test the ssh connection `ssh -T git@github.com`
  - expected: `Hi your-username! You've successfully authenticated, but GitHub does not provide shell access.`
- Using git, clone your target repo via the ssh option

## Clone your repo into your Digital Ocean Container

- Clone the repo
- Copy / paste the .env file according to your preferred environment.
- Build and launch the image

  ```bash
  # Copy example env file
  cp .env.example .env.staging

  # ...Edit .env.development with your development settings

  # launch in detached state
  docker compose up --d
  ```

(This may take a while the first time around, NOTE you will encounter CORS errors when trying to visit the application via IP address alone. Cuz we are listening for that IP so CORS will auto-reject it. It's advised to leave this as-is for security concerns.)

-
