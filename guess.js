const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function playGame() {
  const secretNumber = Math.floor(Math.random() * 100) + 1;
  let attempts = 0;

  function askGuess() {
    rl.question('Guess a number between 1-100: ', (answer) => {
      const guess = parseInt(answer);
      attempts++;

      if (isNaN(guess)) {
        console.log('Please enter a valid number!');
        askGuess();
        return;
      }

      if (guess < secretNumber) {
        console.log('Too low');
        askGuess();
      } else if (guess > secretNumber) {
        console.log('Too high');
        askGuess();
      } else {
        console.log(`Correct! It took you ${attempts} attempt${attempts === 1 ? '' : 's'}.`);
        rl.question('Play again? (y/n): ', (answer) => {
          if (answer.toLowerCase() === 'y') {
            console.log('\n--- New Game ---');
            playGame();
          } else {
            console.log('Thanks for playing!');
            rl.close();
          }
        });
      }
    });
  }

  askGuess();
}

console.log('Welcome to Guess the Number!');
playGame();

