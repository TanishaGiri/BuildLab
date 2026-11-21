# BuildLab

A learning website with a student side and an admin side. Plain HTML, CSS and JavaScript. No framework, no build step.

## Run it
Open `index.html` in a browser, or serve the folder (for example `python3 -m http.server`) and visit http://localhost:8000.
Fonts load from Google Fonts, so the first load needs internet.

## Files
- `index.html`  page shell
- `css/styles.css`  all styles
- `js/app.js`  the whole app (login, courses, labs, certificates, admin)

## How it behaves outside Claude
- Everything is saved in the browser (localStorage). There is no server, so data is per browser and per device.
- The first account to choose **Admin** creates the admin reference code. Anyone using the same browser can then sign in as admin only with that code.
- Because the code check runs in the browser, this is a demo-level gate, not real security. For a real site you need a backend (accounts, database, payments) and server-side admin checks.
- Checkout is a demo. No payment is taken.
- Labs run in JavaScript inside a Web Worker. Certificate download uses the platform in Claude, so outside Claude it is not offered.

## Editing content
Sample courses are in `DEF_COURSES` near the top of `js/app.js`. Admins can also add, edit and delete courses from the Admin area.
