const { fork, exec } = require('child_process');
const chalk = require('chalk');

process.env.PORT = 8080;
let serverOne = fork('server/index.js', [], {});

// process.env.PORT = 3000;
// let serverTwo = fork('server/index.js', [], {});
serverOne.on('exit', (reason, description) => {
  console.log(chalk.red("Server process stopped due to " +  description + " " + reason));
  console.log(chalk.green("Restarting Server Process..."));
  console.log("");
  server = fork('server/index.js', [], {});
});

serverOne.on('error', function(err){
  console.log(chalk.red("SERVER PROCESS ERROR...", err));
  console.log("");
})
