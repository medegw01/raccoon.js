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
let raccoon = new Raccoon('rnbqkbnr/p3pppp/2p5/1pPp4/3P4/8/PP2PPPP/RNBQKBNR w KQkq b6 0 4');
raccoon.ascii();
// =>   +-----------------+
//     8| r n b q k b n r | 
//     7| p . . . p p p p | 
//     6| . . p . . . . . | 
//     5| . p P p . . . . | 
//     4| . . . P . . . . | 
//     3| . . . . . . . . | 
//     2| P P . . P P P P | 
//     1| R N B Q K B N R | 
//      +-----------------+
//        a b c d e f g h
//             INFO         
//     turn: w
//     enpass: 72
//     castling: KQkq
//     poly key: 0xf5b10215c5fb8d1e
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
### .insufficient_material()

Returns true if the game is drawn due to insufficient material; otherwise false.
```js
let raccoon = new Raccoon('8/b7/B7/8/8/8/8/k6K w - - 0 1');
raccoon.insufficient_material()
// -> true
```

### .load(fen)

The board is cleared, and the FEN string is loaded. Returns {value: true, error: "no error!"} if the position was
successfully loaded, otherwise {value: false, error: "some specific error"}.

```js
let raccoon = new Raccoon();
raccoon.load('8/b7/B7/8/8/8/8/k6K w - - 0 1');
// => {value: true, error: "no error!"}

raccoon.load('8/T7/B7/8/8/8/8/k6K w - - 0 1')
// => {value: false, error: "Illegal character T"}
```

### .polyglot()

Get the polyglot key of current function. See [polyglot](http://hgm.nubati.net/book_format.html) for more info

```js
raccoon.load('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2');
raccoon.polyglot();
// => 0x0756b94461c50fb0
```

### .move(move, [ options ])

Attempt to make a move. If successfully, return the move object. Otherwise return null. I can take a move object as shown below
or a move string in most common chess notations. 

```js

let raccoon = new Raccoon();
let same_moves = [
    'e2e4', 'Pe2e4', 'e2-e4', 'e4', { from: 'e2', to: '34' },
];
// all the different move notations above represent the same move. The second to the last is SAN notation
for(let mv of same_moves){
    raccoon.move(mv);
    // => {from: "e2", to: "e4", color: "w", pieces: "p", flag: "b", san: "e4"}
    raccoon.undo();
    // => {from: "e2", to: "e4", color: "w", pieces: "p", flag: "b", san: "e4"}
}

 raccoon.move("a1a1"); //-- invalid move
//=> null
```

### .moves([ options ])

Returns a list of legal moves from the current position in smith notation. If verbose is set to true, it return the moves
in a detailed object explained below.

```js
let raccoon = new Raccoon();
raccoon.moves();
// => ["a2a3", "a2a4", "b2b3", "b2b4", "c2c3", "c2c4", "d2d3", "d2d4", "e2e3", "e2e4", "f2f3", "f2f4", "g2g3", "g2g4", 
// "h2h3", "h2h4", "b1a3", "b1c3", "g1f3", "g1h3"]

raccoon.moves({ verbose: true })
// => [{ from: "a2"
//         to: "a3",
//      color: "w",
//     pieces: "p",
//       flag: "n",
//        san: "a3",
//     },
//     ...
//     ]
```

The _piece_, _captured_, and _promotion_ fields contain the lowercase
representation of the applicable piece.

The _flags_ field in verbose mode may contain one or more of the following values:

-   'n' - a non-capture
-   'b' - a pawn push of two squares
-   'e' - an en passant capture
-   'c' - a standard capture
-   'p' - a promotion
-   'k' - kingside castling
-   'q' - queenside castling

A flag of 'pc' would mean that a pawn captured a piece on the 8th rank and promoted.

### .put(piece, square)

Place a piece on the square where piece is an object with the form
{ type: ..., color: ... }. Returns true if the piece was successfully placed,
otherwise, the board remains unchanged and false is returned. `put()` will fail
when passed an invalid piece or square, or when two or more kings of the
same color are placed.

_type_ can be:(not case sensitive)
- 'k' or 'K' - king
- 'q' or 'Q' - queen
- 'r' or 'R' - rook
- 'b' or 'B' - bishop
- 'n' or 'N' - knight
- 'p' or 'P' - pawn

_color_ can be: case sensitive
- 'w' - white
- 'b' - black

```js
raccoon.clear();

raccoon.put({type: 'r', color: 'w'}, 'e4'); // put a white rook on e4
// => true

raccoon.put({type: 'm', color: 'w'}, 'e4'); // invalid piece
// => false

raccoon.put({type: 'k', color: 'w'}, 'e6'); // can not have more than one king
// => false
```

### .remove(square)

Remove and return the piece on _square_.

```js
raccoon.clear();       

raccoon.put({type: 'r', color: 'w'}, 'e4'); // put a white rook on e4
raccoon.put({type: 'k', color: 'b'}, 'e6'); // put white king on e6

raccoon.remove('e4');
// -> { type: 'r', color: 'w' },
raccoon.remove('e6');
// -> { type: 'k', color: 'w' },
raccoon.remove('e6');// board is now empty
// -> null
```
### .reset()

Reset the board to the initial starting position.

### .square_color(square)

Returns the color of the square ('light' or 'dark').

```js
let raccoon = new Raccoon();
raccoon.square_color('h1');
// => 'light'
raccoon.square_color('a7');
// => 'dark'
raccoon.square_color('bogus square');
// => null
```

### .turn()

Returns the current side to move.

```js
raccoon.load('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
raccoon.turn();
// -> 'b'
```

### .undo()

Takeback the last half-move, returning a move object if successful, otherwise null.

```js
let raccoon = new Raccoon();

raccoon.undo();
// -> null

raccoon.move('e4');

chess.undo();
// => { color: 'w', from: 'e2', to: 'e4', flags: 'b', piece: 'p', san: 'e4' }
```

### .perft(depth)
A debugging function to walk the move generation tree of strictly legal moves and count all the leaf nodes to _depth_

```js
let raccoon = new Raccoon();

raccoon.load('8/PPP4k/8/8/8/8/4Kppp/8 w - - 0 1');

raccoon.perft(4); 
// => 89363
```

### .perft_summary(depth)
Works exactly as _.perft(depth)_ but prints out more details to console.

```js
raccoon.perft_summary(4); 
/** CONSOLE.LOG
About to start perf testing, with depth: 4
raccoon.js:2065 move: 1 c7c8q 6006
raccoon.js:2065 move: 2 c7c8r 5937
raccoon.js:2065 move: 3 c7c8b 4995
raccoon.js:2065 move: 4 c7c8n 4619
raccoon.js:2065 move: 5 b7b8q 5697
raccoon.js:2065 move: 6 b7b8r 6149
raccoon.js:2065 move: 7 b7b8b 3744
raccoon.js:2065 move: 8 b7b8n 4568
raccoon.js:2065 move: 9 a7a8q 5900
raccoon.js:2065 move: 10 a7a8r 6196
raccoon.js:2065 move: 11 a7a8b 3648
raccoon.js:2065 move: 12 a7a8n 3924
raccoon.js:2065 move: 13 e2d2 5568
raccoon.js:2065 move: 14 e2f2 2630
raccoon.js:2065 move: 15 e2e3 5911
raccoon.js:2065 move: 16 e2d1 3051
raccoon.js:2065 move: 17 e2f3 5031
raccoon.js:2065 move: 18 e2d3 5789
raccoon.js:2067 Total nodes: 89363
**/
// => 89363
```

### .evaluation() _NOT COMPLETED_
An evaluation function used to heuristically determine the relative value of a positions, i.e. the chances of winning. 
If we could see to the end of the game in every line, the evaluation would only have values of -inf (loss), 0 (draw), 
and +inf (win). It considers _psqt table_, _imbalance_, _pawns_, _pieces_, _material value_, _mobility_, _threat_, 
_passed_, _space_, and _king_.

TODO
- finish _threat_
- _passed_ pawn evaluation
- _space_ check
- _king_ safety

```js
let raccoon = new Raccoon();

raccoon.evaluation(); // Positive score for white as it has the tempo
//=> 28
```

### .search(option) _NOT COMPLETED_
TODO
- Transposition table
- Static Exchange Evaluation(See)
- Quiescence search
- Alpha-beta search
    1) Aspiration window
    2) Interactive deepening
    3) Null move reduction
    4) Razoring pruning
    5) Futility pruning
    6) Late Move Reduction
    7) Late move pruning
    8) History futility pruning
- Move Ordering
    1) Most value victim / Lowest Value Attacker
    2) Killer moves
    3) Butterfly history

### Overall Game TODO
For optimization
- Bitboard representation
- Magic bitboard







