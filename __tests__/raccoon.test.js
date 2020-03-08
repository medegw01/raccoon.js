/*
 Tests, although modified, were adopted from https://github.com/jhlywa/chess.js/blob/master/__tests__/chess.test.js
 */

if (typeof require != "undefined") {
    var Raccoon = require('../raccoon').Raccoon;
}
describe("Perft", function() {
    let perfts = [
        {fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
            depth: 3, nodes: 97862},
        {fen: '8/PPP4k/8/8/8/8/4Kppp/8 w - - 0 1',
            depth: 4, nodes: 89363},
        {fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
            depth: 4, nodes: 43238},
        {fen: 'rnbqkbnr/p3pppp/2p5/1pPp4/3P4/8/PP2PPPP/RNBQKBNR w KQkq b6 0 4',
            depth: 3, nodes: 23509},
    ];

    perfts.forEach(function(perft) {
        let game = new Raccoon();
        game.load(perft.fen);

        it(perft.fen, function() {
            let nodes = game.perft(perft.depth);
            expect(nodes).toBe(perft.nodes);
        });

    });
});

describe("Checkmate", function() {
    let checkmates = [
        {fen: '1R6/8/8/8/8/8/7R/k6K b - - 0 1', result: false},
        {fen: '5bnr/4p1pq/4Qpkr/7p/2P4P/8/PP1PPPP1/RNB1KBNR b KQ - 0 10', result: false},
        {fen: '8/5r2/4K1q1/4p3/3k4/8/8/8 w - - 0 7', result: true},
        {fen: '4r2r/p6p/1pnN2p1/kQp5/3pPq2/3P4/PPP3PP/R5K1 b - - 0 2', result: true},
        {fen: 'r3k2r/ppp2p1p/2n1p1p1/8/2B2P1q/2NPb1n1/PP4PP/R2Q3K w kq - 0 8', result: true},
        {fen: '8/6R1/pp1r3p/6p1/P3R1Pk/1P4P1/7K/8 b - - 0 4', result: true},
    ];
    checkmates.forEach(function(checkmate) {
        let game = new Raccoon(checkmate.fen);
        it(checkmate.fen, function() {
            expect(game.in_checkmate()).toBe(checkmate.result);
        });
    });

});

describe("Stalemate", function() {
    let stalemates = [
        {fen: '2R5/8/8/8/3B4/8/7R/k6K b - - 0 1', result: false},
        {fen: '8/8/5k2/p4p1p/P4K1P/4r3/8/8 w - - 0 2', result: false},
        {fen: '1R6/8/8/8/8/8/7R/k6K b - - 0 1', result: true},
        {fen: '5bnr/4p1pq/4Qpkr/7p/2P4P/8/PP1PPPP1/RNB1KBNR b KQ - 0 10', result: true},
    ];
    stalemates.forEach(function(stalemate) {
        let game = new Raccoon(stalemate.fen);
        it(stalemate.fen, function() {
            expect(game.in_stalemate()).toBe(stalemate.result)
        });
    });
});

describe("FEN", function() {
    let positions = [
        {fen: '8/8/8/8/8/8/8/8 w - - 0 1', result: true},
        {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', result: true},
        {fen: '1nbqkbn1/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/1NBQKBN1 b - - 1 2', result: true},
        {fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', result: true},

        /* incomplete FEN string */
        {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN w KQkq - 0 1', result: false},

        /* Illegal character 9*/
        {fen: 'rnbqkbnr/pppppppp/9/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', result: false},

        /* Illegal character X */
        {fen: '1nbqkbn1/pppp1ppX/8/4p3/4P3/8/PPPP1PPP/1NBQKBN1 b - - 1 2', result: false},

        /* Half move cannot be a negative integer */
        {fen: '1nbqkbn1/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/1NBQKBN1 b - - -1 2', result: false},

        /* Full move must be greater than 0 */
        {fen: '1nbqkbn1/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/1NBQKBN1 b - - 10 0', result: false},
    ];
    positions.forEach(function(position) {
        it(position.fen + ' (' + position.should_pass + ')', function() {
            let game = new Raccoon();
            game.load(position.fen);
            expect(game.fen() === position.fen === position.result).toBe(true);
        });

    });

});

describe("Poly Keys", function (){
    const start_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    let positions = [
        {
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            result: BigInt("0x463b96181691fc9c"),
            moves: []
        },
        {
            fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
            result: BigInt("0x823c9b50fd114196"),
            moves: ['e2e4']
        },
        {
            fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2',
            result: BigInt("0x0756b94461c50fb0"),
            moves:['e2e4', 'd7d5']
        },
        {
            fen: 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2',
            result: BigInt("0x662fafb965db29d4"),
            moves:['e2e4', 'd7d5', 'e4e5']
        },
        {
            fen: 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3',
            result: BigInt("0x22a48b5a8e47ff78"),
            moves:['e2e4', 'd7d5', 'e4e5', 'f7f5']
        },
        {
            fen: 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPPKPPP/RNBQ1BNR b kq - 0 3',
            result: BigInt("0x652a607ca3f242c1"),
            moves:['e2e4', 'd7d5', 'e4e5', 'f7f5', 'e1e2']
        },
        {
            fen: 'rnbq1bnr/ppp1pkpp/8/3pPp2/8/8/PPPPKPPP/RNBQ1BNR w - - 0 4',
            result: BigInt("0x00fdd303c946bdd9"),
            moves:['e2e4', 'd7d5', 'e4e5', 'f7f5', 'e1e2', 'e8f7']
        },
        {
            fen: 'rnbqkbnr/p1pppppp/8/8/PpP4P/8/1P1PPPP1/RNBQKBNR b KQkq c3 0 3',
            result: BigInt("0x3c8123ea7b067637"),
            moves:['a2a4', 'b7b5', 'h2h4', 'b5b4', 'c2c4']
        },
        {
            fen: 'rnbqkbnr/p1pppppp/8/8/P6P/R1p5/1P1PPPP1/1NBQKBNR b Kkq - 0 4',
            result: BigInt("0x5c3f9b829b279560"),
            moves:['a2a4', 'b7b5', 'h2h4', 'b5b4', 'c2c4', 'b4c3', 'a1a3']
        },
    ];
    positions.forEach(function(position) {
        let game = new Raccoon();
        game.load(position.fen);
        it(position.fen, function() {
            let by_fen = game.polyglot();
            game.load(start_fen);
            let move = 0;
            for (move of position.moves){
                game.move(move);
            }
            let by_move = game.polyglot(true);
            expect(by_fen).toBe(position.result);
            expect(by_move).toBe(by_fen);
        });
    });


});

describe("Insufficient Material", function() {
    var positions = [
        {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', draw: false},
        {fen: '8/8/8/8/8/8/8/k6K w - - 0 1', draw: true},
        {fen: '8/2p5/8/8/8/8/8/k6K w - - 0 1', draw: false},
        {fen: '8/2N5/8/8/8/8/8/k6K w - - 0 1', draw: true},
        {fen: '8/2b5/8/8/8/8/8/k6K w - - 0 1', draw: true},
        {fen: '8/b7/3B4/8/8/8/8/k6K w - - 0 1', draw: true},
        {fen: '8/b7/B7/8/8/8/8/k6K w - - 0 1', draw: true},
        {fen: '8/b1B1b1B1/1b1B1b1B/8/8/8/8/1k5K w - - 0 1', draw: false},
        {fen: '8/bB2b1B1/1b1B1b1B/8/8/8/8/1k5K w - - 0 1', draw: false}
    ];

    positions.forEach(function(position) {
        let game = new Raccoon();
        game.load(position.fen);

        it(position.fen, function() {
            if (position.draw) {
                expect(game.insufficient_material() && game.in_draw()).toBe(true);
            } else {
                expect(!game.insufficient_material() && !game.in_draw()).toBe(true);
            }
        });

    });

});


describe("Threefold Repetition", function() {

    var positions = [
        {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            moves: ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8']},

        /* Fischer - Petrosian, Buenos Aires, 1971 */
        {fen: '8/pp3p1k/2p2q1p/3r1P2/5R2/7P/P1P1QP2/7K b - - 2 30',
            moves: ['Qe5', 'Qh5', 'Qf6', 'Qe2', 'Re5', 'Qd3', 'Rd5', 'Qe2']},
    ];

    positions.forEach(function(position) {
        let game = new Raccoon();
        game.load(position.fen);
        let move = 0;

        it(position.fen, function() {
            for (move of position.moves) {
                game.move(move);
            }
            expect(game.in_threefold_repetition() && game.in_draw()).toBe(true);

        });

    });

});


