import express from 'express';
import router from './root.js';
import cors from 'cors';

let args = process.argv.slice(2);
if (args.length != 1) {
    console.log('missing argument: host and port');
    process.exit(1);
}
if (!args[0].includes(':')) {
    console.log('missing separator ":" between host and port');
    process.exit(1);
}
let [host, port] = args[0].split(':', 2);

const app = express();
app.use(cors());
app.use(router);
app.listen(port, host, () => {
    console.log(`Listening on ${host}:${port}`);
});
