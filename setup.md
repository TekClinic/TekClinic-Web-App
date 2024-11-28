# Installation & Setup

- Download [Node.js](https://nodejs.org/en)

- try to run the command `npm` in the terminal. If it says `command not found`, make sure npm is added to the path- [click here](https://phoenixnap.com/kb/npm-command-not-found) and follow the tutorial.

- clone the github repo with `git clone "https://github.com/TekClinic/TekClinic-Web-App"`

- run `npm install` and wait until the installation is over

- create a `.env.local` file in the root directory (where the `package.json` file is) and add the following content:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY=a
```

- run `npm run dev` to start the website locally, it should run at `http://localhost:3000/`
