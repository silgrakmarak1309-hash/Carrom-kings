import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, Piece, TurnPlayer, Vec2, OnlineRoomSession, BoardStyle, PieceStyle } from './types';
import { CarromBoardCanvas } from './components/CarromBoardCanvas';
import { StrikerControlBar } from './components/StrikerControlBar';
import { HUD } from './components/HUD';
import { Dashboard } from './components/Dashboard';
import { ModeSelectModal } from './components/ModeSelectModal';
import { RulesModal } from './components/RulesModal';
import { WinnerPopupModal } from './components/WinnerPopupModal';
import { ProfileModal } from './components/ProfileModal';
import { CustomizeModal } from './components/CustomizeModal';
import { SplashScreen } from './components/SplashScreen';
import {
  BASELINE_LEFT,
  BASELINE_RIGHT,
  P1_STRIKER_Y,
  P2_STRIKER_Y,
  POCKETS,
  PUZZLE_LEVELS,
  createPiece,
  getClassicBoardCoins
} from './utils/carromBoardSetup';
import { updatePhysicsFrame } from './utils/carromPhysics';
import { calculateAIShot } from './utils/carromAI';
import { audio } from './utils/audio';
import { initAdMob, showInterstitialAd } from './utils/admob';
import { AdBanner } from './components/AdBanner';
import { getOnlineSocket } from './services/onlineSocket';
import { DailyRewardModal, getDailyRewardState } from './components/DailyRewardModal';
import { CoinStoreModal } from './components/CoinStoreModal';
import { RotateCcw, Trophy, Sparkles, Frown, ArrowRight, List, Globe, Zap, Smile } from 'lucide-react';

// Helper to find a non-overlapping spot near board center (400, 400) for refunded coins
function findNonOverlappingCenterPos(existingPieces: Piece[], targetRadius: number): Vec2 {
  const activePieces = existingPieces.filter((p) => !p.isPocketed);
  const center = new Vec2(400, 400);

  const isFree = (pos: Vec2) => {
    return activePieces.every((p) => p.pos.dist(pos) >= p.radius + targetRadius + 2);
  };

  if (isFree(center)) return center;

  // Expanding concentric rings around center
  for (let ring = 1; ring <= 15; ring++) {
    const dist = ring * (targetRadius * 2 + 4);
    const count = ring * 6;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      const candidate = new Vec2(400 + Math.cos(angle) * dist, 400 + Math.sin(angle) * dist);
      if (isFree(candidate)) {
        return candidate;
      }
    }
  }

  return center;
}

// Helper to return coins to board at non-overlapping positions
function returnCoinsToBoard(currentPieces: Piece[], coinsToReturn: Piece[]): Piece[] {
  if (coinsToReturn.length === 0) return currentPieces;

  const updatedList = currentPieces.map((p) => ({
    ...p,
    pos: new Vec2(p.pos.x, p.pos.y),
    vel: new Vec2(p.vel.x, p.vel.y)
  }));

  coinsToReturn.forEach((c) => {
    if (!c) return;
    let target = updatedList.find((p) => p.id === c.id || (p.type === c.type && p.type === 'red'));
    if (!target) {
      target = {
        ...c,
        id: c.id || `coin_${c.type}_${Date.now()}`,
        pos: new Vec2(c.pos.x, c.pos.y),
        vel: new Vec2(0, 0),
        isPocketed: false
      };
      updatedList.push(target);
    }
    target.isPocketed = false;
    target.vel = new Vec2(0, 0);
    target.pos = findNonOverlappingCenterPos(
      updatedList.filter((p) => p.id !== target!.id),
      target.radius
    );
  });

  return updatedList;
}

export default function App() {
  // Navigation & View State ('dashboard' or 'game')
  const [viewState, setViewState] = useState<'dashboard' | 'game'>('dashboard');

  // Initialize AdMob SDK on startup
  useEffect(() => {
    initAdMob();
  }, []);

  // Prevent WebView pull-to-refresh on canvas container without breaking button clicks
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === 'CANVAS' && e.cancelable) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Game Setup & Mode State
  const [mode, setMode] = useState<GameMode>('classic');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [onlineSession, setOnlineSession] = useState<OnlineRoomSession | null>(null);
  const [activeReaction, setActiveReaction] = useState<{ emoji: string; senderName: string } | null>(null);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [unlockedPuzzleLevel, setUnlockedPuzzleLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('carrom_unlocked_puzzle');
      return saved ? Math.max(1, parseInt(saved, 10) || 1) : 1;
    } catch {
      return 1;
    }
  });
  const [puzzleShotsTaken, setPuzzleShotsTaken] = useState<number>(0);

  // Scores & Players State
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [p1PendingPenalties, setP1PendingPenalties] = useState<number>(0);
  const [p2PendingPenalties, setP2PendingPenalties] = useState<number>(0);
  const [turn, setTurn] = useState<TurnPlayer>('player1');

  // Derived Online Turn State
  const isMyOnlineTurn = mode === 'online' && onlineSession ? turn === onlineSession.myRole : true;

  // Queen Status State
  const [queenOwner, setQueenOwner] = useState<'none' | 'player1' | 'player2'>('none');
  const [queenCoverNeeded, setQueenCoverNeeded] = useState<boolean>(false);
  const [queenPendingPlayer, setQueenPendingPlayer] = useState<TurnPlayer | null>(null);

  // Physics & Animation State
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Modals & Toast State
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState<boolean>(false);
  const [isCoinStoreOpen, setIsCoinStoreOpen] = useState<boolean>(false);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState<boolean>(() => {
    try {
      return !getDailyRewardState().isClaimedToday;
    } catch {
      return false;
    }
  });

  // Customization Styles State
  const [boardStyle, setBoardStyle] = useState<BoardStyle>(() => {
    try {
      return (localStorage.getItem('carrom_board_style') as BoardStyle) || 'classic_wood';
    } catch {
      return 'classic_wood';
    }
  });

  const [pieceStyle, setPieceStyle] = useState<PieceStyle>(() => {
    try {
      return (localStorage.getItem('carrom_piece_style') as PieceStyle) || 'classic_ivory';
    } catch {
      return 'classic_ivory';
    }
  });

  const handleSelectBoardStyle = (style: BoardStyle) => {
    setBoardStyle(style);
    try {
      localStorage.setItem('carrom_board_style', style);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPieceStyle = (style: PieceStyle) => {
    setPieceStyle(style);
    try {
      localStorage.setItem('carrom_piece_style', style);
    } catch (e) {
      console.error(e);
    }
  };
  const [toastMsg, setToastMsg] = useState<string>('Drag Striker Backward to Aim & Shoot!');
  const [gameOverText, setGameOverText] = useState<string | null>(null);

  // Player Coins Economy State
  const [playerCoins, setPlayerCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('carrom_player_coins');
      return saved !== null ? Math.max(0, parseInt(saved, 10) || 100) : 100;
    } catch {
      return 100;
    }
  });

  const handleAddCoins = useCallback((amount: number) => {
    setPlayerCoins((prev) => {
      const updated = prev + amount;
      try {
        localStorage.setItem('carrom_player_coins', updated.toString());
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  const handleDeductCoins = useCallback((amount: number) => {
    setPlayerCoins((prev) => {
      const updated = Math.max(0, prev - amount);
      try {
        localStorage.setItem('carrom_player_coins', updated.toString());
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  // Profile Image & Name State
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem('carrom_profile_image');
    } catch {
      return null;
    }
  });
  const [profileName, setProfileName] = useState<string>(() => {
    try {
      return localStorage.getItem('carrom_profile_name') || 'Player 1';
    } catch {
      return 'Player 1';
    }
  });

  const handleUpdateProfileImage = (img: string | null) => {
    setProfileImage(img);
    try {
      if (img) {
        localStorage.setItem('carrom_profile_image', img);
      } else {
        localStorage.removeItem('carrom_profile_image');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfileName = (name: string) => {
    setProfileName(name);
    try {
      localStorage.setItem('carrom_profile_name', name);
    } catch (e) {
      console.error(e);
    }
  };

  // Board Pieces State
  const [pieces, setPieces] = useState<Piece[]>([]);
  const piecesRef = useRef<Piece[]>(pieces);
  piecesRef.current = pieces;

  const strikerRef = useRef<Piece>(createPiece(400, P1_STRIKER_Y, 'striker', 'striker_main'));
  const [strikerX, setStrikerX] = useState<number>(400);

  // Track coins pocketed in the current shot
  const shotPocketedRef = useRef<Piece[]>([]);
  const puzzleShotsTakenRef = useRef<number>(0);
  const physicsAnimFrameRef = useRef<number | null>(null);

  // Show Toast Message
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 2800);
  }, []);

  // Initialize Board State for Selected Game Mode
  const initBoard = useCallback((selectedMode: GameMode, puzzleIdx = 0) => {
    if (physicsAnimFrameRef.current !== null) {
      cancelAnimationFrame(physicsAnimFrameRef.current);
      physicsAnimFrameRef.current = null;
    }

    let initialCoins: Piece[] = [];

    if (selectedMode === 'puzzle') {
      const pLevel = PUZZLE_LEVELS[puzzleIdx] || PUZZLE_LEVELS[0];
      initialCoins = pLevel.setupCoins.map((sc, idx) =>
        createPiece(sc.x, sc.y, sc.type, `puzzle_coin_${idx}`)
      );
    } else {
      // Official 19-coin symmetrical center board arrangement
      initialCoins = getClassicBoardCoins();
    }

    shotPocketedRef.current = [];
    piecesRef.current = initialCoins;
    setPieces(initialCoins);
    setP1Score(0);
    setP2Score(0);
    setP1PendingPenalties(0);
    setP2PendingPenalties(0);
    setTurn('player1');
    setQueenOwner('none');
    setQueenCoverNeeded(false);
    setQueenPendingPlayer(null);
    setStrikerX(400);
    setIsPhysicsRunning(false);
    puzzleShotsTakenRef.current = 0;
    setPuzzleShotsTaken(0);
    setGameOverText(null);

    strikerRef.current.pos.set(400, P1_STRIKER_Y);
    strikerRef.current.vel.set(0, 0);
    strikerRef.current.isPocketed = false;

    showToast(
      selectedMode === 'classic'
        ? 'Classic Carrom Match Started!'
        : selectedMode === 'vs_cpu'
        ? 'vs Computer AI Match Started!'
        : selectedMode === 'puzzle'
        ? `${PUZZLE_LEVELS[puzzleIdx].title}`
        : selectedMode === 'online'
        ? 'Online PvP Match Connected!'
        : 'Free Practice Mode'
    );
  }, [showToast]);

  // Initial Load Setup
  useEffect(() => {
    initBoard('classic');
  }, [initBoard]);

  // Evaluate Turn Results after Physics Motion Stops
  const evaluateTurnResult = useCallback(() => {
    const pocketed = shotPocketedRef.current;
    const isStrikerFoul = pocketed.some((p) => p.type === 'striker');
    const pocketedQueen = pocketed.find((p) => p.type === 'red');
    const pocketedWhite = pocketed.filter((p) => p.type === 'white');
    const pocketedBlack = pocketed.filter((p) => p.type === 'black');

    let p1PointsGained = 0;
    let p2PointsGained = 0;
    let extraTurnGranted = false;

    // Track score and queen changes locally in this callback frame to prevent stale closure reads
    let updatedP1Score = p1Score;
    let updatedP2Score = p2Score;
    let currentQueenOwner = queenOwner;

    // --- PUZZLE MODE RULE VALIDATION ---
    if (mode === 'puzzle') {
      const pLevel = PUZZLE_LEVELS[currentPuzzleIndex] || PUZZLE_LEVELS[0];

      // 1. Handle Striker Foul Penalty (Foul = Instant Game Over)
      if (isStrikerFoul) {
        audio.playFoulSound();
        showToast('FOUL! Striker Pocketed ❌');
        updatedP1Score = 0;
        setP1Score(0);

        // Return any coins pocketed during striker foul back to board
        const pocketedCoinsThisShot = pocketed.filter((p) => p.type !== 'striker');
        if (pocketedCoinsThisShot.length > 0) {
          setPieces((prev) => returnCoinsToBoard(prev, pocketedCoinsThisShot));
        }

        strikerRef.current.isPocketed = false;
        strikerRef.current.vel.set(0, 0);

        setGameOverText('TRY AGAIN ❌');
        return;
      }

      // 2. Score Pocketed Coins for Player 1
      let ptsGainedThisShot = 0;
      if (pocketedQueen) ptsGainedThisShot += 30;
      if (pocketedWhite.length > 0) ptsGainedThisShot += pocketedWhite.length * 10;
      if (pocketedBlack.length > 0) ptsGainedThisShot += pocketedBlack.length * 5;

      if (ptsGainedThisShot > 0) {
        updatedP1Score += ptsGainedThisShot;
        showToast(`Score: +${ptsGainedThisShot} Pts!`);
        audio.playPocketSound();
      }

      setP1Score(updatedP1Score);

      let remainingCoinsOnBoard = pieces;
      if (pocketed.length > 0) {
        remainingCoinsOnBoard = pieces.filter((p) => !pocketed.some((pk) => pk.id === p.id));
        setPieces(remainingCoinsOnBoard);
      }

      // 3. Evaluate Single-Shot Goal (Success vs. Instant Game Over)
      const isGoalMet = updatedP1Score >= pLevel.targetScore;

      if (isGoalMet) {
        audio.playVictorySound();
        const puzzleCoinsEarned = pLevel.id * 10;
        handleAddCoins(puzzleCoinsEarned);
        showToast(`Level ${pLevel.id} Cleared! +${puzzleCoinsEarned} Coins Earned! 🪙`);
        const nextLevelId = pLevel.id + 1;
        if (pLevel.id >= 20) {
          setGameOverText(`PUZZLE MASTER COMPLETED! ALL 20 LEVELS CLEARED! 🏆 (+${puzzleCoinsEarned} COINS)`);
        } else {
          setGameOverText(`LEVEL ${pLevel.id} CLEARED! (+${puzzleCoinsEarned} COINS) 🎯`);
          setUnlockedPuzzleLevel((prev) => {
            const newUnlocked = Math.max(prev, nextLevelId);
            try {
              localStorage.setItem('carrom_unlocked_puzzle', newUnlocked.toString());
            } catch {}
            return newUnlocked;
          });
        }
        return;
      }

      // Single shot rule: Goal not met in this 1 attempt -> Instant Game Over / Retry!
      audio.playFoulSound();
      setGameOverText('TRY AGAIN ❌');
      return;
    }

    // --- CLASSIC / VS_CPU / PRACTICE MODE RULE VALIDATION ---
    // Always reset Striker state at end of shot evaluation so it never vanishes
    strikerRef.current.isPocketed = false;
    strikerRef.current.vel.set(0, 0);

    const ownCoinType = turn === 'player1' ? 'white' : 'black';
    const oppCoinType = turn === 'player1' ? 'black' : 'white';

    // 1. Handle Striker Foul Penalty
    if (isStrikerFoul) {
      audio.playFoulSound();

      // Return any coins pocketed during this striker foul shot back to board
      const pocketedCoinsThisShot = pocketed.filter((p) => p.type !== 'striker');
      if (pocketedCoinsThisShot.length > 0) {
        setPieces((prev) => returnCoinsToBoard(prev, pocketedCoinsThisShot));
      }

      // Find previously pocketed coins for active player (excluding coins pocketed on this shot)
      const p1PocketedCoins = pieces.filter(
        (p) => p.isPocketed && !pocketedCoinsThisShot.some((pk) => pk.id === p.id) && (p.type === 'white' || mode === 'practice')
      );
      const p2PocketedCoins = pieces.filter(
        (p) => p.isPocketed && !pocketedCoinsThisShot.some((pk) => pk.id === p.id) && p.type === 'black'
      );
      const activePocketedCoins = turn === 'player1' || mode === 'practice' ? p1PocketedCoins : p2PocketedCoins;

      if (activePocketedCoins.length > 0) {
        // Return 1 of player's previously pocketed coins back to center circle as penalty
        const penaltyCoin = activePocketedCoins[0];
        setPieces((prev) => returnCoinsToBoard(prev, [penaltyCoin]));
        showToast('FOUL! Striker Pocketed. Penalty coin returned to center board!');
      } else {
        // Zero Coins Exception: record 1 pending penalty
        if (turn === 'player1' || mode === 'practice') {
          setP1PendingPenalties((prev) => prev + 1);
        } else {
          setP2PendingPenalties((prev) => prev + 1);
        }
        showToast('FOUL! Striker Pocketed. 1 Pending penalty recorded (0 coins available).');
      }

      // If Queen cover was pending for this player, cover failed -> return Queen to board
      if (queenCoverNeeded && queenPendingPlayer === turn) {
        setQueenCoverNeeded(false);
        setQueenPendingPlayer(null);
        const queenPiece = pieces.find((p) => p.type === 'red');
        if (queenPiece && queenPiece.isPocketed) {
          setPieces((prev) => returnCoinsToBoard(prev, [queenPiece]));
        }
      }

      extraTurnGranted = false;
    } else {
      // 2. Process Pocketed Coins when NO Striker Foul
      const coinsPocketedOnly = pocketed.filter((p) => p.type !== 'striker');

      if (coinsPocketedOnly.length > 0) {
        // Mark pocketed coins as pocketed in board pieces state
        setPieces((prev) =>
          prev.map((p) => {
            if (coinsPocketedOnly.some((pk) => pk.id === p.id)) {
              return { ...p, isPocketed: true, vel: new Vec2(0, 0) };
            }
            return p;
          })
        );

        const ownCoinsPocketed = coinsPocketedOnly.filter(
          (p) => mode === 'practice' || p.type === ownCoinType
        );
        const oppCoinsPocketed = coinsPocketedOnly.filter(
          (p) => mode !== 'practice' && p.type === oppCoinType
        );

        // Resolve Pending Penalties if player has any and pocketed own coin(s)
        const currentPendingPenalties = (turn === 'player1' || mode === 'practice') ? p1PendingPenalties : p2PendingPenalties;
        let coinsToScore = ownCoinsPocketed;

        if (currentPendingPenalties > 0 && ownCoinsPocketed.length > 0) {
          const resolvedCount = Math.min(currentPendingPenalties, ownCoinsPocketed.length);
          if (turn === 'player1' || mode === 'practice') {
            setP1PendingPenalties((prev) => Math.max(0, prev - resolvedCount));
          } else {
            setP2PendingPenalties((prev) => Math.max(0, prev - resolvedCount));
          }

          const penaltyCoinsToReturn = ownCoinsPocketed.slice(0, resolvedCount);
          coinsToScore = ownCoinsPocketed.slice(resolvedCount);

          // Return penalty coin(s) to board center circle to resolve penalty
          setPieces((prev) => returnCoinsToBoard(prev, penaltyCoinsToReturn));
          showToast(`Penalty Resolved! ${resolvedCount} pocketed coin returned to center circle.`);
        }

        // Queen rules handling
        if (pocketedQueen) {
          if (queenOwner === 'none') {
            if (ownCoinsPocketed.length > 0) {
              // Covered Queen on the SAME SHOT!
              audio.playVictorySound();
              showToast('Queen Covered! (+30 Pts)');
              setQueenOwner(turn);
              currentQueenOwner = turn;
              setQueenCoverNeeded(false);
              setQueenPendingPlayer(null);
              if (turn === 'player1' || mode === 'practice') {
                updatedP1Score += 30;
              } else {
                updatedP2Score += 30;
              }
              extraTurnGranted = true;
            } else {
              // Pocketed Queen alone -> Cover required on next shot!
              audio.playPocketSound();
              showToast('Queen Pocketed! Cover required on next shot!');
              setQueenCoverNeeded(true);
              setQueenPendingPlayer(turn);
              extraTurnGranted = true;
            }
          }
        } else if (queenCoverNeeded && queenPendingPlayer === turn) {
          // Player was attempting to cover Queen from previous shot
          if (ownCoinsPocketed.length > 0) {
            // Successfully covered Queen on this shot!
            audio.playVictorySound();
            showToast('Queen Covered! (+30 Pts)');
            setQueenOwner(turn);
            currentQueenOwner = turn;
            setQueenCoverNeeded(false);
            setQueenPendingPlayer(null);
            if (turn === 'player1' || mode === 'practice') {
              updatedP1Score += 30;
            } else {
              updatedP2Score += 30;
            }
            extraTurnGranted = true;
          } else {
            // Failed to cover Queen -> return Queen to board!
            audio.playFoulSound();
            showToast('Queen Cover Failed! Red Queen returned to board.');
            setQueenCoverNeeded(false);
            setQueenPendingPlayer(null);
            const queenPiece = pieces.find((p) => p.type === 'red');
            if (queenPiece) {
              setPieces((prev) => returnCoinsToBoard(prev, [queenPiece]));
            }
          }
        }

        // Score own coins
        if (coinsToScore.length > 0) {
          audio.playPocketSound();
          extraTurnGranted = true;
          let ownPts = 0;
          coinsToScore.forEach((c) => {
            if (c.type === 'white') ownPts += 10;
            else if (c.type === 'black') ownPts += 5;
            else if (c.type === 'red' && queenOwner === turn) ownPts += 30;
          });

          if (turn === 'player1' || mode === 'practice') {
            updatedP1Score += ownPts;
            showToast(`Player 1: +${ownPts} Pts!`);
          } else {
            updatedP2Score += ownPts;
            showToast(`Player 2: +${ownPts} Pts!`);
          }
        } else if (ownCoinsPocketed.length > 0) {
          // Own coin was pocketed and used to resolve pending penalty -> grant extra turn
          audio.playPocketSound();
          extraTurnGranted = true;
        }

        // Score opponent coins (opponent receives points for their coins pocketed)
        if (oppCoinsPocketed.length > 0) {
          let oppPts = 0;
          oppCoinsPocketed.forEach((c) => {
            if (c.type === 'white') oppPts += 10;
            else if (c.type === 'black') oppPts += 5;
          });

          if (turn === 'player1') {
            updatedP2Score += oppPts;
            showToast(`Opponent Coin Pocketed! P2 +${oppPts} Pts`);
          } else {
            updatedP1Score += oppPts;
            showToast(`Opponent Coin Pocketed! P1 +${oppPts} Pts`);
          }
        }
      } else {
        // No coins pocketed on this shot
        if (queenCoverNeeded && queenPendingPlayer === turn) {
          // Failed to cover Queen
          audio.playFoulSound();
          showToast('Queen Cover Failed! Red Queen returned to board.');
          setQueenCoverNeeded(false);
          setQueenPendingPlayer(null);
          const queenPiece = pieces.find((p) => p.type === 'red');
          if (queenPiece) {
            setPieces((prev) => returnCoinsToBoard(prev, [queenPiece]));
          }
        }
      }
    }

    setP1Score(updatedP1Score);
    setP2Score(updatedP2Score);

    const activePieces = pieces.filter((p) => !p.isPocketed && !pocketed.some((pk) => pk.id === p.id));
    const unpocketedWhite = activePieces.filter((p) => p.type === 'white');
    const unpocketedBlack = activePieces.filter((p) => p.type === 'black');
    const remainingNormalCoins = activePieces.filter((p) => p.type !== 'striker' && p.type !== 'red');
    const boardHasQueen = activePieces.some((p) => p.type === 'red');

    const isPlayer1Finished = unpocketedWhite.length === 0;
    const isPlayer2Finished = unpocketedBlack.length === 0;
    const isBoardCleared = remainingNormalCoins.length === 0;

    if (isPlayer1Finished || isPlayer2Finished || isBoardCleared) {
      if (boardHasQueen && currentQueenOwner === 'none') {
        // FOUL! Pocketed last normal coin without legally covering the Red Queen!
        audio.playFoulSound();
        showToast('FOUL! Cannot pocket last coin before Queen is covered! (-5 Pts)');
        if (turn === 'player1') {
          updatedP1Score = Math.max(0, updatedP1Score - 5);
          setP1Score(updatedP1Score);
        } else {
          updatedP2Score = Math.max(0, updatedP2Score - 5);
          setP2Score(updatedP2Score);
        }

        // Return the last pocketed normal coin back to the board center
        const normalCoinsToReturn = pocketed.filter((p) => p.type === 'white' || p.type === 'black');
        if (normalCoinsToReturn.length > 0) {
          setPieces((prev) => returnCoinsToBoard(prev, normalCoinsToReturn));
        }
        extraTurnGranted = false;
      } else {
        // Valid match completion!
        if (mode === 'vs_cpu') {
          if (updatedP1Score >= updatedP2Score) {
            audio.playVictorySound();
            const reward = aiDifficulty === 'easy' ? 20 : aiDifficulty === 'hard' ? 50 : 35;
            handleAddCoins(reward);
            setGameOverText(`YOU WON! +${reward} COINS EARNED! 🪙`);
          } else {
            audio.playFoulSound();
            setGameOverText('YOU LOST');
          }
        } else if (mode === 'online') {
          if (updatedP1Score >= updatedP2Score) {
            audio.playVictorySound();
            handleAddCoins(40);
            setGameOverText('CARROM KING! YOU WON THE PRIZE POOL 🏆');
          } else {
            audio.playFoulSound();
            setGameOverText('YOU LOST THE MATCH ❌');
          }
        } else {
          audio.playVictorySound();
          handleAddCoins(30);
          const winnerText = updatedP1Score >= updatedP2Score ? 'PLAYER 1 WINS! (+30 COINS) 🏆' : 'PLAYER 2 WINS! (+30 COINS) 🏆';
          setGameOverText(winnerText);
        }
        return;
      }
    }

    // 5. Turn Switch & Online Sync Logic
    const nextTurn = (!extraTurnGranted && mode !== 'practice') ? (turn === 'player1' ? 'player2' : 'player1') : turn;
    if (!extraTurnGranted && mode !== 'practice') {
      setTurn(nextTurn);
      const activeBaselineY = nextTurn === 'player1' ? P1_STRIKER_Y : P2_STRIKER_Y;
      setStrikerX(400);
      strikerRef.current.pos.set(400, activeBaselineY);
    } else {
      // Extra Turn: keep striker on current player's baseline
      const activeBaselineY = turn === 'player1' ? P1_STRIKER_Y : P2_STRIKER_Y;
      setStrikerX(400);
      strikerRef.current.pos.set(400, activeBaselineY);
    }

    if (mode === 'online' && onlineSession && isMyOnlineTurn) {
      getOnlineSocket().emit('sync_board', {
        roomId: onlineSession.roomId,
        pieces: piecesRef.current,
        p1Score: updatedP1Score,
        p2Score: updatedP2Score,
        p1PendingPenalties,
        p2PendingPenalties,
        turn: nextTurn,
        queenOwner: currentQueenOwner,
        queenCoverNeeded,
        queenPendingPlayer,
      });
    }
  }, [turn, queenOwner, queenCoverNeeded, queenPendingPlayer, mode, p1Score, p2Score, p1PendingPenalties, p2PendingPenalties, pieces, currentPuzzleIndex, puzzleShotsTaken, showToast, onlineSession, isMyOnlineTurn]);

  // Main Physics Simulation Loop
  const runPhysicsLoop = useCallback(() => {
    setIsPhysicsRunning(true);
    shotPocketedRef.current = [];

    const allPieces = [...piecesRef.current, strikerRef.current];

    const step = () => {
      const result = updatePhysicsFrame(allPieces, POCKETS);

      if (result.pocketedThisStep.length > 0) {
        result.pocketedThisStep.forEach((p) => {
          if (!shotPocketedRef.current.some((existing) => existing.id === p.id)) {
            shotPocketedRef.current.push(p);
          }
        });
      }

      if (result.isMoving) {
        physicsAnimFrameRef.current = requestAnimationFrame(step);
      } else {
        physicsAnimFrameRef.current = null;
        setIsPhysicsRunning(false);
        evaluateTurnResult();
      }
    };

    physicsAnimFrameRef.current = requestAnimationFrame(step);
  }, [evaluateTurnResult]);

  // Handle Human Player Shot Execution
  const handleTakeShot = (shotVel: Vec2) => {
    if (isPhysicsRunning || !!gameOverText) return;
    if (mode === 'online' && onlineSession && !isMyOnlineTurn) {
      showToast("Wait for opponent's turn!");
      return;
    }

    if (mode === 'puzzle') {
      puzzleShotsTakenRef.current += 1;
      setPuzzleShotsTaken(puzzleShotsTakenRef.current);
    }

    strikerRef.current.vel = shotVel;

    if (mode === 'online' && onlineSession && isMyOnlineTurn) {
      getOnlineSocket().emit('take_shot', {
        roomId: onlineSession.roomId,
        shotVel: { x: shotVel.x, y: shotVel.y },
        strikerX,
      });
    }

    runPhysicsLoop();
  };

  // AI Turn Trigger
  useEffect(() => {
    if (mode === 'vs_cpu' && turn === 'player2' && !isPhysicsRunning && !gameOverText) {
      showToast('Computer is thinking...');
      let shotTimer: ReturnType<typeof setTimeout> | undefined;

      const aiTimer = setTimeout(() => {
        if (gameOverText) return;
        const currentPieces = piecesRef.current;
        const plan = calculateAIShot(currentPieces, POCKETS, 'black', aiDifficulty);
        setStrikerX(plan.strikerX);
        strikerRef.current.pos.set(plan.strikerX, P2_STRIKER_Y);

        shotTimer = setTimeout(() => {
          if (gameOverText) return;
          strikerRef.current.vel = plan.shotVel;
          audio.playStrikerHit(plan.power);
          runPhysicsLoop();
        }, 600);
      }, 800);

      return () => {
        clearTimeout(aiTimer);
        if (shotTimer) clearTimeout(shotTimer);
      };
    }
  }, [mode, turn, isPhysicsRunning, !!gameOverText, aiDifficulty]);

  // Handle Striker Baseline Position Change
  const handleStrikerXChange = (x: number) => {
    if (mode === 'online' && onlineSession && !isMyOnlineTurn) return;
    setStrikerX(x);
    if (mode === 'online' && onlineSession && isMyOnlineTurn) {
      getOnlineSocket().emit('aim_update', {
        roomId: onlineSession.roomId,
        strikerX: x,
      });
    }
  };

  // Socket Event Listeners for Online Mode
  useEffect(() => {
    if (mode !== 'online' || !onlineSession) return;

    const socket = getOnlineSocket();

    const handleOpponentAim = (data: { strikerX: number }) => {
      if (isPhysicsRunning) return;
      setStrikerX(data.strikerX);
      const activeBaselineY = turn === 'player1' ? P1_STRIKER_Y : P2_STRIKER_Y;
      strikerRef.current.pos.set(data.strikerX, activeBaselineY);
    };

    const handleOpponentShot = (data: { shotVel: { x: number; y: number }; strikerX: number }) => {
      if (isPhysicsRunning) return;
      const activeBaselineY = turn === 'player1' ? P1_STRIKER_Y : P2_STRIKER_Y;
      setStrikerX(data.strikerX);
      strikerRef.current.pos.set(data.strikerX, activeBaselineY);
      strikerRef.current.vel = new Vec2(data.shotVel.x, data.shotVel.y);
      audio.playStrikerHit(0.8);
      runPhysicsLoop();
    };

    const handleBoardSynced = (data: {
      pieces: any[];
      p1Score: number;
      p2Score: number;
      p1PendingPenalties?: number;
      p2PendingPenalties?: number;
      turn: TurnPlayer;
      queenOwner: 'none' | 'player1' | 'player2';
      queenCoverNeeded: boolean;
      queenPendingPlayer: TurnPlayer | null;
    }) => {
      const rehydrated = (data.pieces || []).map((p: any) => ({
        ...p,
        pos: new Vec2(p.pos.x, p.pos.y),
        vel: new Vec2(p.vel.x, p.vel.y),
      }));
      setPieces(rehydrated);
      piecesRef.current = rehydrated;
      setP1Score(data.p1Score);
      setP2Score(data.p2Score);
      if (typeof data.p1PendingPenalties === 'number') setP1PendingPenalties(data.p1PendingPenalties);
      if (typeof data.p2PendingPenalties === 'number') setP2PendingPenalties(data.p2PendingPenalties);
      setTurn(data.turn);
      setQueenOwner(data.queenOwner);
      setQueenCoverNeeded(data.queenCoverNeeded);
      setQueenPendingPlayer(data.queenPendingPlayer);

      const activeBaselineY = data.turn === 'player1' ? P1_STRIKER_Y : P2_STRIKER_Y;
      setStrikerX(400);
      strikerRef.current.pos.set(400, activeBaselineY);
    };

    const handleOpponentReaction = (data: { emoji: string; senderName: string }) => {
      setActiveReaction(data);
      audio.playPocketSound();
      setTimeout(() => setActiveReaction(null), 2500);
    };

    const handleOpponentLeft = () => {
      audio.playVictorySound();
      setGameOverText('OPPONENT LEFT THE MATCH! YOU WIN! 🏆');
    };

    socket.on('opponent_aim', handleOpponentAim);
    socket.on('opponent_shot', handleOpponentShot);
    socket.on('board_synced', handleBoardSynced);
    socket.on('opponent_reaction', handleOpponentReaction);
    socket.on('opponent_left', handleOpponentLeft);

    return () => {
      socket.off('opponent_aim', handleOpponentAim);
      socket.off('opponent_shot', handleOpponentShot);
      socket.off('board_synced', handleBoardSynced);
      socket.off('opponent_reaction', handleOpponentReaction);
      socket.off('opponent_left', handleOpponentLeft);
    };
  }, [mode, onlineSession, turn, isPhysicsRunning, runPhysicsLoop]);

  // Handle Mode Change
  const handleSelectMode = (selectedMode: GameMode, puzzleLevelId?: number, session?: OnlineRoomSession) => {
    setMode(selectedMode);
    if (session) {
      setOnlineSession(session);
    } else if (selectedMode !== 'online') {
      setOnlineSession(null);
    }
    if (puzzleLevelId !== undefined) {
      setCurrentPuzzleIndex(puzzleLevelId - 1);
      initBoard(selectedMode, puzzleLevelId - 1);
    } else {
      initBoard(selectedMode);
    }
    setViewState('game');
  };

  // Send Reaction Emoji
  const handleSendReaction = (emoji: string) => {
    if (mode === 'online' && onlineSession) {
      getOnlineSocket().emit('send_reaction', {
        roomId: onlineSession.roomId,
        emoji,
        senderName: profileName,
      });
    }
    setActiveReaction({ emoji, senderName: profileName });
    setTimeout(() => setActiveReaction(null), 2500);
  };

  // Return to Dashboard safely stopping current physics/AI state
  const handleBackToDashboard = useCallback(() => {
    if (mode === 'online' && onlineSession) {
      getOnlineSocket().emit('leave_room', { roomId: onlineSession.roomId });
    }
    if (physicsAnimFrameRef.current !== null) {
      cancelAnimationFrame(physicsAnimFrameRef.current);
      physicsAnimFrameRef.current = null;
    }
    setIsPhysicsRunning(false);
    setGameOverText(null);
    setViewState('dashboard');
    showInterstitialAd();
  }, [mode, onlineSession]);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-between bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {viewState === 'dashboard' ? (
        <div className="w-full h-full overflow-y-auto py-2">
          <Dashboard
            profileImage={profileImage}
            profileName={profileName}
            playerCoins={playerCoins}
            onDeductCoins={handleDeductCoins}
            onAddCoins={handleAddCoins}
            isMuted={isMuted}
            unlockedPuzzleLevel={unlockedPuzzleLevel}
            aiDifficulty={aiDifficulty}
            onSelectDifficulty={setAiDifficulty}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenRules={() => setIsRulesModalOpen(true)}
            onOpenCustomize={() => setIsCustomizeModalOpen(true)}
            onToggleMute={() => {
              setIsMuted(!isMuted);
              audio.isMuted = !isMuted;
            }}
            onSelectMode={handleSelectMode}
            onOpenPuzzleSelector={() => setIsModeModalOpen(true)}
            onOpenDailyReward={() => setIsDailyRewardOpen(true)}
            onOpenCoinStore={() => setIsCoinStoreOpen(true)}
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-between py-2 px-3 overflow-hidden select-none">

          {/* Top HUD Header */}
          <HUD
            p1Score={p1Score}
            p2Score={p2Score}
            p1PendingPenalties={p1PendingPenalties}
            p2PendingPenalties={p2PendingPenalties}
            p1Name={
              mode === 'online' && onlineSession
                ? onlineSession.myRole === 'player1'
                  ? profileName
                  : onlineSession.players.find((p) => p.role === 'player1')?.name || 'Player 1'
                : profileName
            }
            p2Name={
              mode === 'vs_cpu'
                ? 'CPU'
                : mode === 'online' && onlineSession
                ? onlineSession.myRole === 'player2'
                  ? profileName
                  : onlineSession.players.find((p) => p.role === 'player2')?.name || 'Player 2'
                : 'Player 2'
            }
            turn={turn}
            mode={mode}
            queenOwner={queenOwner}
            queenCoverNeeded={queenCoverNeeded}
            isMuted={isMuted}
            playerCoins={playerCoins}
            profileImage={profileImage}
            puzzleLevel={mode === 'puzzle' ? PUZZLE_LEVELS[currentPuzzleIndex] : undefined}
            puzzleShotsLeft={
              mode === 'puzzle'
                ? Math.max(0, (PUZZLE_LEVELS[currentPuzzleIndex]?.allowedShots || 0) - puzzleShotsTaken)
                : undefined
            }
            onToggleMute={() => {
              setIsMuted(!isMuted);
              audio.isMuted = !isMuted;
            }}
            onOpenModeSelect={() => setIsModeModalOpen(true)}
            onOpenRules={() => setIsRulesModalOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onBackToDashboard={handleBackToDashboard}
            onOpenCoinStore={() => setIsCoinStoreOpen(true)}
          />

          {/* Main Game Board Container */}
          <div className="relative flex-1 flex flex-col items-center justify-center w-full max-w-2xl gap-1">
            {/* Online Room Info Banner */}
            {mode === 'online' && onlineSession && (
              <div className="w-full max-w-md px-3 py-1.5 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-500/50 rounded-xl flex items-center justify-between text-xs shadow-lg z-20">
                <div className="flex items-center gap-2 text-indigo-200">
                  <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>
                    ROOM: <strong className="text-amber-400 font-mono tracking-wider">{onlineSession.roomId}</strong>
                  </span>
                </div>
                <div
                  className={`px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase border ${
                    isMyOnlineTurn
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-bounce'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isMyOnlineTurn ? '🎯 YOUR TURN TO SHOOT' : "⏳ OPPONENT'S TURN"}
                </div>
              </div>
            )}

            {/* Top Striker Placement Control Bar for Player 2 in 2-Player Local Mode */}
            {mode === 'classic' && (
              <div className="w-full max-w-md px-2 -mb-1 z-20">
                <StrikerControlBar
                  value={strikerX}
                  onChange={(x) => setStrikerX(x)}
                  disabled={isPhysicsRunning || turn !== 'player2' || !!gameOverText}
                />
              </div>
            )}

            <div className="relative w-full flex items-center justify-center">
              <CarromBoardCanvas
                pieces={pieces}
                striker={strikerRef.current}
                turn={turn}
                isPhysicsRunning={isPhysicsRunning}
                isAiTurn={(mode === 'vs_cpu' && turn === 'player2') || (mode === 'online' && !isMyOnlineTurn)}
                strikerBaselineX={strikerX}
                disabled={!!gameOverText || (mode === 'online' && !isMyOnlineTurn)}
                boardStyle={boardStyle}
                pieceStyle={pieceStyle}
                onStrikerXChange={handleStrikerXChange}
                onTakeShot={handleTakeShot}
              />

              {/* Floating Reaction Overlay */}
              {activeReaction && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <div className="px-5 py-3 bg-slate-900/95 border-2 border-amber-400 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce">
                    <span className="text-5xl">{activeReaction.emoji}</span>
                    <span className="text-xs font-black text-amber-300 mt-1 uppercase tracking-wider">
                      {activeReaction.senderName}
                    </span>
                  </div>
                </div>
              )}

              {/* Floating Toast Notice */}
              {toastMsg && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-900/90 border border-amber-500/60 rounded-full text-xs font-bold text-amber-300 shadow-xl pointer-events-none animate-pulse">
                  {toastMsg}
                </div>
              )}
            </div>

            {/* Bottom Striker Placement Control Bar */}
            <div className="w-full max-w-md px-2 -mt-1 z-20">
              <StrikerControlBar
                value={strikerX}
                onChange={handleStrikerXChange}
                disabled={
                  isPhysicsRunning ||
                  (mode === 'classic' && turn !== 'player1') ||
                  (mode === 'vs_cpu' && turn === 'player2') ||
                  (mode === 'online' && !isMyOnlineTurn) ||
                  !!gameOverText
                }
              />
            </div>

            {/* Quick Emoji Reaction Bar for Gameplay */}
            <div className="flex items-center justify-center gap-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-full px-4 shadow-lg z-20">
              <Smile className="w-4 h-4 text-amber-400" />
              {['🎯', '🔥', '👏', '😱', '😂', '👑'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  className="text-lg hover:scale-125 transition-transform active:scale-95 cursor-pointer p-0.5"
                  title={`Send ${emoji} reaction`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Banner Ad during active gameplay across all modes */}
            <div className="w-full mt-1 flex justify-center shrink-0 z-20">
              <AdBanner />
            </div>
          </div>
        </div>
      )}

      {/* Mode Select Modal */}
      <ModeSelectModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        onSelectMode={handleSelectMode}
        activeMode={mode}
        unlockedPuzzleLevel={unlockedPuzzleLevel}
        currentPuzzleLevelId={currentPuzzleIndex + 1}
      />

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profileImage={profileImage}
        onUpdateProfileImage={handleUpdateProfileImage}
        profileName={profileName}
        onUpdateProfileName={handleUpdateProfileName}
      />

      {/* Customize Board & Piece Styles Modal */}
      <CustomizeModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        activeBoardStyle={boardStyle}
        activePieceStyle={pieceStyle}
        onSelectBoardStyle={handleSelectBoardStyle}
        onSelectPieceStyle={handleSelectPieceStyle}
      />

      {/* Daily Reward Modal */}
      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        onClose={() => setIsDailyRewardOpen(false)}
        playerCoins={playerCoins}
        onClaimReward={(amount) => handleAddCoins(amount)}
      />

      {/* Coin Store Modal */}
      <CoinStoreModal
        isOpen={isCoinStoreOpen}
        onClose={() => setIsCoinStoreOpen(false)}
        playerCoins={playerCoins}
        onAddCoins={handleAddCoins}
        onOpenDailyReward={() => setIsDailyRewardOpen(true)}
      />

      {/* Game Over Result Popup */}
      <WinnerPopupModal
        gameOverText={gameOverText}
        mode={mode}
        p1Score={p1Score}
        p2Score={p2Score}
        currentPuzzleIndex={currentPuzzleIndex}
        onPlayAgain={() => {
          setGameOverText(null);
          showInterstitialAd(() => initBoard(mode, currentPuzzleIndex));
        }}
        onNextLevel={() => {
          setGameOverText(null);
          showInterstitialAd(() => handleSelectMode('puzzle', currentPuzzleIndex + 2));
        }}
        onOpenModeSelect={() => {
          setGameOverText(null);
          showInterstitialAd(() => {
            setViewState('dashboard');
            setIsModeModalOpen(true);
          });
        }}
      />

      {/* Splash / Loading Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    </div>
  );
}
