# Task manager

Backend API for Task Manager application which is a task management website/application


## Usage

Rename "conig.env.env" to ".env" and update the values and settings to your own variables.

## Install dependencies
```
npm install
```

## Run App
```
# Run in dev mode
npm run dev

# Run in production mode
npm start
```

- Version 1.0.0
- License: MIT

## File Structure

taskmanager
├─ .DS_Store
└─ taskmanager-server
   ├─ .DS_Store
   ├─ README.md
   ├─ config.env
   ├─ data
   │  ├─ tasks.json
   │  └─ users.json
   ├─ dbseeder.js
   ├─ index.js
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  └─ index.html
   ├─ src
   │  ├─ .DS_Store
   │  ├─ cloudinary
   │  │  └─ index.js
   │  ├─ config
   │  │  └─ db.js
   │  ├─ controllers
   │  │  ├─ auth.js
   │  │  ├─ tasks.js
   │  │  └─ users.js
   │  ├─ middleware
   │  │  ├─ advancedresults.js
   │  │  ├─ async.js
   │  │  ├─ auth.js
   │  │  └─ error.js
   │  ├─ models
   │  │  ├─ Tasks.js
   │  │  └─ User.js
   │  ├─ routes
   │  │  ├─ auth.js
   │  │  ├─ tasks.js
   │  │  └─ users.js
   │  └─ utils
   │     ├─ errorResponse.js
   │     ├─ geocoder.js
   │     └─ sendEmail.js
   └─ target
      └─ npmlist.json
