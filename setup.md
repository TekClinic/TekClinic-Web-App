# Installation & Setup

1. Download [Node.js](https://nodejs.org/en)

2. Try to run the command `npm` in the terminal. If it says `command not found`, make sure npm is added to the path- [click here](https://phoenixnap.com/kb/npm-command-not-found) and follow the tutorial.

3. Clone the GitHub repo with `git clone "https://github.com/TekClinic/TekClinic-Web-App"`

4. Run `npm install` and wait until the installation is over

5. Create a `.env.local` file in the root directory (where the `package.json` file is) and add the following content:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY=a
```

6. Run `npm run dev` to start the website locally, it should run at `http://localhost:3000/`
