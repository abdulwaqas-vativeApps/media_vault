import dotenv from "dotenv";
import app from "./app.js";
import env from "./config/env.js";


dotenv.config();

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port => ${PORT}`);
});