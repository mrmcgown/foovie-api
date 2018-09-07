## Foovie API

You are currently viewing the backend repo for Foovie. To view the frontend repo, click on the following link: https://github.com/mrmcgown/foovie-client.

To view the web app, click on the following link: https://mrmcgown.github.io/foovie-client/.

The server site is located at https://still-hollows-79663.herokuapp.com/.

## Technologies used:

- HTML
- Bootstrap 4
- JavaScript
- jQuery
- Ajax
- Node Express
- MongoDB

## Unsolved problems:

- When deleting a plan, clicking the submit button sends an ajax request to delete all id's that have been clicked. This doesn't interfere with the functionality of the application as the previous plans have already been deleted, but it will throw an error in the console. A similar issue can occur when submitting edits to a plan.

## Planning:

- In developing this app, I began with the user stories, wireframe, and ERD. The idea for the app came from the idea of having a one stop app for creating food and movie plans, so I built into the ERD the idea of having a database of invitations (a future feature). For the backend, I went with Node Express because of its use of JavaScript. I had experience with Ruby on Rails from a previous project, but less comfort with Node Express, so I took advantage of this project to get more practice. The backend as it currently stands is pretty straightforward with users, plans, and ownership requirements. On the frontend, I encountered difficulty with rendering the plans dynamically and incorporating modals with forms. However, the result is better than my past experience of simply including elements in the html and hiding and showing them through use of jQuery depending on the state. Attaching the correct id's of plans to the respectice rows and buttons that are dynamically created also created some small issues which I ultimately resolved.

Future features may include incorporating third-party APIs for food and movie selection, invitiation functionality, the ability to mark plans as old and current, and unique styling.

## Entity Relationship Diagram (ERD):

![alt text](https://i.imgur.com/WTpz9nO.png)

## Routes

- GET
- POST
- PATCH
- DELETE
