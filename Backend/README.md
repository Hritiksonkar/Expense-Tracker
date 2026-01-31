# Expense Tracker Backend

## MongoDB Atlas setup
This backend connects to MongoDB using `mongoose` and reads the connection string from environment variables.

### 1) Create your local env file
- Copy [Backend/.env.example](Backend/.env.example) to `Backend/.env`
- Replace `<db_password>` in `MONGODB_URI` with your real Atlas DB user password.

Recommended format (includes a DB name):

`MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/expense-tracker?retryWrites=true&w=majority&appName=Cluster0`

If you omit the database name after `.net/`, MongoDB will default to a database like `test`, which is usually not what you want.

### 2) Run locally
From the `Backend/` folder:
- Install: `npm install`
- Start: `npm run dev`

The server will use `MONGODB_URI` if provided; otherwise it falls back to `mongodb://127.0.0.1:27017/expense-tracker` in development.

## Production deployment (Vercel/Render/etc)
Set these environment variables in your hosting provider dashboard:
- `MONGODB_URI` (your Atlas connection string)
- `NODE_ENV=production`
- `FRONTEND_URL` (your deployed frontend origin, for CORS)

Do not commit `Backend/.env` to git (it is already ignored by [Backend/.gitignore](Backend/.gitignore)).
