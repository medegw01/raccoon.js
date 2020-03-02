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

    let game = new Raccoon();
    let checkmates = [
        '8/5r2/4K1q1/4p3/3k4/8/8/8 w - - 0 7',
        '4r2r/p6p/1pnN2p1/kQp5/3pPq2/3P4/PPP3PP/R5K1 b - - 0 2',
        'r3k2r/ppp2p1p/2n1p1p1/8/2B2P1q/2NPb1n1/PP4PP/R2Q3K w kq - 0 8',
        '8/6R1/pp1r3p/6p1/P3R1Pk/1P4P1/7K/8 b - - 0 4'
    ];

    checkmates.forEach(function(checkmate) {
        game.load(checkmate);
        it(checkmate, function() {
            expect(game.in_checkmate()).toBe(true);
        });
    });

});



describe("Stalemate", function() {
    let game = new Raccoon();
    let stalemates = [
        '1R6/8/8/8/8/8/7R/k6K b - - 0 1',
        '8/8/5k2/p4p1p/P4K1P/1r6/8/8 w - - 0 2',
    ];

    stalemates.forEach(function(stalemate) {
        game.load(stalemate);
        it(stalemate, function() {
            expect(game.in_stalemate()).toBe(true)
        });

    });

});

