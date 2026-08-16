import app from './app.mjs';

const port = Number(process.env.PORT || 4001);
const server = app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});

server.on('error', (error) => {
  console.error('Could not start server', error);
  process.exitCode = 1;
});
