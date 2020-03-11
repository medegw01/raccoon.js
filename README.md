# raccoon.js 🦝

[![Build Status](https://travis-ci.org/medegw01/raccoon.js.svg?branch=master)](https://travis-ci.org/medegw01/raccoon.js)

raccoon.js is a Javascript chess library that is used for chess position evaluation; best move search; move generation 
or validation; piece placement or movement; check, checkmate, stalemate, and insufficient material detection. 

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

// pass in a FEN string to load a particular position and/or path to opening book
let raccoon = new Raccoon(
   'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1'
);
let raccoon = new Raccoon(
    {
       fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
       file_name: 'book.bin'
    }
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
### .get(square)

Returns the piece on the square:

```js
let raccoon = new Raccoon();
raccoon.clear();
raccoon.put({ type: 'p', color: 'b' }, 'a5'); // put a black pawn on a5

raccoon.get('a5');
// => { type: 'p', color: 'b' },
raccoon.get('a6');
// => null
```

### .history([ options ])

Returns a list containing the moves of the current game in SAN. Options is an optional
parameter which may contain a 'verbose' flag. See .moves() for a description of the
verbose move fields.

```js
let raccoon = new Raccoon();
raccoon.move('e4');
raccoon.move('e5');
raccoon.move('f4');
raccoon.move('exf4');

raccoon.history();
// => ['e4', 'e5', 'f4', 'exf4']

raccoon.history({ verbose: true });
// => [{ color: 'w', from: 'e2', to: 'e4', flags: 'b', piece: 'p', san: 'e4' },
//     { color: 'b', from: 'e7', to: 'e5', flags: 'b', piece: 'p', san: 'e5' },
//     { color: 'w', from: 'f2', to: 'f4', flags: 'b', piece: 'p', san: 'f4' },
//     { color: 'b', from: 'e5', to: 'f4', flags: 'c', piece: 'p', captured: 'p', san: 'exf4' }]
```

### .in_check()

Returns true or false if the side to move is in check.

```js
let raccoon = new Raccoon(
    'rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3'
);
raccoon.in_check();
// => true
```

### .in_checkmate()

Returns true or false if the side to move has been checkmated.

```js
let raccoon = new Raccoon(
    'rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3'
);
raccoon.in_checkmate();
// => true
```

### .in_draw()

Returns true or false if the game is drawn (50-move rule or insufficient material).

```js
let raccoon = new Raccoon('4k3/4P3/4K3/8/8/8/8/8 b - - 0 78');
raccoon.in_draw();
// => true
```

### .in_stalemate()

Returns true or false if the side to move has been stalemated.

```js
let raccoon = new Raccoon('4k3/4P3/4K3/8/8/8/8/8 b - - 0 78');
raccoon.in_stalemate();
// => true
```

### .in_threefold_repetition()

Returns true or false if the current board position has occurred three or more
times.

```js
let raccoon = new Raccoon('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq occurs 1st time
raccoon.in_threefold_repetition();
// => false
raccoon.move('Nf3');
raccoon.move('Nf6');
raccoon.move('Ng1');
raccoon.move('Ng8');
// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq occurs 2nd time
raccoon.in_threefold_repetition();
// => false

raccoon.move('Nf3');
raccoon.move('Nf6');
raccoon.move('Ng1');
raccoon.move('Ng8');
// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq occurs 3rd time
raccoon.in_threefold_repetition();
// => true
```
