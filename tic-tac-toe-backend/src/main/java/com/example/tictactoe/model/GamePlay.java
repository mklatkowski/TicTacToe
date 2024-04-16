package com.example.tictactoe.model;

import lombok.Data;

@Data
public class GamePlay {
    private TicTacToeSymbols type;
    private Integer coordinateX;
    private Integer coordinateY;
    private String gameId;
}