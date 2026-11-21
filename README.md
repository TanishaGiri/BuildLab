BuildLab

BuildLab is a learning website for AI engineering. Students browse courses, buy them, learn from short lessons, write and run code in the browser, and earn a certificate when they finish a course. Admins manage the courses and the site's content.

It is built with plain HTML, CSS and JavaScript. There is no framework and no build step.

What you can do
As a student
Create an account and log in.
Browse courses by track: AI Foundations, Generative AI, and Build with AI.
Buy a course (the checkout is a demo and takes no real payment). Free courses and lessons marked Preview are open without buying.
Read lessons and complete hands-on code labs. Labs run JavaScript in your browser and check your solution automatically. A hint is always available.
Track your progress on a dashboard.
Leave a rating and feedback on a course, and comment on any lesson.
Earn a certificate automatically when you finish every lesson in a course. Certificates appear in an Achievements section.
As an admin
Sign in as admin using a reference code that only admins know.
Add, edit and delete courses, including their lessons, labs and automatic checks.
Set course prices and choose whether a course is visible to students.
Read and delete learner feedback and lesson comments.
Change the main headings and text on the home and courses pages.
See totals for courses, purchases, feedback, average rating and certificates issued.

Students cannot switch to admin. The admin option is only offered to accounts with edit access, and it always asks for the reference code.

Getting started
Download or clone this repository.
Open index.html in a browser. You can also serve the folder, for example:
python3 -m http.server

Then visit http://localhost:8000. 3. Create an account. To try the admin side, choose Admin on the role screen. The first time, you will be asked to create the admin reference code.

The fonts load from Google Fonts, so the first load needs an internet connection.

Project structure
index.html        Page shell
css/styles.css    All styles
js/app.js         The whole app: accounts, courses, labs, certificates and admin

The sample courses are defined near the top of js/app.js, in DEF_COURSES. Admins can also manage courses from the Admin area.

How it works
Everything is saved in your browser using localStorage. There is no server, so data stays on one browser and one device.
Lab code runs inside a Web Worker with a 3 second time limit, so a mistake like an infinite loop cannot freeze the page.
Each lab has a list of checks. A check is a short JavaScript expression that is true when the student's code is right. Passing all checks marks the lab complete.
Limitations

This project is a working demo, not a production system.

No backend. Accounts, purchases, progress, feedback and certificates are stored in the browser only. They are not shared between devices or people.
Demo security. Passwords and the admin reference code are checked in the browser. This keeps casual users out but is not real security.
Demo checkout. No payments are processed.
JavaScript labs only. Labs run JavaScript, not other languages.

To run it as a real service you would add a backend with user accounts, a database, a payment provider, and admin permission checks on the server.

Customizing
Colors and fonts: change the variables at the top of css/styles.css.
Starter courses: edit DEF_COURSES in js/app.js.
Site headings: change them in the Admin area, or edit DEF_SETTINGS in js/app.js.
Currency symbol: change it in the Admin area under Site headings.
License

Add your preferred license here, for example MIT.
