# raccoon.js 🦝

[![Build Status](https://travis-ci.org/medegw01/raccoon.js.svg?branch=master)](https://travis-ci.org/medegw01/raccoon.js)

raccoon.js is a Javascript chess library that is used for chess move generation/validation, position evaluation,
move search, piece placement/movement, and check/checkmate/stalemate detection.

raccoon.js has been extensively tested in node.js and most modern browsers.

## Example Code

The code below plays a complete game of chess ... randomly.

```js
let { Raccoon } = require('./raccoon.js');
let raccoon = new Raccoon();

while (!raccoon.game_over()) {
    let moves = raccoon.moves();
    let move = moves[Math.floor(Math.random() * moves.length)];
    raccoon.move(move);
}
console.log(raccoon.ascii()) /* replace with pgn */
```

Need a user interface? Try Chris Oakman's excellent
[chessboard.js](http://chessboardjs.com) library. See
[chessboard.js - Random vs Random](http://chessboardjs.com/examples#5002) for
an example integration of [chess.js](https://github.com/jhlywa/chess.js) with chessboard.js. raccoon.js is designed with same
API's as chess.js and can be use  in the same way.

## API

### Constructor: Raccoon([ fen ])

The Raccoon() constructor takes an optional parameter which specifies the board configuration
in [Forsyth-Edwards Notation](http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation).

```js
// board defaults to the starting position when called with no parameters
let raccoon = new Raccoon();

// pass in a FEN string to load a particular position
let raccoon = new Raccoon(
    'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1'
);
```

### .ascii()

Returns a string containing an ASCII diagram of the current position.

```js
let raccoon = new Raccoon();

// make some moves
raccoon.move('e4');
raccoon.move('e5');
raccoon.move('Nf4');

raccoon.ascii();
// =>  +-----------------+
//    8| r n b q k b n r | 
//    7| p p p p . p p p | 
//    6| . . . . . . . . | 
//    5| . . . . p . . . | 
//    4| . . . . P . . . | 
//    3| . . N . . . . . | 
//    2| P P P P . P P P | 
//    1| R . B Q K B N R | 
//     +-----------------+
//       a b c d e f g h
//        INFO         
//   turn: b
//   enpass: 99
//   castling: KQkq
//   position_key: 28BB8EE5
```

### .clear()

Clears the board.

```js
raccoon.clear();
raccoon.fen();
// => '8/8/8/8/8/8/8/8 w - - 0 1' <- empty board
```

### .fen()
Returns the FEN string for the current position.

```js
let raccoon = new Raccoon();

// make some moves
raccoon.move('e4');
raccoon.move('e5');
raccoon.move('Nf4');

chess.fen();
// => 'rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2'
```

### .game_over()

Returns true if the game has ended via checkmate, stalemate, draw, threefold repetition, or insufficient material. Otherwise, returns false.

```js
let raccoon = new Raccoon();
raccoon.game_over();
// => false
// stalemate
raccoon.load('1R6/8/8/8/8/8/7R/k6K b - - 0 1');
raccoon.game_over();
// => true

// checkmate
raccoon.load('r3k2r/ppp2p1p/2n1p1p1/8/2B2P1q/2NPb1n1/PP4PP/R2Q3K w kq - 0 8')
raccoon.game_over();
// => true
```
