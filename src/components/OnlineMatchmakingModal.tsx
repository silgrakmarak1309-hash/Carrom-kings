import React, { useState, useEffect } from 'react';
import { Globe, Users, Play, X, Zap, Shield, Copy, Check, Radio, Award, AlertCircle, Info, Share2, Key, HelpCircle, ChevronDown, ChevronUp, Coins, Plus } from 'lucide-react';
import { getOnlineSocket } from '../services/onlineSocket';
import { OnlineRoomSession, OnlineRoomPlayer } from '../types';
import { CrownLogo } from './CrownLogo';

interface OnlineMatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnlineMatch: (session: OnlineRoomSession) => void;
  playerName: string;
  playerImage: string | null;
  playerCoins: number;
  onDeductCoins: (amount: number) => void;
  onAddCoins: (amount: number) => void;
}

export const OnlineMatchmakingModal: React.FC<OnlineMatchmakingModalProps> = ({
  isOpen,
  onClose,
  onStartOnlineMatch,
  playerName,
  playerImage,
  playerCoins,
  onDeductCoins,
  onAddCoins,
}) => {
  const [tab, setTab] = useState<'matchmaking' | 'custom_room' | 'leaderboard'>('matchmaking');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTimer, setSearchTimer] = useState<number>(0);
  const [matchedOpponent, setMatchedOpponent] = useState<{ name: string; avatar: string | null } | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const socket = getOnlineSocket();

    const handleRoomCreated = (data: { roomId: string; role: 'player1' | 'player2'; player: OnlineRoomPlayer }) => {
      setRoomCode(data.roomId);
      setIsCreatingRoom(true);
      setErrorMessage(null);
    };

    const handleMatchSearching = (data: { roomId: string; player: OnlineRoomPlayer }) => {
      setRoomCode(data.roomId);
      setIsSearching(true);
      setErrorMessage(null);
    };

    const handleGameStart = (data: { roomId: string; players: OnlineRoomPlayer[]; startingTurn: 'player1' | 'player2' }) => {
      const myRole = data.players.find((p) => p.socketId === socket.id)?.role || 'player1';
      const opponent = data.players.find((p) => p.socketId !== socket.id);

      if (opponent) {
        setMatchedOpponent({
          name: opponent.name,
          avatar: opponent.image,
        });
      }

      // Deduct 20 Coins entry fee upon starting the live online match
      onDeductCoins(20);

      const session: OnlineRoomSession = {
        roomId: data.roomId,
        myRole,
        players: data.players,
      };

      setTimeout(() => {
        setIsSearching(false);
        setIsCreatingRoom(false);
        setSearchTimer(0);
        onStartOnlineMatch(session);
        onClose();
      }, 1500);
    };

    const handleRoomError = (data: { message: string }) => {
      setErrorMessage(data.message);
      setIsSearching(false);
      setIsCreatingRoom(false);
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('match_searching', handleMatchSearching);
    socket.on('game_start', handleGameStart);
    socket.on('room_error', handleRoomError);

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('match_searching', handleMatchSearching);
      socket.off('game_start', handleGameStart);
      socket.off('room_error', handleRoomError);
    };
  }, [isOpen, onClose, onStartOnlineMatch, onDeductCoins]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching || isCreatingRoom) {
      timer = setInterval(() => {
        setSearchTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchTimer(0);
    }
    return () => clearInterval(timer);
  }, [isSearching, isCreatingRoom]);

  const checkSufficientCoins = (): boolean => {
    if (playerCoins < 20) {
      setErrorMessage(`Insufficient Coins! You need at least 20 Coins to enter Online Multiplayer. (Current Balance: ${playerCoins} Coins)`);
      return false;
    }
    return true;
  };

  const handleStartQuickMatch = () => {
    if (!checkSufficientCoins()) return;
    setErrorMessage(null);
    setIsSearching(true);
    const socket = getOnlineSocket();
    socket.emit('quick_match', { name: playerName, image: playerImage });
  };

  const handleCreateRoom = () => {
    if (!checkSufficientCoins()) return;
    setErrorMessage(null);
    setIsCreatingRoom(true);
    const socket = getOnlineSocket();
    socket.emit('create_room', { name: playerName, image: playerImage });
  };

  const handleJoinRoom = () => {
    if (inputRoomCode.trim().length !== 6) return;
    if (!checkSufficientCoins()) return;
    setErrorMessage(null);
    const socket = getOnlineSocket();
    socket.emit('join_room', {
      roomId: inputRoomCode.trim(),
      name: playerName,
      image: playerImage,
    });
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsSearching(false);
            setIsCreatingRoom(false);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3 pr-8">
          <div className="flex items-center gap-3">
            <CrownLogo size="md" />
            <div>
              <h2 className="text-lg font-black text-amber-300 tracking-tight flex items-center gap-2">
                <span>ONLINE MULTIPLAYER</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Carrom King Real-Time Matchmaking</p>
            </div>
          </div>

          <button
            onClick={() => setShowHowToPlay((prev) => !prev)}
            className="px-2.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
            title="How to Play Online"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Rules</span>
            {showHowToPlay ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Player Wallet & Match Entry Fee Badge */}
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border border-amber-500/50 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Your Balance: <strong className="text-amber-300 font-extrabold text-sm">{playerCoins} Coins</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 rounded-md">
              Entry: 20 Coins
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/90 border border-amber-500/50 px-2 py-0.5 rounded-md">
              Prize: 40 Coins 🏆
            </span>
          </div>
        </div>

        {/* Error / Insufficient Coins Alert Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/90 border border-rose-500/70 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-rose-200 text-xs font-bold shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                onAddCoins(50);
                setErrorMessage(null);
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Claim Free +50 Coins</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-5 text-xs font-bold gap-2">
          <button
            onClick={() => setTab('matchmaking')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'matchmaking'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Quick Match</span>
          </button>
          <button
            onClick={() => setTab('custom_room')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'custom_room'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Private Room</span>
          </button>
          <button
            onClick={() => setTab('leaderboard')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'leaderboard'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Tab Content 1: Quick Matchmaking */}
        {tab === 'matchmaking' && (
          <div className="flex flex-col items-center text-center py-2">
            {!isSearching ? (
              <div className="w-full space-y-4">
                {/* Server Ping / Info Banner */}
                <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Real-Time Socket: <strong className="text-white">Connected</strong></span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    Online
                  </span>
                </div>

                {/* Player Profile Preview vs Online Opponent Slot */}
                <div className="flex items-center justify-around py-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full border-2 border-indigo-400 bg-slate-900 overflow-hidden flex items-center justify-center">
                      {playerImage ? (
                        <img src={playerImage} alt={playerName} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-7 h-7 text-indigo-300" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-200 max-w-[100px] truncate">{playerName}</span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded font-black">
                      YOU (P1/P2)
                    </span>
                  </div>

                  <div className="text-slate-500 font-black text-xl italic">VS</div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-700 bg-slate-900 flex items-center justify-center">
                      <Users className="w-7 h-7 text-slate-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">Real Opponent</span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded font-bold">
                      Waiting...
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleStartQuickMatch}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black rounded-xl text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/50 transition-transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>FIND MATCH NOW</span>
                </button>
              </div>
            ) : (
              /* Searching Animation & Opponent Match Screen */
              <div className="py-8 flex flex-col items-center w-full">
                {!matchedOpponent ? (
                  <>
                    <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
                      <Globe className="w-10 h-10 text-indigo-400" />
                    </div>

                    <h3 className="text-lg font-black text-indigo-300 mb-1">SEARCHING FOR REAL OPPONENT...</h3>
                    <p className="text-xs text-slate-400 mb-4">Waiting for remote player to join room ({searchTimer}s)</p>

                    <button
                      onClick={() => setIsSearching(false)}
                      className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel Search
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl w-full mb-4 flex items-center justify-center gap-3 animate-bounce">
                      <Shield className="w-6 h-6 text-emerald-400" />
                      <span className="text-sm font-black text-emerald-300">OPPONENT CONNECTED! LAUNCHING...</span>
                    </div>

                    <div className="flex items-center justify-around w-full py-4 bg-slate-950 rounded-2xl border border-indigo-500/40">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full border-2 border-indigo-400 bg-slate-900 overflow-hidden">
                          {playerImage ? (
                            <img src={playerImage} alt={playerName} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-7 h-7 text-indigo-300 m-auto" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-200">{playerName}</span>
                      </div>

                      <div className="text-indigo-400 font-black text-2xl animate-pulse">VS</div>

                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-slate-900 overflow-hidden flex items-center justify-center">
                          {matchedOpponent.avatar ? (
                            <img src={matchedOpponent.avatar} alt={matchedOpponent.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-7 h-7 text-amber-300" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-amber-300">{matchedOpponent.name}</span>
                        <span className="text-[10px] text-amber-400 font-extrabold">ONLINE MATCH</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Private Room */}
        {tab === 'custom_room' && (
          <div className="space-y-4 py-2">
            {/* Informative Instruction Card / Banner for Private Room */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-indigo-500/40 rounded-xl text-xs text-indigo-200 space-y-2.5 shadow-lg">
              <div className="flex items-center gap-2 font-black text-amber-300 text-xs uppercase tracking-wider">
                <Share2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Private Room Instructions</span>
              </div>
              <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="pt-0.5 font-medium">Create a room to get a 6-character Room Code.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="pt-0.5 font-medium">
                    Share this code or invite link with your friend so they can join and play with you online.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase mb-2">Create Private Room</h3>
              {roomCode ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-900 border border-indigo-500/50 rounded-lg p-2.5 text-center font-mono font-black text-lg tracking-widest text-indigo-300">
                      {roomCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {isCreatingRoom && !matchedOpponent && (
                    <div className="p-2.5 bg-slate-900 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-300">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        Waiting for friend to join with code ({searchTimer}s)...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleCreateRoom}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Generate Room Code
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase mb-2">Join Friend's Room</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Code"
                  value={inputRoomCode}
                  onChange={(e) => setInputRoomCode(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-center font-mono font-bold text-sm text-white focus:outline-none focus:border-indigo-500 uppercase"
                />
                <button
                  disabled={inputRoomCode.trim().length < 6}
                  onClick={handleJoinRoom}
                  className={`px-4 py-2.5 font-bold rounded-lg text-xs ${
                    inputRoomCode.trim().length === 6
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Leaderboard */}
        {tab === 'leaderboard' && (
          <div className="space-y-2 py-2 max-h-[250px] overflow-y-auto pr-1">
            {[
              { rank: 1, name: 'CarromMaster_X', mmr: '2,840', wins: 342 },
              { rank: 2, name: 'StrikerGod_99', mmr: '2,690', wins: 298 },
              { rank: 3, name: 'QueenHunter', mmr: '2,510', wins: 265 },
              { rank: 4, name: playerName || 'Player 1', mmr: '1,200', wins: 12, isUser: true },
            ].map((p) => (
              <div
                key={p.rank}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  p.isUser
                    ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${
                      p.rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : p.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : p.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {p.rank}
                  </span>
                  <span>{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{p.wins} Wins</span>
                  <span className="text-indigo-400 font-extrabold">{p.mmr} MMR</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
