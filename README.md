# Backend

This backend uses ES6 import/export syntax instead of const and require. Something which all of you are familiar with.

List of Packages used :

- express and @types/express
- typescript
- cors : To avoid CORS errors during developement
- cross-env : Since some of you work with mac, this package makes setting env-vars easy.
  eg. for setting NODE_ENV, in windows you have to write `set NODE_ENV=developement` and in mac its `NODE_ENV=developement`
  To prevent this, if you need to add env vars to package.json scripts, simply write
  `cross-env NODE_ENV=production`
- dotenv : injects .env file in nodejs process. Make sure not to move `dotenv.config()` Keep it at top of `app.ts`
- morgan and winston : Event loggers. Instead of using console log, you can mention intention of log.
  to warn user, write `log.warn("Foo Bar")`
  methods available on `log` are `warn, info, error, http`
- nodemailer : Package used to sending Emails using SMTP protocols. Function to send emails is in `config/emailOptions.ts`
  `sendMail` requires
  `from : person who is sending email, to : person to which email is sent, subject : subject of email, html: html to send in email.`
- yup : validation library. Example of usage can be found at `validation/AuthValidation.ts`

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT` : The port that express will serve on. It's set to 5000 by default.

`DB_LOCAL` : mongoDB local database. Default name is neog_db. eg. mongodb://localhost:27017/your_favorite_name

`DB_ATLAS` : Link to the production Database. Typically mongodb atlas connection URL.

`EMAIL_HOST`="smtp.mailtrap.io"

Create an account on MailTrap to see emails locally.
They will provide Username and password that looks like this.

`EMAIL_USERNAME`="3b9da084bd19bb"

`EMAIL_PASSWORD`="719e54aa2b5c0e"

`EMAIL_PORT`=2525

`JWT_SECRET` : by default kept as long string. You can add whatever secret you want. Keep it strong.

`JWT_EXPIRES_IN` : set token expiry date. Defaulted to 7 days. If you think it should be more, feel free to change.

## Installation

Install backend-starter with yarn (recommended) However you can use npm you wish.

```bash
    git clone https://github.com/OmkarK45/backend-starter.git
    cd backend-starter
    yarn
```

To boot the server, please ensure that you have entered PORT number in `.env` file.
There are three scripts to this project

1. `yarn dev` : Boots the server in `NODE_ENV=development`. This uses ts-node-dev (brother of nodemon in TS world) instead of nodemon.
2. `yarn build` : Runs the typescript compiler on entire project and output js is compiled in `dist` folder.
3. `yarn serve` : This runs `yarn build` as well as sets the NODE_ENV to `production`. After that it runs `node dist/app.js` to server our complied output.

## Features

- ES6 Syntax.
- Auth
- Features you will build 😎

## API Reference

#### Sign Up a user.

##### Handler located at `controllers/AuthController.ts`

##### Routes located at `routes/AuthRoutes.ts`

##### Body validation located at `validation/AuthValidation.ts`

```http
  POST /api/auth/sign-up
```

| Parameter   | Type     | Description                      |
| :---------- | :------- | :------------------------------- |
| `firstName` | `string` | **Required**. First name of user |
| `lastName`  | `string` | **Required** Last name of user   |
| `email`     | `string` | **Required** Email of user       |
| `password`  | `string` | **Required** Password of user    |

### Possible Responses :

- [409] `User already exists`
- [500] `Failed to save user`
- [Success][200] `An email with verification link has been sent to you.`
- `There was an error while sending email.`
- [Internal Error] [500] `Something went wrong.`

#### Sign In User

```http
  POST /api/auth/sign-in
```

| Parameter  | Type     | Description                   |
| :--------- | :------- | :---------------------------- |
| `email`    | `string` | **Required**. Email of user   |
| `password` | `string` | **Required** Password of user |

### Possible Responses

- `Incorrect credentials.`
- `Cannot log in because your email has not been verified yet. Please click resend button.`
- `Logged in Successfully!`
- `Something went wrong while signing in. 500 Internal Error`

#### Logout User

```http
    POST /api/auth/Logout
```

No params required.

Logs user out and destroys cookie on frontend along with resetting token.

#### Get info of currently logged in user.

Requirements: Must be logged in frontend and have a cookie with token in it.

#### Success Response

```json
{
	"foundUser": {
		"isVerified": true,
		"_id": "60d8b80da50b9d625002e50f",
		"firstName": "Omkar",
		"lastName": "Kulkarni",
		"email": "omkar@gmail.com",
		"createdAt": "2021-06-27T17:40:29.310Z",
		"updatedAt": "2021-06-28T09:27:59.060Z",
		"__v": 0
	}
}
```

#### Miscellaneous Functions

`config/corsOptions.ts`

This function sets up server to accept requests from `localhost:300` or port of your next application.
You will not get sort of CORS errors. However in production, this would change to

## Usage / Common Scenarios

#### 1. I want to create protecte route that needs user to be authenticated.

To achieve this, you need to add `requiresAuth` middleware to your route config.

`import {requiresAuth} from 'middleware/AuthMiddleware.'`

Then go ahead and create a route for that handler
eg.

`routes/StudentRoutes.ts`

In that file add following code. Please let me know if you need change in these methods
Refer `routes/AuthRoutes.ts` for example

`const router = express.Router()`

`router.route('/my-secret-path').get(requiresAuth, studentHandler);`

`export = router`

😎 and your route is now protected.

#### 2. I want information of the authenticated requested user.

The middleware attaches info of current user in `req` object of express.
But for typescript support please mention that its a `AuthRequest`

`import {AuthRequest} from 'types/RequestWithAuth'`

If you get error saying `Property user `

```js
app.get('/student-info', (req : AuthRequest, res:Response)=>{
    const user = req.user

    //and then you can access whatever info you want
    console.log(user.email) -> omkar@gmail.com
    const studentInfo = await Student
                                .findOne({email : user.email})
})
```

To learn more about AuthRequest type, please refer `types/RequestWithAuth.ts` file.

#### 3. I want to validate incoming request body for null checks and its proper or no.

To do this, please go ahead and add a file eg. `StudentValidation.ts`
Since we are using yup https://github.com/jquense/yup for validation, you refer its docs if you
need extra information

```js
// this is called schema
const ReviewSubmitBody = yup.object({
	// shapes of params u want to in take as req.body
	reviewer_id: yup.string().required(),
	// more if you wish
})

export type TReviewSubmit = yup.InferType<typeof ReviewSubmitBody>
// above line generates a type as follows
{
	reviewer_id: string
}
```

After that, to validate body, go ahead add this as middleware for route

```js
import { validate } from 'middleware/ValidationMiddleware'
import {TReviewSubmitBody} from 'validation/StudentValidation'

app.get('/reviewer', validate(ReviewSubmitBody), (req, res) => {
	// 😎 now body here is already validated for null checks.
	// not need to check if (!reviwer_id) etc. It will be handled
	// middleware layer. and approapriate resposne will be send.
	// eg. 'validationError' : {"message" : "reviewer_id" is
	//required.}
   const {reviewer_id } = req.body as TReviewSubmitBody
})
```

#### 4. I want to send Email to user

To make this happen, first of all, import sendEmail function

`import {sendEmail} from 'config/emailOptions'`

Put the logic of sending email in try catch block so we can tell user
in case of error, that hey, there was error sending email.

sendEmail requires following parameters

```ts
interface IEmailOptions {
	from: string
	to: string
	subject: string
	html: string
	cc?: string
}
```

sendEmail(options : IEmailOptions) {
//
}

| Parameter | Type     | Description                                                                    |
| :-------- | :------- | :----------------------------------------------------------------------------- |
| `from`    | `string` | **Required**. Who is sending email. for eg Person <person@example.com>         |
| `to`      | `string` | **Required** Whom are you sending email to ? Email address                     |
| `subject` | `string` | **Required** This is subject of email. For eg. "Congrats you are mark15"       |
| `html`    | `string` | **Required** Email is nothing but html + css - javascript. `<h1>Hi there</h1>` |
| `cc`      | `string` | **Optional** Send carbon copy to someone. Email goes as a value.               |

Ping me if you have any other Scenarios.
