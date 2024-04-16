package com.example.tictactoe.controller;
import com.example.tictactoe.controller.dto.ConnectRequest;
import com.example.tictactoe.exception.GameNotFoundException;
import com.example.tictactoe.exception.InvalidGameException;
import com.example.tictactoe.exception.InvalidParamException;
import com.example.tictactoe.model.Game;
import com.example.tictactoe.model.GamePlay;
import com.example.tictactoe.model.Player;
import com.example.tictactoe.service.GameService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/game")
@CrossOrigin("*")
public class GameController {
    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/start")
    public ResponseEntity<Game> start(@RequestBody Player player){
        log.info("start game request: {}", player);
        return ResponseEntity.ok(gameService.createGame(player));
    }

    @PostMapping("/connect")
    public ResponseEntity<Game> connect(@RequestBody ConnectRequest connectRequest) throws InvalidParamException, InvalidGameException {
        log.info("connect request: {}", connectRequest);
        return ResponseEntity.ok(gameService.connectToGame(connectRequest.getPlayer(), connectRequest.getGameId()));
    }

    @PostMapping("/connect/random")
    public ResponseEntity<Game> connectRandom(@RequestBody Player player) throws GameNotFoundException {
        log.info("connect random {}", player);
        return ResponseEntity.ok(gameService.connectToRandomGame(player));
    }

    @PostMapping("/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody GamePlay gamePlayRequest) throws InvalidGameException, GameNotFoundException {
        log.info("gameplay: {}", gamePlayRequest);
        Game game = gameService.gamePlay(gamePlayRequest);
        simpMessagingTemplate.convertAndSend("/topic/gameprogress/" + game.getGameId(), game);
        return ResponseEntity.ok(game);
    }
}