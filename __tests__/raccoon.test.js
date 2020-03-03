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


