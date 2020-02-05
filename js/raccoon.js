/*
  Raccoon Chess Engine
*/
let Raccoon = function(fen_pos){
    /*****************************************************************************
     * Board constants
     ****************************************************************************/
    const START_FEN           = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const NAME                = "Raccoon 1.0";
    const CHECKMATE           = 32000;
    const INFINITE            = 32001;
    const MAX_MOVES           = 2048;
    const MAX_MOVES_POSITION  = 256;
    const BOARD_SQUARE_NUM    = 120;
    const MAX_DEPTH           = 64;

    const PIECES  = {
        EMPTY: 0,
        WHITEPAWN: 1,
        WHITEBISHOP: 2,
        WHITEKNIGHT: 3,
        WHITEROOK: 4,
        WHITEQUEEN: 5,
        WHITEKING: 6,
        BLACKPAWN: 7,
        BLACKBISHOP: 8,
        BLACKKNIGHT: 9,
        BLACKROOK: 10,
        BLACKQUEEN: 11,
        BLACKKING: 12,
    };
    const FILES = {A_FILE: 0, B_FILE: 1, C_FILE: 2, D_FILE: 3, E_FILE: 4, F_FILE:5, G_FILE:6, H_FILE:7, NONE_FILE: 8};
    const RANKS  = {
        FIRST_RANK: 0,
        SECOND_RANK: 1,
        THIRD_RANK: 2,
        FOURTH_RANK: 3,
        FIFTH_RANK: 4,
        SIXTH_RANK: 5,
        SEVENTH_RANK: 6,
        EIGHTH_RANK: 7,
        NONE_RANK: 8,
    };
    const COLORS =  {WHITE: 0, BLACK: 1, BOTH: 2};
    const SQUARES= {
        A1: 21, B1: 22, C1: 23, D1: 24, E1: 25, F1: 26, G1: 27, H1: 28,
        A2: 31, B2: 32, C2: 33, D2: 34, E2: 35, F2: 36, G2: 37, H2: 38,
        A3: 41, B3: 42, C3: 43, D3: 44, E3: 45, F3: 46, G3: 47, H3: 48,
        A4: 51, B4: 52, C4: 53, D4: 54, E4: 55, F4: 56, G4: 57, H4: 58,
        A5: 61, B5: 62, C5: 63, D5: 64, E5: 65, F5: 66, G5: 67, H5: 68,
        A6: 71, B6: 72, C6: 73, D6: 74, E6: 75, F6: 76, G6: 77, H6: 78,
        A7: 81, B7: 82, C7: 83, D7: 84, E7: 85, F7: 86, G7: 87, H7: 88,
        A8: 91, B8: 92, C8: 93, D8: 94, E8: 95, F8: 96, G8: 97, H8: 98,
        OFF_SQUARE: 99, OFF_BOARD: 100,
    };
    const CASTLING = {
        WHITE_CASTLE_OO: 1,
        WHITE_CASTLE_OOO: 2,
        BLACK_CASTLE_OO: 4,
        BLACK_CASTLE_OOO: 8,
    };

    let board = {
        turn: COLORS.WHITE,
        enpassant: SQUARES.OFF_SQUARE,
        half_moves: 0,
        castling_right: 0,
        ply: 0,
        history_ply: 0,
        current_position_key: 0,

        king_square: new Array(2),

        pieces: new Array(BOARD_SQUARE_NUM),
        material_eg: new Array(2),
        material_mg: new Array(2),
        number_pieces: new Array(13),
        number_big_pieces: new Array(2),
        number_major_pieces: new Array(2),
        number_minor_pieces: new Array(2),

        piece_list: new Array(13*10),
        history: new Array(MAX_MOVES),

        /*moves_list: new Array(MAX_DEPTH * MAX_MOVES_POSITION),
        moves_score: new Array(MAX_DEPTH * MAX_MOVES_POSITION),
        move_list_start: new Array(MAX_DEPTH),*/

        //search_history: new Array(13*BOARD_SQUARE_NUM),
        //search_killers: new Array(2*MAX_DEPTH),


        //pv_data: new Array(MAX_DEPTH + 2), //pv_data_t
        /*trans_table: {
            ptr_trans_entry: [],// each index{current_position_key, move, score,  depth, flags}
            new_write: 0,
            over_write: 0,
            hit: 0,
            cut: 0,
        },*/

        /*
    bitboard_t pawns[3];*/

    };


    /*****************************************************************************
     * GAME CONSTANTS
     ****************************************************************************/
    let files_board = new Array(BOARD_SQUARE_NUM);
    let ranks_board = new Array(BOARD_SQUARE_NUM);

    let square64_to_square120 = new Array(64);
    let square120_to_square64 = new Array(BOARD_SQUARE_NUM);

    const get_value_piece=[//-- get_value_piece[PHASE][PIECES]
        [0, 128, 825, 781, 1276, 2538, 50000, 128, 825, 781, 1276, 2538,50000],
        [0, 213, 915, 854, 1380, 1380, 50000, 213, 915, 854, 1380, 1380, 50000]
    ];
    const color_pieceflip=[//-- color_pieceflip[COLORS][PIECES]
        [PIECES.WHITEPAWN, PIECES.WHITEKNIGHT, PIECES.WHITEBISHOP, PIECES.WHITEROOK, PIECES.WHITEQUEEN, PIECES.WHITEKING],
        [PIECES.BLACKPAWN, PIECES.BLACKKNIGHT, PIECES.BLACKBISHOP, PIECES.BLACKROOK, PIECES.BLACKQUEEN, PIECES.BLACKKING]
    ];
    const get_color_piece = [COLORS.BOTH, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK];

    const is_big_piece    = [false, false, true, true, true, true, true, false, true, true, true, true, true];
    const is_major_piece  = [false, false, false, false, true, true, true, false, false, false, true, true, true];
    const is_minor_piece  = [false, false, true, true, false, false, false, false, true, true, false, false, false];
    const is_pawn         = [false, true, false, false, false, false, false, true, false, false, false, false, false];
    const is_knight          = [false, false, false, true, false, false, false, false, false, true, false, false, false];
    const is_king            = [false, false, false, false, false, false, true, false, false, false, false, false, true];
    const is_rook_or_queen   = [false, false, false, false, true, true, false, false, false, false, true, true, false];
    const is_bishop_or_queen = [false, false, true, false, false, true, false, false, true, false, false, true, false];
    const is_slide_piece     = [false, false, true, false, true, true, false, false, true, false, true, true, false];

    let piece_keys = new Array(14*120);
    let castlekeys = new Array(16);
    let mvvlva_scores  = new Array(13*13);
    let piece_to_ascii = ".PBNRQKpbnrqk";
    let side_key;


    /*****************************************************************************
     * GAME MACRO
     ****************************************************************************/
    function FILE_RANK_TO_SQUARE(file, rank){return ((21 + (file)) + ((rank) * 10));}
    function square_64(square_120){return  (square120_to_square64[(square_120)]);}
    function square_120(square_64){return (square64_to_square120[(square_64)]);}
    function PIECE_INDEX(piece, piece_num){return (piece * 10 + piece_num)}
    function square_color(sq) {return ((ranks_board[sq] + files_board[sq]) % 2 === 0)? COLORS.BLACK : COLORS.WHITE;}
    function mirror_board() {
        let tempPiecesArray = new Array(64);
        let tempSide = board.turn^1;
        let SwapPiece= [
            PIECES.EMPTY,
            PIECES.BLACKPAWN,
            PIECES.BLACKBISHOP,
            PIECES.BLACKKNIGHT,
            PIECES.BLACKROOK,
            PIECES.BLACKQUEEN,
            PIECES.BLACKKING,
            PIECES.WHITEPAWN,
            PIECES.WHITEBISHOP,
            PIECES.WHITEKNIGHT,
            PIECES.WHITEROOK,
            PIECES.WHITEQUEEN,
            PIECES.WHITEKING
        ];
        let tempCastlePerm = 0;
        let tempEnPas = SQUARES.OFF_SQUARE;

        let sq;
        let tp;

        if (board.castling_right & CASTLING.WHITE_CASTLE_OO) tempCastlePerm |= CASTLING.BLACK_CASTLE_OO;
        if (board.castling_right & CASTLING.WHITE_CASTLE_OOO) tempCastlePerm |= CASTLING.BLACK_CASTLE_OOO;

        if ((board.castling_right & CASTLING.BLACK_CASTLE_OO) !==0) tempCastlePerm |= CASTLING.WHITE_CASTLE_OO;
        if ((board.castling_right & CASTLING.BLACK_CASTLE_OOO) !== 0) tempCastlePerm |= CASTLING.WHITE_CASTLE_OOO;

        if (board.enpassant !== SQUARES.OFF_SQUARE)  {
            tempEnPas = square_120(flip[square_64(board.enpassant)]);
        }

        for (sq = 0; sq < 64; sq++) {
            tempPiecesArray[sq] = board.pieces[square_120(flip[sq])];
        }
        let ply = board.ply;
        let history_ply = board.history_ply;
        let half = board.half_moves;

        clear();

        for (sq = 0; sq < 64; sq++) {
            tp = SwapPiece[tempPiecesArray[sq]];
            board.pieces[square_120(sq)] = tp;
        }

        board.turn = tempSide;
        board.castling_right = tempCastlePerm;
        board.enpassant = tempEnPas;
        board.half_moves = half;
        board.ply = ply;
        board.history_ply = history_ply;

        board.current_position_key = get_hash_key();

        update_list_material();
    }
    //-- from Bluefever Software tutorial
    /**
     * @return {number}
     */
    function RAND_32() {
        return  (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
            | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);
    }


    /*****************************************************************************
     * HELPER FUNCTIONS
     ****************************************************************************/
    function initialize_files_rank_array(){
        for(let i=0; i< BOARD_SQUARE_NUM; i++){
            files_board[i] = SQUARES.OFF_BOARD;
            ranks_board[i] = SQUARES.OFF_BOARD;
        }
        for(let rank = RANKS.FIRST_RANK; rank <= RANKS.EIGHTH_RANK; ++rank) {
            for (let file = FILES.A_FILE; file <= FILES.H_FILE; ++file) {
                let square_120 = FILE_RANK_TO_SQUARE(file, rank);
                files_board[square_120] = file;
                ranks_board[square_120] = rank;
            }
        }
    }
    function initialize_square120_to_square64(){
        let sq_64 = 0;
        let i, rank, file;
        for (i = 0; i < BOARD_SQUARE_NUM; ++i){
            square120_to_square64[i] = 65;
        }
        for (i = 0; i < 64; ++i){
            square64_to_square120[i] = 120;
        }

        for(rank = RANKS.FIRST_RANK; rank <= RANKS.EIGHTH_RANK; ++rank){
            for(file = FILES.A_FILE; file <= FILES.H_FILE; file++){
                let sq = FILE_RANK_TO_SQUARE(file, rank);
                square64_to_square120[sq_64] = sq;
                square120_to_square64[sq] = sq_64;
                sq_64++;
            }
        }
    }
    function initialize_hash_key(){
        let i;
        for( i = 0; i < 13; i++){
            for(let j = 0; j < 120; j++) {
                piece_keys[i * 120 + j] = RAND_32();
            }
        }
        side_key = RAND_32();

        for(i = 0; i < 16; i++){
            castlekeys[i]= RAND_32();
        }
    }
    function initialize_mvvlva() {
        let victim_score = [0, 100, 300, 200, 400, 500, 600, 100, 300, 200, 400, 500, 600];
        for(let attacker = PIECES.WHITEPAWN; attacker <= PIECES.BLACKKING; ++attacker) {
            for(let victim = PIECES.WHITEPAWN; victim <= PIECES.BLACKKING; ++victim) {
                mvvlva_scores[victim *13 + attacker] = victim_score[victim] + 6 - (victim_score[attacker] / 100);
            }
        }
    }
    function initialize() {
        initialize_square120_to_square64();
        //initialize_bitmask()
        initialize_hash_key();
        initialize_files_rank_array();
        //initialize_eval_pawn_mask();
        initialize_mvvlva();
    }

    /*****************************************************************************
     * UTILITY
     ****************************************************************************/
    function square_to_algebraic(square){
        let file = 'a'.charCodeAt(0) + files_board[square];
        let rank = '1'.charCodeAt(0) + ranks_board[square];
        return String.fromCharCode(file) + String.fromCharCode(rank);
    }
    function hex32(val) {
        val &= 0xFFFFFFFF;
        let hex = val.toString(16).toUpperCase();
        return ("00000000" + hex).slice(-8);
    }
    function get_time_ms(){
        return new Date().getTime();
    }

    function clear(){
        for(let i = 0; i< BOARD_SQUARE_NUM; i++){
            board.pieces[i] = SQUARES.OFF_BOARD;
        }
        for(let i = 0; i< 64; i++){
            board.pieces[square_120(i)] = PIECES.EMPTY;
        }
        for(let i = 0; i< 2; i++){
            board.number_big_pieces[i] = 0;
            board.number_major_pieces[i] = 0;
            board.number_minor_pieces[i] = 0;
            board.material_mg[i] = 0;
            board.material_eg[i] = 0;
        }
        /*for(let i = 0; i< 3; i++){
            board.pawns[i] = 0ULL;
        }*/

        for(let i = 0; i< 13; i++){
            board.number_pieces[i] = 0;
        }
        board.king_square[COLORS.BLACK] = board.king_square[COLORS.WHITE] = SQUARES.OFF_SQUARE;
        board.turn = COLORS.BOTH;
        board.enpassant= SQUARES.OFF_SQUARE;
        board.half_moves = 0;
        board.ply = 0;
        board.history_ply = 0;
        board.castling_right =0;
        board.current_position_key = 0;

    }
    function reset() {
        load(START_FEN);
    }
    function load(fen){
        let rank  = RANKS.EIGHTH_RANK;
        let file  = FILES.A_FILE;
        let n = fen.length;
        let piece = 0;
        let count = 0;
        let square_64_  = 0;
        let square_120_ = 0;
        let i = 0;
        if(n===0) return {value: false, error: "Empty fen provided"};

        clear();
        while ((rank >= RANKS.FIRST_RANK) && (i < n)) {
            count = 1;
            switch (fen[i]){
                case 'p': piece = PIECES.BLACKPAWN; break;
                case 'r': piece = PIECES.BLACKROOK; break;
                case 'n': piece = PIECES.BLACKKNIGHT; break;
                case 'b': piece = PIECES.BLACKBISHOP; break;
                case 'k': piece = PIECES.BLACKKING; break;
                case 'q': piece = PIECES.BLACKQUEEN; break;
                case 'Q': piece = PIECES.WHITEQUEEN; break;
                case 'K': piece = PIECES.WHITEKING; break;
                case 'N': piece = PIECES.WHITEKNIGHT; break;
                case 'R': piece = PIECES.WHITEROOK; break;
                case 'B': piece = PIECES.WHITEBISHOP; break;
                case 'P': piece = PIECES.WHITEPAWN; break;

                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                    piece = PIECES.EMPTY;
                    count = fen[i].charCodeAt(0) - '0'.charCodeAt(0);
                    break;
                case '/':
                case ' ':
                    rank--;
                    file= FILES.A_FILE;
                    i++;
                    continue;
                default:
                    return {value: false, error: "Illegal character " + fen[i]};

            }
            for(let j = 0; j< count; j++){
                square_64_  = rank * 8 + file;
                square_120_ = square_120(square_64_);
                if(piece !== PIECES.EMPTY){
                    board.pieces[square_120_] = piece;
                }
                file++;
            }
            i++;
        }

        if (!(fen[i] === 'w' || fen[i] === 'b')){
            return {value: false, error: 'side to move is invalid. It should be w or b'};
        }
        board.turn = (fen[i] === 'w')? COLORS.WHITE : COLORS.BLACK;
        i += 2;

        for(let j = 0; j < 4; j++){
            if(fen[i] === ' '){
                break;
            }
            switch(fen[i]){
                case 'K': board.castling_right |= CASTLING.WHITE_CASTLE_OO; break;
                case 'Q': board.castling_right |= CASTLING.WHITE_CASTLE_OOO; break;
                case 'k': board.castling_right |= CASTLING.BLACK_CASTLE_OO; break;
                case 'q': board.castling_right |= CASTLING.BLACK_CASTLE_OOO; break;
                default: break;
            }
            i++;
        }
        i++;

        if(fen[i] !== '-'){
            file = fen.charCodeAt(i) - 'a'.charCodeAt(0);
            rank = fen.charCodeAt(++i) - '1'.charCodeAt(0);

            if (!(file >= FILES.A_FILE && file <= FILES.H_FILE) || !(rank >= RANKS.FIRST_RANK && rank <= RANKS.EIGHTH_RANK)){
                return {value: false, error: "invalid en-passant square"};
            }
            board.enpassant = FILE_RANK_TO_SQUARE(file, rank);
        }
        i++;
        let half = "";
        i++;
        while(fen[i] !== ' ') {
            half += fen[i++];
        }
        i++;
        let half_move = parseInt(half);
        if (half_move < 0) return {value: false, error: "half move cannot be a negative integer"};

        let full ="";
        while(i < n) {
            full += fen[i++];
        }

        let full_move = parseInt(full);
        if(full_move < 1 ) return {value: false, error: 'full move must be greater than 0'};


        board.half_moves = half_move;
        board.history_ply = full_move;
        board.ply = full_move;
        board.current_position_key = 0;
        board.current_position_key = get_hash_key();
        update_list_material();
        return {value: true, error: 'no error!'};

    }
    function fen() {
        var fen_str = "";
        let empty = 0;

        for(let rank = RANKS.EIGHTH_RANK; rank >= RANKS.FIRST_RANK; --rank){
            for(let file = FILES.A_FILE; file <= FILES.H_FILE; file++){
                let sq = FILE_RANK_TO_SQUARE(file, rank);
                let piece = board.pieces[sq];
                if(piece === PIECES.EMPTY){
                    empty++;
                }
                else{
                    if(empty>0){
                        fen_str += empty.toString();
                        empty = 0;
                    }
                    fen_str += piece_to_ascii[piece];

                }
            }
            if(empty > 0){
                fen_str += empty.toString();
            }
            if(rank !== RANKS.FIRST_RANK) fen_str +='/';
            empty = 0;
        }

        fen_str += (board.turn === COLORS.WHITE)? " w ": " b ";
        var cflag = "";
        if ((board.castling_right & CASTLING.WHITE_CASTLE_OO) !== 0){
            cflag +='K';
        }
        if ((board.castling_right & CASTLING.WHITE_CASTLE_OOO) !== 0){
            cflag +='Q';
        }
        if ((board.castling_right & CASTLING.BLACK_CASTLE_OO) !== 0){
            cflag +='k';
        }
        if ((board.castling_right & CASTLING.BLACK_CASTLE_OOO) !==0){
            cflag +='q';
        }

        fen_str += (cflag !=="")? cflag:"-";
        fen_str +=' ';
        let en_sq = board.enpassant;
        fen_str += (en_sq !== SQUARES.OFF_SQUARE)? square_to_algebraic(en_sq): "-";
        fen_str += ' ';
        fen_str += board.half_moves.toString();
        fen_str +=' ';
        fen_str += board.history_ply.toString();

        return fen_str;
    }
    function ascii(){
        let ascii_t = " \n+-----------------+\n";

        for(let rank = RANKS.EIGHTH_RANK; rank >= RANKS.FIRST_RANK; --rank){
            ascii_t += (rank + 1).toString() +"| ";
            for(let file = FILES.A_FILE; file <= FILES.H_FILE; ++file){
                let square_120 = FILE_RANK_TO_SQUARE(file, rank);
                let piece = board.pieces[square_120];
                ascii_t += ((piece_to_ascii[piece]) + " ");
            }
            ascii_t += "| \n";
        }

        ascii_t += " +-----------------+\n";
        ascii_t += "   a b c d e f g h\n";
        ascii_t += "        INFO         \n";
        ascii_t += "turn: " +  ("wb-"[board.turn]) + '\n';
        ascii_t += "enpass: " + (board.enpassant).toString() + '\n';
        ascii_t += "castling: " + (((board.castling_right & CASTLING.WHITE_CASTLE_OO) !==  0)? piece_to_ascii[PIECES.WHITEKING]: '')
            + (((board.castling_right & CASTLING.WHITE_CASTLE_OOO) !== 0)? piece_to_ascii[PIECES.WHITEQUEEN]: '')
            + (((board.castling_right & CASTLING.BLACK_CASTLE_OO) !==  0)? piece_to_ascii[PIECES.BLACKKING]: '')
            + (((board.castling_right & CASTLING.BLACK_CASTLE_OOO)!==  0)? piece_to_ascii[PIECES.BLACKQUEEN]: '');
        ascii_t += ("\nposition_key: " + hex32(board.current_position_key) +'\n');

        return ascii_t;
    }

    function in_check() {
        return (is_square_attacked(board.king_square[board.turn], (board.turn)^1))
    }
    function in_checkmate() {
        if(in_check()) {
            let legal = 0;
            let moves = generate_moves();
            for (let i = 0; i < moves.length; ++i) {
                let tmp_move = moves[i].move;
                if (!make_move(tmp_move)) {
                    continue;
                }
                legal++;
                take_move();
            }
            return (legal === 0);
        }
        return false;
    }

    /*****************************************************************************
     * HASH
     ****************************************************************************/
    function hash_piece_key (piece, square){ return piece_keys[(piece * 120 + square)];}
    function hash_castle_key(){return castlekeys[board.castling_right];}
    function hash_ep_key(){return hash_piece_key(PIECES.EMPTY, board.enpassant);}
    function hash_turn_key(){return side_key;}
    function get_hash_key(){
        let key = 0;
        for(let square = 0; square < BOARD_SQUARE_NUM; square++){
            let piece = board.pieces[square];
            if(piece !== SQUARES.OFF_BOARD && piece !== PIECES.EMPTY){
                key ^= piece_keys[(piece *120 + square)];
            }
        }
        if(board.turn === COLORS.WHITE){
            key ^= side_key;
        }
        if(board.enpassant !== SQUARES.OFF_SQUARE){
            key ^= piece_keys[(board.enpassant)];
        }

        key ^= castlekeys[board.castling_right];
        return key;

    }
    function update_list_material(){
        for(let i = 0; i < BOARD_SQUARE_NUM; i++){
            let square = i;
            let piece =board.pieces[i];
            if(piece !== SQUARES.OFF_BOARD && piece !== PIECES.EMPTY){
                let color = get_color_piece[piece];

                if(is_big_piece[piece])board.number_big_pieces[color]++;
                if(is_major_piece[piece])board.number_major_pieces[color]++;
                if(is_minor_piece[piece])board.number_minor_pieces[color]++;

               board.material_mg[color] += get_value_piece[PHASE.MIDDLE_GAME][piece];
               board.material_eg[color] += get_value_piece[PHASE.ENDGAME][piece];
               board.piece_list[(PIECE_INDEX(piece, board.number_pieces[piece]))] = square;
               board.number_pieces[piece]++;

                if(piece === PIECES.WHITEKING)board.king_square[COLORS.WHITE] = square;
                if(piece === PIECES.BLACKKING)board.king_square[COLORS.BLACK] = square;

                /* set pawns in bitboard
                if (piece == WHITEPAWN){
                    SET_BIT(board.pawns[WHITE], square_64(square));
                    SET_BIT(board.pawns[BOTH], square_64(square));
                }
                else if(piece == BLACKPAWN){
                    SET_BIT(board.pawns[BLACK], square_64(square));
                    SET_BIT(board.pawns[BOTH], square_64(square));
                }*/
            }
        }
    }


    /*****************************************************************************
     * ATTACK
     ****************************************************************************/
    const knight_direction = [-8, -19,-21, -12, 8, 19, 21, 12 ];
    const rook_direction   = [-1, -10,	1, 10 ];
    const bishop_direction = [ -9, -11, 11, 9 ];
    const king_direction  = [-1, -10,	1, 10, -9, -11, 11, 9 ];
    function is_square_attacked(square, turn) {
        let piece, direction, tmp_square;
        // pawns
        if(turn === COLORS.WHITE) {
            if(board.pieces[square-11] === PIECES.WHITEPAWN || board.pieces[square-9] === PIECES.WHITEPAWN){
                return true;
            }
        } else {
            if(board.pieces[square+11] === PIECES.BLACKPAWN || board.pieces[square+9] === PIECES.BLACKPAWN){
                return true;
            }
        }
        //knight and king
        for(let i = 0; i<8; i++){
            // check knight
            piece = board.pieces[square + knight_direction[i]];
            if(piece !== SQUARES.OFF_BOARD && is_knight[piece] && get_color_piece[piece] === turn){
                return true;
            }
            // check king
            piece = board.pieces[square + king_direction[i]];
            if(piece !== SQUARES.OFF_BOARD && is_king[piece] && get_color_piece[piece] === turn){
                return true;
            }
        }

        for (let v = 0; v < 2; v++){
            let direction_, is_piece;
            if (v === 0){ //rooks and queen
                direction_ = rook_direction;
                is_piece  = is_rook_or_queen;
            }
            else{
                direction_ = bishop_direction;
                is_piece   = is_bishop_or_queen;
            }
            for(let i = 0; i<4; i++){
                direction = direction_[i];
                tmp_square = square + direction;
                piece = board.pieces[tmp_square];
                while(piece !== SQUARES.OFF_BOARD){
                    if(piece !== PIECES.EMPTY){
                        if(is_piece[piece] && (get_color_piece[piece] === turn)){
                            return true;
                        }
                        break;
                    }
                    tmp_square += direction;
                    piece = board.pieces[tmp_square];
                }
            }
        }
        return false;
    }


    /*****************************************************************************
     * MOVE GENERATION
     ****************************************************************************/
    //-- MACROS
    /**
     * @return {number}
     */
    function FROM_SQUARE(move) {return ((move) & 0x7F);}

    /**
     * @return {number}
     */
    function TO_SQUARE(move) {return (((move) >> 7) & 0x7F);}

    /**
     * @return {number}
     */
    function CAPTURED(move) {return (((move) >> 14) & 0xF);}

    /**
     * @return {number}
     */
    function PROMOTED(move){return (((move) >> 20) & 0xF);}

    /**
     * @return {boolean}
     */
    function SQUARE_ON_BOARD(sq){return (files_board[(sq)] !== SQUARES.OFF_BOARD);}

    /**
     * @return {number}
     */
    function MOVE(from, to, cap, prom, flag){return ((from) | (to << 7) | (cap << 14) | (prom << 20) | (flag));}

    /**
     * @return {number}
     */
    function SQUARE_COLOR(sq) {return (ranks_board[(sq)] + files_board[(sq)]) % 2 === 0 ? COLORS.BLACK : COLORS.WHITE;}

    //-- constants
    const MOVE_FLAG ={
        ENPASS:      0x40000,
        PAWN_START:  0x80000,
        CASTLE:      0x1000000,
        CAPTURED:    0x7C000,
        PROMOTED:    0xF00000,
    };
    const NO_MOVE           = 0;
    const CAPTURE_BONUS     = 1000000;
    const number_directions = [0, 0, 4, 8, 4, 8, 8, 0, 4, 8, 4, 8, 8];
    const slider            = [PIECES.WHITEBISHOP, PIECES.WHITEROOK, PIECES.WHITEQUEEN,-1, PIECES.BLACKBISHOP, PIECES.BLACKROOK, PIECES.BLACKQUEEN, -1];
    const nonslider         = [PIECES.WHITEKNIGHT, PIECES.WHITEKING, -1, PIECES.BLACKKNIGHT, PIECES.BLACKKING, -1];
    const pieces_directions = [
        [ 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0 ],
        [ -9, -11, 11, 9, 0, 0, 0, 0 ],
        [ -8, -19,	-21, -12, 8, 19, 21, 12 ],
        [ -1, -10,	1, 10, 0, 0, 0, 0 ],
        [-1, -10,	1, 10, -9, -11, 11, 9 ],
        [ -1, -10,	1, 10, -9, -11, 11, 9 ],
        [ 0, 0, 0, 0, 0, 0, 0 ],
        [ -9, -11, 11, 9, 0, 0, 0, 0 ],
        [ -8, -19,	-21, -12, 8, 19, 21, 12 ],
        [ -1, -10,	1, 10, 0, 0, 0, 0 ],
        [ -1, -10,	1, 10, -9, -11, 11, 9 ],
        [ -1, -10,	1, 10, -9, -11, 11, 9 ],
    ];

    function add_quiet_move(move, moves){
        let score = 0;
        //-- best killer
        /*
        if(board.search_killers[board.ply] === move){
            score = 900000;
        }
        //-- better killer
        else if(board.search_killers[MAX_DEPTH + board.ply] === move){
            score= 800000;
        }*/
       /*TODO
          else{
            move_ord.score = board.search_history[(board.pieces[FROM_SQUARE(move)])*BOARD_SQUARE_NUM + (TO_SQUARE(move))];
        }
        */
        moves.push({ move: move, score: score});
    }
    function add_capture_move(move, moves){
        let score = mvvlva_scores[CAPTURED(move)*13 + (board.pieces[FROM_SQUARE(move)])] + CAPTURE_BONUS;
        moves.push({ move: move, score: score});
    }
    function add_enpassant_move(move, moves){
        let score = 105 + CAPTURE_BONUS;
        moves.push({ move: move, score: score});
    }
    function add_white_pawn_capture_move(from, to, cap, moves){
        if(ranks_board[from] === RANKS.SEVENTH_RANK){
            add_capture_move(MOVE(from, to, cap, PIECES.WHITEQUEEN, 0), moves);
            add_capture_move(MOVE(from, to, cap, PIECES.WHITEROOK, 0), moves);
            add_capture_move(MOVE(from, to, cap, PIECES.WHITEBISHOP, 0), moves);
            add_capture_move(MOVE(from, to, cap, PIECES.WHITEKNIGHT, 0), moves);
        }
        else{
            add_capture_move(MOVE(from, to, cap, PIECES.EMPTY, 0), moves);
        }
    }
    function add_white_pawn_move(from, to, moves){
        if(ranks_board[from] === RANKS.SEVENTH_RANK){
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.WHITEQUEEN, 0), moves);
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.WHITEROOK, 0), moves);
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.WHITEBISHOP, 0), moves);
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.WHITEKNIGHT, 0), moves);
        }
        else{
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0), moves);
        }
    }
    function add_black_pawn_capture_move(from, to, cap, moves){
        if(ranks_board[from] === RANKS.SECOND_RANK){
            add_capture_move(MOVE(from, to, cap, PIECES.BLACKQUEEN, 0), moves);
            add_capture_move(MOVE(from, to, cap, PIECES.BLACKROOK, 0), moves);
            add_capture_move(MOVE(from, to, cap, PIECES.BLACKBISHOP, 0), moves);
            add_capture_move(MOVE(from, to, cap, PIECES.BLACKKNIGHT, 0), moves);
        }
        else{
            add_capture_move(MOVE(from, to, cap, PIECES.EMPTY, 0), moves);
        }
    }
    function add_black_pawn_move(from, to, moves){
        if(ranks_board[from] === RANKS.SECOND_RANK){
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.BLACKQUEEN, 0), moves);
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.BLACKROOK, 0), moves);
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.BLACKBISHOP, 0), moves);
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.BLACKKNIGHT, 0), moves);
        }
        else{
            add_quiet_move(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0), moves);
        }
    }
    function generate_moves(only_capture = false) {
        let moves = [];
        let turn = board.turn;
        if(turn === COLORS.WHITE){
            //-- generate white pawn moves
            for(let p = 0; p < board.number_pieces[PIECES.WHITEPAWN]; p++){
                let sq = board.piece_list[PIECE_INDEX(PIECES.WHITEPAWN, p)];
                //-- forward move
                if((board.pieces[sq + 10] === PIECES.EMPTY) && !only_capture){
                    add_white_pawn_move(sq, sq+10, moves);

                    if(ranks_board[sq] === RANKS.SECOND_RANK && board.pieces[sq + 20] === PIECES.EMPTY){
                        add_quiet_move(MOVE(sq, sq+20, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG.PAWN_START), moves);
                    }
                }
                //-- capture move
                if(SQUARE_ON_BOARD(sq+ 9) && get_color_piece[board.pieces[sq+9]] === COLORS.BLACK){
                    add_white_pawn_capture_move(sq, sq + 9, board.pieces[sq+9], moves);
                }
                if(SQUARE_ON_BOARD(sq+ 11) && get_color_piece[board.pieces[sq+11]] ===  COLORS.BLACK){
                    add_white_pawn_capture_move(sq, sq + 11, board.pieces[sq+11], moves);
                }

                if(board.enpassant !== SQUARES.OFF_SQUARE){
                    if(sq + 9 === board.enpassant){
                        add_enpassant_move(MOVE(sq, sq+9,  PIECES.EMPTY,  PIECES.EMPTY, MOVE_FLAG.ENPASS), moves);
                    }
                    if(sq + 11 === board.enpassant){
                        add_enpassant_move(MOVE(sq, sq+11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG.ENPASS), moves);
                    }
                }

            }

            //-- castling
            if(((board.castling_right & CASTLING.WHITE_CASTLE_OO) !==0) && !only_capture){
                if(board.pieces[SQUARES.F1] === PIECES.EMPTY && board.pieces[SQUARES.G1] === PIECES.EMPTY ){
                    if(!is_square_attacked(SQUARES.E1, COLORS.BLACK) && !is_square_attacked(SQUARES.F1, COLORS.BLACK)){
                        add_quiet_move(MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG.CASTLE), moves);
                    }
                }
            }
            if(((board.castling_right & CASTLING.WHITE_CASTLE_OOO) !== 0) && !only_capture){
                if(board.pieces[SQUARES.D1] === PIECES.EMPTY && board.pieces[SQUARES.C1] === PIECES.EMPTY && board.pieces[SQUARES.B1] === PIECES.EMPTY){
                    if(!is_square_attacked(SQUARES.E1, COLORS.BLACK) && !is_square_attacked(SQUARES.D1, COLORS.BLACK)){
                        add_quiet_move(MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG.CASTLE), moves);
                    }
                }
            }
        }
        else{
            //generate black pawn moves
            for(let p = 0; p < board.number_pieces[PIECES.BLACKPAWN]; p++){
                let sq = board.piece_list[PIECE_INDEX(PIECES.BLACKPAWN, p)];
                //-- forward move
                if((board.pieces[sq - 10] === PIECES.EMPTY) && !only_capture){
                    add_black_pawn_move(sq, sq - 10, moves);
                    if(ranks_board[sq] === RANKS.SEVENTH_RANK && board.pieces[sq - 20] === PIECES.EMPTY){
                        add_quiet_move(MOVE(sq, sq-20, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG.PAWN_START), moves);
                    }
                }
                //-- capture move
                if(SQUARE_ON_BOARD(sq - 9) && get_color_piece[board.pieces[sq-9]] === COLORS.WHITE){
                    add_black_pawn_capture_move(sq, sq - 9, board.pieces[sq-9], moves);
                }
                if(SQUARE_ON_BOARD(sq - 11) && get_color_piece[board.pieces[sq-11]] ===  COLORS.WHITE){
                    add_black_pawn_capture_move(sq, sq - 11, board.pieces[sq-11], moves);
                }

                if( board.enpassant !== SQUARES.OFF_SQUARE){
                    if(sq - 9 === board.enpassant){
                        add_enpassant_move(MOVE(sq, sq-9,  PIECES.EMPTY,  PIECES.EMPTY, MOVE_FLAG.ENPASS), moves);
                    }
                    if(sq - 11 === board.enpassant){
                        add_enpassant_move(MOVE(sq, sq-11, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG.ENPASS), moves);
                    }
                }
            }


            //-- castling
            if(((board.castling_right & CASTLING.BLACK_CASTLE_OO) !==0) && !only_capture){
                if(board.pieces[SQUARES.F8] === PIECES.EMPTY && board.pieces[SQUARES.G8] === PIECES.EMPTY ){
                    if(!is_square_attacked(SQUARES.E8, COLORS.WHITE) && !is_square_attacked(SQUARES.F8, COLORS.WHITE)){
                        add_quiet_move(MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG.CASTLE), moves);
                    }
                }
            }
            if(((board.castling_right & CASTLING.BLACK_CASTLE_OOO) !==0) && !only_capture){
                if(board.pieces[SQUARES.D8] === PIECES.EMPTY && board.pieces[SQUARES.C8] === PIECES.EMPTY && board.pieces[SQUARES.B8] === PIECES.EMPTY){
                    if(!is_square_attacked(SQUARES.E8, COLORS.WHITE) && !is_square_attacked(SQUARES.D8, COLORS.WHITE)){
                        add_quiet_move(MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MOVE_FLAG.CASTLE), moves);
                    }
                }
            }
        }

        let i = turn*4;
        let p = slider[i++];
        while(p !== -1){
            for(let pceNum = 0; pceNum < board.number_pieces[p]; ++pceNum) {
                let sq = board.piece_list[PIECE_INDEX(p,pceNum)];
                if(SQUARE_ON_BOARD(sq)){
                    for(let i =0; i<number_directions[p]; i++){
                        let dir = pieces_directions[p][i];
                        let to_square = sq + dir;
                        while(SQUARE_ON_BOARD(to_square)) {
                            if(board.pieces[to_square] !== PIECES.EMPTY){
                                if(get_color_piece[board.pieces[to_square]] === (turn ^ 1)){
                                    add_capture_move(MOVE(sq, to_square, board.pieces[to_square], PIECES.EMPTY, 0), moves);
                                }
                                break;
                            }
                            if (!only_capture) {
                                add_quiet_move(MOVE(sq, to_square, PIECES.EMPTY, PIECES.EMPTY, 0), moves);
                            }
                            to_square += dir;
                        }
                    }
                }
            }
            p = slider[i++];
        }

        i = turn*3;
        p = nonslider[i++];
        while(p !== -1){
            for(let pceNum = 0; pceNum < board.number_pieces[p]; ++pceNum) {
                let sq = board.piece_list[PIECE_INDEX(p,pceNum)];
                if (SQUARE_ON_BOARD(sq)){
                    for(let i =0; i<number_directions[p]; i++) {
                        let dir = pieces_directions[p][i];
                        let to_square = sq + dir;

                        if (!SQUARE_ON_BOARD(to_square)) {
                            continue;
                        }
                        if (board.pieces[to_square] !== PIECES.EMPTY) {
                            if (get_color_piece[board.pieces[to_square]] === (turn ^ 1)) {
                                add_capture_move(MOVE(sq, to_square, board.pieces[to_square], PIECES.EMPTY, 0), moves);
                            }
                            continue;
                        }
                        if (!only_capture) {
                            add_quiet_move(MOVE(sq, to_square, PIECES.EMPTY, PIECES.EMPTY, 0), moves);
                        }
                    }
                }
            }
            p = nonslider[i++];
        }
        return moves;
    }

    /*****************************************************************************
     * MOVE
     ****************************************************************************/
    function smith_to_move(smith){
        if(smith[1].charCodeAt(0) >'8'.charCodeAt(0) || smith[1].charCodeAt(0) < '1'.charCodeAt(0)) return NO_MOVE;
        if(smith[3].charCodeAt(0) >'8'.charCodeAt(0) || smith[3].charCodeAt(0) < '1'.charCodeAt(0)) return NO_MOVE;
        if(smith[0].charCodeAt(0) >'h'.charCodeAt(0) || smith[0].charCodeAt(0) < 'a'.charCodeAt(0)) return NO_MOVE;
        if(smith[2].charCodeAt(0) >'h'.charCodeAt(0) || smith[2].charCodeAt(0) < 'a'.charCodeAt(0)) return NO_MOVE;

        let from = FILE_RANK_TO_SQUARE(smith[0].charCodeAt(0) - 'a'.charCodeAt(0), smith[1].charCodeAt(0)-'1'.charCodeAt(0));
        let to   = FILE_RANK_TO_SQUARE(smith[2].charCodeAt(0) - 'a'.charCodeAt(0), smith[3].charCodeAt(0)-'1'.charCodeAt(0));

        if (SQUARE_ON_BOARD(from) && SQUARE_ON_BOARD(to)){
            let moves = generate_moves();
            for(let i=0; i < moves.length; i++){
                let move = moves[i].move;
                if(FROM_SQUARE(move) === from && TO_SQUARE(move) === to){
                    let promotion_piece = PROMOTED(move);
                    if(promotion_piece !== PIECES.EMPTY){
                        if((smith[4] === (piece_to_ascii[promotion_piece]).toLowerCase()) || (smith[4] === (piece_to_ascii[promotion_piece]).toUpperCase())) {
                            return move;
                        }
                        continue;
                    }
                    return move;
                }
            }
        }
        return NO_MOVE;
    }
    function disambiguator(move){
        let diamb = "";

        let moves = generate_moves();

        let from = FROM_SQUARE(move);
        let to = TO_SQUARE(move);
        let piece = board.pieces[from];

        let ambiguities = 0;
        let same_rank = 0;
        let same_file = 0;

        let i, tmp_move, tmp_from, tmp_to, tmp_piece;

        for(i = 0; i < moves.length; ++i) {
            tmp_move = moves[i].move;
            tmp_from = FROM_SQUARE(tmp_move);
            tmp_to = TO_SQUARE(tmp_move);
            tmp_piece = board.pieces[tmp_from];

            //-- http://cfajohnson.com/chess/SAN/
            if (piece === tmp_piece && from !== tmp_from && to === tmp_to) {
                ambiguities++;

                if (ranks_board[from] === ranks_board[tmp_from]) same_rank++;

                if (files_board[from] === files_board[tmp_from]) same_file++;
            }
        }
        if (ambiguities > 0) {
            /*
             * Examples:
                a. There are two knights, on the squares g1 and e1, and one of them
                   moves to the square f3: either Ngf3 or Nef3, as the case may be.
                b. There are two knights, on the squares g5 and g1, and one of them
                   moves to the square f3: either N5f3 or N1f3, as the case may be.
                c. There are two knights, on the squares h2 and d4, and one of them
                   moves to the square f3: either Nhf3 or Ndf3, as the case may be.
                d. If a capture takes place on the square f3, the notation of the
                   previous examples is still applicable, but an x may be inserted: 1)
                   either Ngxf3 or Nexf3, 2) either N5xf3 or N1xf3, 3) either Nhxf3 or
                  Ndxf3, as the case may be.
             */
            if (same_rank > 0 && same_file > 0) {
                diamb += square_to_algebraic(FROM_SQUARE(move));
            }
            else if(same_rank > 0){
                diamb += String.fromCharCode('a'.charCodeAt(0) + files_board[from]);
            }
            else if(same_file > 0){
                diamb += String.fromCharCode('1'.charCodeAt(0) + ranks_board[from]);
            }
        }
        return diamb;
    }
    function move_to_san(move, verbose=true){
        let san = "";
        let from = FROM_SQUARE(move);
        let to = TO_SQUARE(move);

        if (SQUARE_ON_BOARD(from) && SQUARE_ON_BOARD(to)){
            if((move & MOVE_FLAG.CASTLE) !==0){//--castling move
                switch(to) {
                    case SQUARES.C1:
                        san = "O-O-O";
                        break;
                    case SQUARES.C8:
                        san = "O-O-O";
                        break;
                    case SQUARES.G1:
                        san = "O-O";
                        break;
                    case SQUARES.G8:
                        san = "O-O";
                        break;
                    default:break;
                }
            }
            else{
                let diam = disambiguator(move);
                if(!is_pawn[board.pieces[from]]){
                    san += (piece_to_ascii[board.pieces[from]]).toUpperCase();
                    san +=  diam;
                }
                if((move & (MOVE_FLAG.CAPTURED | MOVE_FLAG.ENPASS)) !==0){
                    if(is_pawn[board.pieces[from]]){
                        san += String.fromCharCode('a'.charCodeAt(0) + files_board[from]);
                    }
                    san +='x';
                }
                san += square_to_algebraic(to);
                if((move & MOVE_FLAG.PROMOTED) !==0){
                    san +='=';
                    san += (piece_to_ascii[PROMOTED(move)]).toLowerCase();
                }
            }
            if(verbose){
                let check = false;
                if (make_move(move)){
                    check = in_check();
                    if(in_checkmate()){
                        san += "#";
                    }
                    else if(check){
                        san += "+";
                    }
                    take_move();
                }
                if(!check && ((move & MOVE_FLAG.ENPASS) !==0)){
                    san += " e.p.";
                }
            }

        }
        return san;
    }
    function parse_move(move, verbose){
        let rlt;
        let from = FROM_SQUARE(move);
        let to   = TO_SQUARE(move);

        if (verbose){
            rlt = {};
            rlt.from   = square_to_algebraic(from);
            rlt.to     = square_to_algebraic(to);
            rlt.color  = "wb-"[board.turn];
            rlt.pieces = (piece_to_ascii[board.pieces[from]]).toLowerCase();
            if ((move & MOVE_FLAG.CAPTURED) !==0){
                rlt.flag = 'c';
                rlt.captured = (piece_to_ascii[CAPTURED(move)]).toLowerCase();
            }
            else if ((move & MOVE_FLAG.PROMOTED) !==0){
                rlt.flag = 'p';
                rlt.promoted = (piece_to_ascii[PROMOTED(move)]).toLowerCase();
            }
            else if ((move & MOVE_FLAG.ENPASS) !==0){
                rlt.flag = 'e';
            }
            else if((move & MOVE_FLAG.CASTLE) !==0){
                if(to === SQUARES.G8 || to === SQUARES.G1){
                    rlt.flag = 'k';
                }
                else{
                    rlt.flag = 'q';
                }
            }
            else if((move & MOVE_FLAG.PAWN_START) !==0){
                rlt.flag = 'b';
            }
            else{
                rlt.flag = 'n'
            }
            rlt.san = move_to_san(move, false);
        }
        else {
            rlt = "";
            let file_from = files_board[from];
            let rank_from = ranks_board[from];

            let file_to = files_board[to];
            let rank_to = ranks_board[to];

            let promoted = PROMOTED(move);
            rlt += (String.fromCharCode('a'.charCodeAt(0) + file_from) + String.fromCharCode('1'.charCodeAt(0) + rank_from) + String.fromCharCode('a'.charCodeAt(0) + file_to) + String.fromCharCode('1'.charCodeAt(0) + rank_to));
            if (promoted) {
                let tmp = 'q';
                if (is_knight[promoted]) {
                    tmp = 'n';
                } else if (is_rook_or_queen[promoted] && !is_bishop_or_queen[promoted]) {
                    tmp = 'r';
                } else if (!is_rook_or_queen[promoted] && is_bishop_or_queen[promoted]) {
                    tmp = 'b';
                }
                rlt += tmp;
            }
        }
        return rlt;
    }

    /*****************************************************************************
     * MOVE MAKE
     ****************************************************************************/
    const castle_permission  = [
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15
    ];

    function clear_pieces(sq) {
        if(SQUARE_ON_BOARD(sq)){
           let pce =board.pieces[sq];

           let col = get_color_piece[pce];
           let index;
           let t_pceNum = -1;

            board.current_position_key ^= hash_piece_key(pce, sq);

            board.pieces[sq] = PIECES.EMPTY;

            board.material_mg[col] -= get_value_piece[PHASE.MIDDLE_GAME][pce];
            board.material_eg[col] -= get_value_piece[PHASE.ENDGAME][pce];

            if(is_big_piece[pce]) {
                board.number_big_pieces[col]--;
                if(is_major_piece[pce]) {
                    board.number_major_pieces[col]--;
                } else {
                    board.number_minor_pieces[col]--;
                }
            } /*else {TODO
                CLEAR_BIT(board.pawns[col],square_64(sq));
                CLEAR_BIT(board.pawns[BOTH],square_64(sq));
            }*/

            for(index = 0; index <board.number_pieces[pce]; ++index) {
                if(board.piece_list[PIECE_INDEX(pce,index)] === sq) {
                    t_pceNum = index;
                    break;
                }
           }

            board.number_pieces[pce]--;
            board.piece_list[PIECE_INDEX(pce,t_pceNum)] = board.piece_list[PIECE_INDEX(pce, board.number_pieces[pce])];
        }
    }
    function add_piece(sq, pce) {
        if(SQUARE_ON_BOARD(sq)){
           let col = get_color_piece[pce];

            board.current_position_key ^= hash_piece_key(pce, sq);

            board.pieces[sq] = pce;

            if(is_big_piece[pce]) {
                board.number_big_pieces[col]++;
                if(is_major_piece[pce]) {
                    board.number_major_pieces[col]++;
                } else {
                    board.number_minor_pieces[col]++;
                }
            } /*else { TODO
                SET_BIT(board.pawns[col],square_64(sq));
                SET_BIT(board.pawns[BOTH],square_64(sq));
            }*/

            board.material[col] += get_value_piece[pce];
            board.piece_list[PIECE_INDEX(pce, board.number_pieces[pce]++)]  = sq;
        }
    }
    function move_piece(from, to){
        let rcd = false;
        if (SQUARE_ON_BOARD(from) && SQUARE_ON_BOARD(to)){
            let pce = board.pieces[from];
            let col = get_color_piece[pce];

            board.current_position_key ^= hash_piece_key(pce, from);
            board.pieces[from] = PIECES.EMPTY;

            board.current_position_key ^= hash_piece_key(pce, to);
            board.pieces[to] = pce;

            /*if(!is_big_piece[pce]){TODO
                CLEAR_BIT(board.pawns[col],square_64(from));
                CLEAR_BIT(board.pawns[BOTH],square_64(from));
                SET_BIT(board.pawns[col],square_64(to));
                SET_BIT(board.pawns[BOTH],square_64(to));
            }*/

            for(let index = 0; index < board.number_pieces[pce]; ++index) {
                if(board.piece_list[PIECE_INDEX(pce,index)] === from) {
                    board.piece_list[PIECE_INDEX(pce,index)] = to;
                    rcd = true;
                    break;
                }
            }
        }
        return rcd;
    }
    function take_move(){
        if(board.history_ply === 0) return null;
        board.history_ply--;
        board.ply--;

        let move = board.history[board.history_ply].move;
        let from = FROM_SQUARE(move);
        let to = TO_SQUARE(move);
        let summary = board.history[board.history_ply].summary;

        if(board.enpassant !== PIECES.OFF_SQUARE) board.current_position_key ^= hash_ep_key();
        board.current_position_key ^= hash_castle_key();

        board.castling_right = board.history[board.history_ply].castling_right;
        board.half_moves = board.history[board.history_ply].half_moves;
        board.enpassant = board.history[board.history_ply].enpassant;


        if(board.enpassant !== SQUARES.OFF_SQUARE) board.current_position_key ^= hash_ep_key();
        board.current_position_key ^= hash_castle_key();

        board.turn ^= 1;
        board.current_position_key ^= hash_turn_key();


        if((MOVE_FLAG.ENPASS & move) !==0) {
            if(board.turn === COLORS.WHITE) {
                add_piece(to-10, PIECES.BLACKPAWN);
            } else {
                add_piece(to+10, PIECES.WHITEPAWN);
            }
        } else if((MOVE_FLAG.CASTLE & move) !== 0) {
            switch(to) {
                case SQUARES.C1: move_piece(SQUARES.D1, SQUARES.A1); break;
                case SQUARES.C8: move_piece(SQUARES.D8, SQUARES.A8); break;
                case SQUARES.G1: move_piece(SQUARES.F1, SQUARES.H1); break;
                case SQUARES.G8: move_piece(SQUARES.F8, SQUARES.H8); break;
                default: break;
            }
        }

        move_piece(to, from);

        if(is_king[board.pieces[from]]) {
            board.king_square[board.turn] = from;
        }

        let captured = CAPTURED(move);
        if(captured !== PIECES.EMPTY) {
            add_piece(to, captured);
        }

        if(PROMOTED(move) !== PIECES.EMPTY)   {
            clear_pieces(from);
            add_piece(from, (get_color_piece[PROMOTED(move)] === COLORS.WHITE ? PIECES.WHITEPAWN : PIECES.BLACKPAWN));
        }

        return summary;

    }
    function make_move(move, summary=true){
        let from = FROM_SQUARE(move);
        let to = TO_SQUARE(move);
        let turn  = board.turn;

        let tmp_history = {};
        tmp_history.current_position_key = board.current_position_key;

        if((move & MOVE_FLAG.ENPASS) !==0) {
            if(turn === COLORS.WHITE) {
                clear_pieces(to-10);
            } else {
                clear_pieces(to+10);
            }
        } else if ((move & MOVE_FLAG.CASTLE) !==0) {
            switch(to) {
                case SQUARES.C1:
                    move_piece(SQUARES.A1, SQUARES.D1);
                    break;
                case SQUARES.C8:
                    move_piece(SQUARES.A8, SQUARES.D8);
                    break;
                case SQUARES.G1:
                    move_piece(SQUARES.H1, SQUARES.F1);
                    break;
                case SQUARES.G8:
                    move_piece(SQUARES.H8, SQUARES.F8);
                    break;
                default: return false;
            }
        }

        if(board.enpassant !== SQUARES.OFF_SQUARE) board.current_position_key ^= hash_ep_key();
        board.current_position_key ^= hash_castle_key();

        tmp_history.move = move;
        tmp_history.half_moves = board.half_moves;
        tmp_history.enpassant = board.enpassant;
        tmp_history.castling_right = board.castling_right;
        tmp_history.summary = (summary)? parse_move(move, true): "No Summary";



        board.castling_right &= castle_permission[from];
        board.castling_right &= castle_permission[to];
        board.enpassant = SQUARES.OFF_SQUARE;

        board.current_position_key ^= hash_castle_key();

        let captured = CAPTURED(move);
        board.half_moves++;

        if(captured !== PIECES.EMPTY) {
            clear_pieces(to);
            board.half_moves = 0;
        }

        board.history[board.history_ply] = tmp_history;

        board.history_ply++;
        board.ply++;

        if(is_pawn[board.pieces[from]]) {
            board.half_moves = 0;
            if((move & MOVE_FLAG.PAWN_START) !== 0) {
                if(turn === COLORS.WHITE) {
                    board.enpassant=from+10;
                } else {
                    board.enpassant=from-10;
                }
                board.current_position_key ^= hash_ep_key();
            }
        }

        move_piece(from, to);

        let prPce = PROMOTED(move);
        if(prPce !== PIECES.EMPTY) {
            clear_pieces(to);
            add_piece(to, prPce);
        }

        if(is_king[board.pieces[to]]) {
            board.king_square[board.turn] = to;
        }

        board.turn ^= 1;
        board.current_position_key ^= hash_turn_key();
        
        if(is_square_attacked(board.king_square[turn], board.turn)) {
            take_move();
            return false;
        }
        return true;
    }

    /*****************************************************************************
     * PERFT -- debugging
     ****************************************************************************/
    function perft(depth) {
        let moves;
        let nodes = 0;

        if (depth === 0) return 1;

        moves= generate_moves();
        for(let i=0; i < moves.length; i++){
            let move = moves[i].move;
            if(!make_move(move)){
                continue;
            }
            nodes += perft(depth - 1);
            take_move();
        }
        return nodes;
    }
    function perft_summary(depth) {
        console.log("About to start perf testing, with depth: " + depth.toString());
        let node = 0;
        let ind = 0;

        let moves = generate_moves();
        for(let i=0; i < moves.length; i++){
            let move = moves[i].move;
            if(!make_move(move)){
                continue;
            }
            ind++;
            let tmp = node;
            node += perft(depth - 1);
            take_move();
            console.log("move: " + ind.toString() + ' ' + parse_move(move, false) + ' '+ (node-tmp).toString());
        }
        console.log("Total nodes: " + node.toString());
    }

    /*****************************************************************************
     * OPENING BOOK
     ****************************************************************************/
    //book TODO
    function book_move(){
        return NO_MOVE;
    }

    /*****************************************************************************
     * EVALUATION
     ****************************************************************************/
    const flip = [
        56,  57,  58,  59,  60,  61,  62,  63,
        48,  49,  50,  51,  52,  53,  54,  55,
        40,  41,  42,  43,  44,  45,  46,  47,
        32,  33,  34,  35,  36,  37,  38,  39,
        24,  25,  26,  27,  28,  29,  30,  31,
        16,  17,  18,  19,  20,  21,  22,  23,
        8,   9,  10,   11,  12,  13,  14,  15,
        0,   1,   2,   3,   4,   5,   6,   7,
    ];
    class eval_t {
        constructor(){
            this.endgame      = 0;
            this.middlegame   = 0;
            this.game_phase   = 0;
            this.tempo        = 0;
        };
    }
    const PHASE = {
        MIDDLE_GAME: 0,
        ENDGAME: 1,
    };
    const psqt = [
        [//-- pawns
            [
                0, 0, 0, 0, 0, 0, 0, 0,
                3, 3, 10, 19, 16, 19, 7, -5,
                -9, -15, 11, 15, 32, 22,  5, -22,
                -8, -23, 6, 20, 40, 17, 4, -12,
                13, 0, -13, 1, 11, -2,  -13, 5,
                -5, -12, -7, 22, -8, -5, -15, -18,
                -7, 7, -3, -13, 5, -16, 10, -8,
                0, 0, 0, 0, 0, 0, 0, 0
            ],
            [
                0, 0, 0, 0, 0, 0, 0, 0,
                -10, -6, 10,  0, 14,  7, -5, -19,
                -10, -10, -10,  4,  4,  3, -6, -4,
                6, -2, -8, -4, -13, -12, -10, -9,
                9,  4,  3, -12 , -12, -6 , 13 ,  8,
                28, 20, 21, 28, 30,  7,  6, 13,
                0, -11, 12, 21, 25, 19,  4,  7,
                0, 0, 0, 0, 0, 0, 0, 0,
            ]

        ],
        [//--bishop
            [
                -53, -5, -8,-23, -23, -8, -5, -53,
                -15, 8, 19, 4, 4, 19, 8, -15,
                -7, 21, -5, 17, 17, -5, 21, -7,
                -5, 11, 25, 39, 39, 25, 11, -5,
                -12, 29, 22, 31, 31, 22, 29, -12,
                -16, 6,  1,  11, 11, 1, 6, -16,
                -17, -14, 5, 0, 0, 5, -14, -17,
                -48, 1, -14, -23,-23, -14, 1, -48,
            ],
            [
                -57, -30, -37, -12, -12, -37, -30, -57,
                -37, -13, -17, 1, 1, -17, -13, -37,
                -16, -1, -2, 10, 10, -2, -1, -16,
                -20,  -6,  0,  17, 17, 0, -6, -20,
                -17, -1, -14, 15, 15, -14, -1, -17,
                -30, 6, 4, 6, 6, 4, 6, -30,
                -31, -20, -1, 1, 1, -1, -20, -31,
                -46, -42, -37, -24, -24, -37, -42, -46,
            ]
        ],
        [//-- knights
            [
                -175, -92, -74, -73, -73, -74, -92, -175,
                -77, -41, -27, -15, -15, -27, -41,  -77,
                -61, -17,   6,  12,  12,   6, -17,-61,
                -35, 8, 40, 49, 49, 40, 8, -35,
                -34, 13, 44, 51, 51, 44, 13, -34,
                -9, 22, 58, 53, 53, 58, 22,-9,
                -67, -27, 4, 37, 37, 4, -27, -67,
                -201, -83, -56,-26, -26,-56,-83,-201,
            ],
            [
                -96, -65, -49,-21, -21, -49, -65, -96,
                -67, -54, -18, 8, 8, -18, -54, -67,
                -40,-27, -8, 29, 29, -8, -27, -40,
                -35, -2, 13, 28, 28, 13, -2, -35,
                -45, -16, 9, 39, 39, 9, -16, -45,
                -51, -44, -16, 17, 17, -16, -44, -51,
                -69 ,-50, -51, 12, 12, -51, -50, -69,
                -100, -88, -56, -17, -17, -56, -88, -100,
            ]
        ],
        [ //-- rook
            [
                -31, -20, -14 -5,-5, -14, -20, -31,
                -21, -13, -8,  6, 6, -8, -13, -21,
                -25, -11,  -1,  3, 3, -1, -11, -25,
                -13,  -5, -4, -6,-6, -4, -5, -13,
                -27, -15,  -4,  3, 3, -4, -15, -27,
                -22, -2, 6, 12, 12, 6, -2, -22,
                -2, 12,  16, 18, 18, 16, 12, -2,
                -17, -19, -1,  9, 9, -1, -19, -17,
            ],
            [
                -9,-13,-10, -9, -9, -10, -13, -9,
                -12, -9, -1,  -2, -2, -1, -9, -12,
                6, -8, -2, -6, -6, -2, -8, 6,
                -6, 1, -9, 7, 7, -9, 1, -6,
                -5,  8, 7, -6, -6, 7, 8, -5,
                6, 1, -7, 10, 10, -7, 1, 6,
                4, 5, 20, -5, -5, 20, 5, 4,
                18,  0,  19, 13, 13, 19, 0, 18
            ]
        ],
        [ //-- queen
            [
                3, -5, -5, 4, 4, -5, -5, 3,
                -3, 5, 8, 12, 12, 8, 5, 3,
                -3, 6, 13, 7, 7, 13, 6, -3,
                4, 5,  9,  8, 8, 9, 5, 4,
                0, 14, 12, 5, 5, 12, 14, 0,
                -4, 10, 6, 8, 8, 6, 10, -4,
                -5, 6, 10, 8, 8, 10, 6, -5,
                -2, -2, 1, -2, -2, 1, -2, -2,
            ],
            [
                -69, -57, -47, -26, -26, -47, -57, -69,
                -55, -31, -22, -4, -4, -22, -31, -55,
                -39, -18, -9, 3, 3, -9, -18, -39,
                -23, -3, 13, 24, 24, 13, -3, -23,
                -29, -6, 9, 21, 21, 9, -6, -29,
                -38, -18, -12, 1, 1, -12, -18, -38,
                -50, -27, -24, -8, -8, -24, -27, -50,
                -75, -52, -43, -36, -36, -43, -52, -75,
            ]
        ],
        [//-- king
            [
                271, 327, 271, 198, 198, 271, 327, 271,
                278, 303, 234, 179, 179, 234, 303, 278,
                195, 258, 169, 120, 120, 169, 258, 195,
                164, 190, 138, 98, 98, 138, 190, 164,
                154, 179, 105, 70, 70, 105, 179, 154,
                123, 145,  81, 31, 31,  81, 145, 123,
                88, 120,  65, 33, 33, 65, 120, 88,
                59,  89,  45, -1, -1, 45, 89, 59,
            ],
            [
                1, 45, 85, 76, 76, 85, 45, 1,
                53, 100, 133, 135, 135, 133, 100, 53,
                88, 130, 169, 175, 175, 169, 130, 88,
                103, 156, 172, 172, 172, 172, 156, 103,
                96, 166, 199, 199, 199, 199, 166, 96,
                92, 172, 184, 191, 191, 184, 172, 92,
                47, 121, 116, 131, 131, 116, 121, 47,
                11, 59, 73, 78, 78, 73, 59, 11,
            ]
        ],
    ];
    function psqt_score(rlt) {
        for (let pce = PIECES.WHITEPAWN; pce <= PIECES.BLACKKING; pce++) {
            for (let i = 0; i < board.number_pieces[pce]; ++i) {
                let sq = board.piece_list[PIECE_INDEX(pce,i)];
                if (pce <= PIECES.WHITEKING) {
                    rlt.endgame += psqt[(pce - PIECES.WHITEPAWN)][PHASE.ENDGAME][square_64(sq)];
                    rlt.middlegame += psqt[(pce - PIECES.WHITEPAWN)][PHASE.MIDDLE_GAME][square_64(sq)];
                } else {
                    rlt.endgame -= psqt[(pce - PIECES.BLACKPAWN)][PHASE.ENDGAME][flip[square_64(sq)]];
                    rlt.middlegame -= psqt[(pce - PIECES.BLACKPAWN)][PHASE.MIDDLE_GAME][flip[square_64(sq)]];
                }
            }
        }
    }
    // Polynomial material imbalance parameters
    const qo= [
    //            OUR PIECES
    // pair pawn knight bishop rook queen
        [1438                               ], // Bishop pair
        [  40,   38                         ], // Pawn
        [  32,  255, -62                    ], // Knight      OUR PIECES
        [   0,  104,   4,    0              ], // Bishop
        [ -26,   -2,  47,   105,  -208      ], // Rook
        [-189,   24, 117,   133,  -134, -6  ]  // Queen
    ];
    const qt = [
        //           THEIR PIECES
        // pair pawn knight bishop rook queen
        [  0                               ], // Bishop pair
        [  36,    0                        ], // Pawn
        [   9,   63,   0                   ], // Knight      OUR PIECES
        [  59,   65,  42,     0            ], // Bishop
        [  46,   39,  24,   -24,    0      ], // Rook
        [  97,   100, -42,   137,  268,  0 ] // Queen
    ];
    function imbalance_total(rlt) {
        function imbalance(my_turn) {//-- stockfish evaluation guide
            let piece_count = [//piece_count[COLOR][PIECE_6]
                [
                    board.number_pieces[PIECES.WHITEBISHOP] > 1,
                    board.number_pieces[PIECES.WHITEPAWN],
                    board.number_pieces[PIECES.WHITEKNIGHT],
                    board.number_pieces[PIECES.WHITEBISHOP],
                    board.number_pieces[PIECES.WHITEROOK],
                    board.number_pieces[PIECES.WHITEQUEEN],
                ],
                [
                    board.number_pieces[PIECES.BLACKBISHOP] > 1,
                    board.number_pieces[PIECES.BLACKPAWN],
                    board.number_pieces[PIECES.BLACKKNIGHT],
                    board.number_pieces[PIECES.BLACKBISHOP],
                    board.number_pieces[PIECES.BLACKROOK],
                    board.number_pieces[PIECES.BLACKQUEEN],
                ]
            ];

            let opp_turn = my_turn ^ 1;
            let bonus = 0;
            for (let j = 0; j <= 5; ++j) {
                if (!piece_count[my_turn][j]) continue;
                let v = 0;
                for (let i = 0; i <= j; ++i){
                    v += ( qo[j][i] * piece_count[my_turn][i]
                        + qt[j][i] * piece_count[opp_turn][i]
                    );
                }
                bonus += piece_count[my_turn][j] * v;
            }

            return bonus;
        }
        let v = imbalance(COLORS.WHITE) - imbalance(COLORS.BLACK);
        console.log(imbalance(COLORS.WHITE));
        console.log(imbalance(COLORS.BLACK));
        rlt.middlegame += ((v / 16) << 0);
        rlt.endgame += ((v / 16) << 0);
    }
    function pawns_total_mg(rlt) {
        function pawns_mg(color){
            let v = 0;
            let i;
            let my_pawn  = color*6 + 1;
            let opp_pawn = (color^1)*6 + 1;
            for(i = 0; i < board.number_pieces[my_pawn]; i++){

            }
                if (isolated(pos, square)) v -= 5;
                else if (backward(pos, square)) v -= 9;
            v -= doubled(pos, square) ? 11 : 0;
            v += connected(pos, square) ?  connected_bonus(pos, square) : 0;
            v -= 13 * weak_unopposed_pawn(pos, square);
            return v;
        }
        return (pawns_mg(COLORS.WHITE) - pawns_mg(COLORS.BLACK));
    }

    function game_evaluation(){
        let rlt = new eval_t();
        let pce, sq;
        //-- piece value
        rlt.middlegame = board.material_mg[COLORS.WHITE] - board.material_mg[COLORS.BLACK];
        rlt.endgame = board.material_eg[COLORS.WHITE] - board.material_eg[COLORS.BLACK];
        //-- psqt
        psqt_score(rlt);
        //-- imbalance
        imbalance_total(rlt);

        /*
        v += pawns_mg(pos) - pawns_mg(colorflip(pos));
        v += pieces_mg(pos) - pieces_mg(colorflip(pos));
        v += mobility_mg(pos) - mobility_mg(colorflip(pos));
        v += threats_mg(pos) - threats_mg(colorflip(pos));
  v += passed_mg(pos) - passed_mg(colorflip(pos));
  v += space(pos) - space(colorflip(pos));
  v += king_mg(pos) - king_mg(colorflip(pos));
  if (!noinitiative) v += initiative_total_mg(pos, v);
         */
        return rlt;


    }
    function opposite_bishops() {
        return (board.number_pieces[PIECES.WHITEBISHOP] === 1 && board.number_pieces[PIECES.BLACKBISHOP] === 1) &&
            (square_color(board.piece_list[PIECE_INDEX(PIECES.WHITEBISHOP, 0)]) !== square_color(board.piece_list[PIECE_INDEX(PIECES.BLACKBISHOP, 0)]))
    }
    function scale_factor(eg) {//--white point of view
        let sf = 64;
        let pos_w = eg > 0 ? board.turn : board.turn^1;
        let pos_b = eg > 0 ? board.turn^1 : board.turn;

        let pc_white = board.number_pieces[(pos_w === COLORS.WHITE)? PIECES.WHITEPAWN: PIECES.BLACKPAWN];
        let pc_black = board.number_pieces[(pos_b === COLORS.WHITE)? PIECES.WHITEPAWN: PIECES.BLACKPAWN];
        let npm_white = board.material_mg[pos_w] - get_value_piece[PHASE.MIDDLE_GAME][PIECES.WHITEKING] - get_value_piece[PHASE.MIDDLE_GAME][pos_w]*pc_white;
        let npm_black = board.material_mg[pos_b] - get_value_piece[PHASE.MIDDLE_GAME][PIECES.BLACKKING] - get_value_piece[PHASE.MIDDLE_GAME][pos_b]*pc_black;

        let bishopValueMg = get_value_piece[PHASE.MIDDLE_GAME][PIECES.WHITEBISHOP];
        let rookValueMg = get_value_piece[PHASE.MIDDLE_GAME][PIECES.WHITEROOK];
        if (pc_white === 0 && npm_white - npm_black <= bishopValueMg) sf = npm_white < rookValueMg ? 0 : npm_black <= bishopValueMg ? 4 : 14;
        if (sf === 64) {
            let ob = +opposite_bishops();
            if (ob && npm_white === bishopValueMg && npm_black === bishopValueMg) {
                sf = 22;
            } else {
                sf = Math.min(sf, 36 + (ob ? 2 : 7) * pc_white);
            }
            //TODO
            let rule50 = board.half_moves;
            sf = Math.max(0, sf - (((rule50 - 12) / 4) << 0));
        }
        return sf;
    }
    function phase() {//-- assume middle game and white perspective
        let mg_limit = 15258;
        let eg_limit = 3915;
        let npm_white = board.material_mg[COLORS.WHITE] - get_value_piece[PHASE.MIDDLE_GAME][PIECES.WHITEKING] - get_value_piece[PHASE.MIDDLE_GAME][PIECES.WHITEPAWN]*board.number_pieces[PIECES.WHITEPAWN];
        let npm_black = board.material_mg[COLORS.BLACK] - get_value_piece[PHASE.MIDDLE_GAME][PIECES.BLACKKING] - get_value_piece[PHASE.MIDDLE_GAME][PIECES.BLACKPAWN]*board.number_pieces[PIECES.BLACKPAWN];
        let npm = npm_black + npm_white;
        npm = Math.max(eg_limit, Math.min(npm, mg_limit));
        return (((npm - eg_limit) * 128) / (mg_limit - eg_limit)) << 0;
    }

    function main_evaluate(){//-- https://hxim.github.io/Stockfish-Evaluation-Guide/
        let eval_result = game_evaluation();
        eval_result.game_phase = phase();
        eval_result.tempo = 28 * ((board.turn === COLORS.WHITE) ? 1 : -1);
        eval_result.endgame *=scale_factor(eval_result.endgame)/64;
        //console.log(imbalance());
        return (((eval_result.middlegame * eval_result.game_phase + ((eval_result.endgame * (128 - eval_result.game_phase)) << 0)) / 128) << 0) + eval_result.tempo;
    }




    /*****************************************************************************
     * SEARCH
     ****************************************************************************/
    let search_info = {
        start_time: 0,
        end_time:  0,
        depth : MAX_DEPTH,
        time_set: false,
        move_to_go: -1,
        infinite: false,
        mate_in: -1,

        nodes: 0,
        max_nodes: -1,
        quit: false,
        stopped: false,

        fail_high: 0,
        fail_high_first: 0,
        null_cutoff: 0,


        use_book: false,

        best_move: NO_MOVE,
        ponder_move: NO_MOVE,
        pondering: false,

        analyzing: true,

    };
    function is_mate_score(score){
        return (Math.abs(Math.abs(score) - CHECKMATE) < MAX_DEPTH);
    }
    function clear_search(){
        for(let i  = 0; i < 13; ++i) {
            for(let j = 0; j < BOARD_SQUARE_NUM; ++j) {
                //board.search_history[i * BOARD_SQUARE_NUM + j] = 0;
            }
        }
        for(let i  = 0; i < 2; ++i) {
            for(let j = 0; j < MAX_DEPTH; ++j) {
                //board.search_killers[i * MAX_DEPTH + j] = 0;
            }
        }

        /*board.trans_table.over_write = 0;
        board.trans_table.hit = 0;
        board.trans_table.cut = 0;*/
        board.ply = 0;

        search_info.stopped = false;
        search_info.nodes = 0;
        search_info.fail_high = 0;
        search_info.fail_high_first = 0;
    }
    function is_repetition(){
        for(let i =  board.history_ply - board.half_moves; i < board.history_ply - 1; ++i){
            if (board.current_position_key === board.history[i].current_position_key){
                return true;
            }
        }
        return false;
    }
    function alpha_beta(alpha, beta, depth, do_null){
        return 100;
    }
    function search(options){
        let in_san = false;
        if(typeof options !== 'undefined'){
            if ('san' in options) in_san = options.san;
        }
        clear_search();
        let result = "";

        let best_move = NO_MOVE;
        let is_mate = false;

        if(search_info.use_book && !search_info.analyzing){
            best_move = book_move();
        }

        if(best_move === NO_MOVE) {
            //-- iterative deepening
            for (let curr_depth = 1; curr_depth <= search_info.depth; ++curr_depth) {

                let bestScore = alpha_beta(-INFINITE, INFINITE, curr_depth, true);

                //-- out of time?
                if (search_info.stopped) {
                    break;
                }

                if (is_mate) {
                    break;
                }

                let num_pv = get_pv_line(curr_depth);
                best_move  = board.trans_array[0];

                if (is_mate_score(bestScore)) {
                    is_mate = true;
                    let mate_in = (bestScore > 0 ? CHECKMATE - bestScore + 1 : -CHECKMATE - bestScore) / 2;
                    result += ("info score mate " +  mate_in.toString());
                }
                else {
                    result += ("info score cp " + bestScore.toString());
                }
                result += (" depth " + curr_depth.toString() + " nodes " +  search_info.nodes.toString());
                result += (" time " + (get_time_ms() - search_info.start_time).toString());
                
                for (let i = 0; i < num_pv; ++i) {
                    result += " ";
                    let move_tmp = board.trans_array[i];
                    result += (in_san)? move_tmp.san: move_tmp.smith;
                    }
                }
                result += '\n';
            }

        result += "bestmove "+ ((in_san)? best_move.san: best_move.smith) + "\n";
        search_info.best_move = best_move;
        search_info.thinkimg = false;
        console.log(result);

        return result;
    }

    /*****************************************************************************
     * start engine and initialize
     ****************************************************************************/
    initialize();
    if (typeof fen_pos === 'undefined') {
        load(START_FEN);
    } else {
        let loaded = load(fen_pos);
        if (!loaded.value){
            let tmp = "\nFenError!\n";
            tmp  += loaded.error;
            tmp += "\nTry Raccoon() or Raccoon('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')";
            console.error(tmp);
        }
    }

    /***************************************************************************
     * PUBLIC API
     **************************************************************************/
    return {
        load: function (fen_pos) {
            return load(fen_pos);
        },
        fen: function (){
           return fen();
        },
        ascii: function (){
           return ascii();
        },
        reset: function () {
            return reset();
        },
        turn: function () {
            return (board.turn === COLORS.WHITE)? 'w': 'b'  ;
        },
        clear: function () {
           return clear();
        },
        moves: function (options) {
            let rlt = [];
            let verbose= false;
            let capture = false;
            if(typeof options !== 'undefined'){
                if ('verbose' in options) verbose = options.verbose;
                if ('capture' in options) capture = options.capture;
            }
            let moves_t_move = generate_moves(capture);
            for(let i  = 0; i <moves_t_move.length; i++){
                let parsed_move = parse_move(moves_t_move[i].move, verbose);
                if((!verbose && (parsed_move !== "")) || (verbose && (parsed_move !==null))){
                    rlt.push(parsed_move);
                }
            }
            return rlt;
        },
        get: function (square) {
            if(square[1].charCodeAt(0) >'8'.charCodeAt(0) || square[1].charCodeAt(0) < '1'.charCodeAt(0)) return null;
            if(square[0].charCodeAt(0) >'h'.charCodeAt(0) || square[0].charCodeAt(0) < 'a'.charCodeAt(0)) return null;

            let sq = FILE_RANK_TO_SQUARE(square[0].charCodeAt(0) - 'a'.charCodeAt(0), square[1].charCodeAt(0)-'1'.charCodeAt(0));
            if (SQUARE_ON_BOARD(sq) && board.pieces[sq] != PIECES.EMPTY){
                return {
                    type: piece_to_ascii[board.pieces[sq]],
                    color: (get_color_piece[board.pieces[sq]] === COLORS.WHITE)? 'w':'b'
                }
            }
            return null;
        },
        put: function (options, square) {
            if(square[1].charCodeAt(0) >'8'.charCodeAt(0) || square[1].charCodeAt(0) < '1'.charCodeAt(0)) return false;
            if(square[0].charCodeAt(0) >'h'.charCodeAt(0) || square[0].charCodeAt(0) < 'a'.charCodeAt(0)) return false;
            let sq = FILE_RANK_TO_SQUARE(square[0].charCodeAt(0) - 'a'.charCodeAt(0), square[1].charCodeAt(0)-'1'.charCodeAt(0));
            let look = (options.color === 'w')? (options.type).toUpperCase(): (options.type).toLowerCase();
            let pce = -1;
            for(let i=0; i< 13; i++){
                if(look === piece_to_ascii[i]){
                    pce = i;
                    break;
                }
            }
            if(pce !== -1){
                if ((pce === PIECES.WHITEKING || pce === PIECES.BLACKKING) && board.number_pieces[pce] > 0){
                    return false;
                }
                add_piece(sq, pce);
                return true;
            }
            return false;
        },
        move: function (move) {//--takes only smith notation for now, SAN TODO
            let move_t;
            if(typeof move === 'string'){
                move_t = smith_to_move(move);
            }
            else if(typeof move === 'object'){
                let tmp = move.from + move.to;
                if('promotion' in move){
                    tmp += move.promotion;
                }
                move_t = smith_to_move(tmp);
            }
            let parsed = parse_move(move_t, true);
            if(make_move(move_t)){
                return parsed;
            }
            return false;
        },
        undo: function () {
           return take_move();
        },
        square_color: function(square){
            if(square[1].charCodeAt(0) >'8'.charCodeAt(0) || square[1].charCodeAt(0) < '1'.charCodeAt(0)) return null;
            if(square[0].charCodeAt(0) >'h'.charCodeAt(0) || square[0].charCodeAt(0) < 'a'.charCodeAt(0)) return null;

            let sq_c = square_color(FILE_RANK_TO_SQUARE(square[0].charCodeAt(0) - 'a'.charCodeAt(0), square[1].charCodeAt(0)-'1'.charCodeAt(0)));
            return (sq_c === COLORS.BLACK)? 'dark' : 'light';
        },
        in_check: function () {
            return in_check();
        },
        in_checkmate: function () {
          return in_checkmate();
        },
        perft_summary: function (depth) {
            return perft_summary(depth);
        },
        eval: function () {
           return main_evaluate();
        },
        mirror_board: function () {
            return mirror_board();
        }



    };
};


//-- export Raccoon object if using node or any other CommonJS compatible environment
if (typeof exports !== 'undefined') exports.Raccoon = Raccoon;
//-- export Chess object for any RequireJS compatible environment
if (typeof define !== 'undefined')
    define(function() {
        return Raccoon;
    });