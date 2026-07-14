export const quizData = [
  {
    id: 1,
    difficulty: 'easy',
    question: 'How many players does each team have on the field?',
    options: ['9', '10', '11', '12'],
    correctIndex: 2,
    explanation: 'Each team starts with 11 players on the pitch, including one goalkeeper.'
  },
  {
    id: 2,
    difficulty: 'easy',
    question: 'What color card means a warning?',
    options: ['Yellow', 'Red', 'Green', 'Blue'],
    correctIndex: 0,
    explanation: 'A yellow card is a caution. Two yellow cards in the same match become a sending off.'
  },
  {
    id: 3,
    difficulty: 'easy',
    question: 'What is it called when a player throws the ball back into play from the sideline?',
    options: ['Throw-in', 'Kick-in', 'Corner', 'Goal kick'],
    correctIndex: 0,
    explanation: 'When the whole ball crosses the sideline, play restarts with a throw-in for the other team.'
  },
  {
    id: 4,
    difficulty: 'easy',
    question: 'Which player is allowed to use their hands inside their own penalty box?',
    options: ['Defender', 'Goalkeeper', 'Any player', 'Captain'],
    correctIndex: 1,
    explanation: 'Only the goalkeeper may handle the ball, and only inside their own penalty area.'
  },
  {
    id: 5,
    difficulty: 'easy',
    question: 'What color card means a player is sent off?',
    options: ['Yellow', 'Orange', 'Red', 'Blue'],
    correctIndex: 2,
    explanation: 'A red card sends a player off and their team must continue with one fewer player.'
  },
  {
    id: 6,
    difficulty: 'easy',
    question: 'How many players take a kick at a time during a penalty shootout?',
    options: ['1', '2', '3', '5'],
    correctIndex: 0,
    explanation: 'A shootout is taken one kick at a time, alternating between teams.'
  },
  {
    id: 7,
    difficulty: 'easy',
    question: 'What is it called when the ball fully crosses the goal line between the posts?',
    options: ['Corner', 'Goal', 'Offside', 'Foul'],
    correctIndex: 1,
    explanation: 'It is a goal only when the whole ball crosses the goal line between the posts and under the bar.'
  },
  {
    id: 8,
    difficulty: 'medium',
    question: "A player is offside if, at the moment the ball is played to them, they are...",
    options: [
      "Nearer to the opponent's goal than the ball and second-last defender",
      'Standing in their own half',
      'Running fast',
      'Near the referee'
    ],
    correctIndex: 0,
    explanation: 'Offside depends on position when the ball is played, not when the player receives it.'
  },
  {
    id: 9,
    difficulty: 'medium',
    question: 'What happens after a player receives two yellow cards in one match?',
    options: ['Nothing', 'A red card, sent off', 'A warning', 'A penalty'],
    correctIndex: 1,
    explanation: 'Two cautions in the same match lead to a red card and the player is sent off.'
  },
  {
    id: 10,
    difficulty: 'medium',
    question: 'A direct free kick can be scored straight into the goal without touching another player.',
    options: ['True', 'False', 'Only in extra time', 'Only after a yellow card'],
    correctIndex: 0,
    explanation: 'Direct free kicks can go straight into the opponent’s goal. Indirect free kicks must touch another player.'
  },
  {
    id: 11,
    difficulty: 'medium',
    question: 'Where is the ball placed for a penalty kick?',
    options: ['6 yards', '12 yards', '18 yards', '20 yards'],
    correctIndex: 1,
    explanation: 'The penalty mark is 12 yards from the goal line.'
  },
  {
    id: 12,
    difficulty: 'medium',
    question: 'How long is extra time typically played in a knockout match if scores are level after 90 minutes?',
    options: ['10 mins', '20 mins', '30 mins', '45 mins'],
    correctIndex: 2,
    explanation: 'Extra time is usually two 15-minute halves, for 30 minutes total.'
  },
  {
    id: 13,
    difficulty: 'medium',
    question: 'Choose the area where a throw-in should be taken from after the ball crosses the sideline.',
    options: ['Sideline', 'Penalty spot', 'Center circle', 'Goal mouth'],
    correctIndex: 0,
    type: 'spatial',
    spatial: {
      prompt: 'Throw-ins restart from the touchline.',
      validZone: 'touchline',
      labels: ['Throw-in spot']
    },
    explanation: 'A throw-in is taken from the touchline near where the ball crossed out of play.'
  },
  {
    id: 14,
    difficulty: 'medium',
    question: 'A throw-in is awarded when...',
    options: ['The ball crosses the goal line', 'The ball fully crosses the sideline', 'A foul happens', 'A goal is scored'],
    correctIndex: 1,
    explanation: 'The whole ball must fully cross the sideline before a throw-in is awarded.'
  },
  {
    id: 15,
    difficulty: 'hard',
    question: 'A player is exactly level with the second-last defender when the ball is played - is this offside?',
    options: ['Yes', 'No, must be nearer not level', 'Only in the second half', 'Depends on the referee'],
    correctIndex: 1,
    explanation: 'Level is onside. To be in an offside position, the attacker must be nearer to the goal line.'
  },
  {
    id: 16,
    difficulty: 'hard',
    question: 'Choose the onside attacking position: level with or behind the second-last defender.',
    options: ['Level/behind defender', 'Past the defender', 'Behind the goal', 'In the stand'],
    correctIndex: 0,
    type: 'spatial',
    spatial: {
      prompt: 'Onside means level with or behind the second-last defender.',
      validZone: 'onside',
      labels: ['Defender line', 'Onside zone']
    },
    explanation: 'An attacker level with or behind the second-last defender is not in an offside position.'
  },
  {
    id: 17,
    difficulty: 'hard',
    question: 'Which of these is a DIRECT free kick offense?',
    options: ['Offside', 'Dangerous play', 'Tripping an opponent', 'Goalkeeper delay'],
    correctIndex: 2,
    explanation: 'Tripping an opponent is a direct free kick offense. Offside and dangerous play usually restart indirectly.'
  },
  {
    id: 18,
    difficulty: 'hard',
    question: 'Choose where play restarts if a goalkeeper deliberately handles a teammate’s kicked back-pass inside the box.',
    options: ['Indirect free kick spot', 'Penalty spot', 'Center spot', 'Corner arc'],
    correctIndex: 0,
    type: 'spatial',
    spatial: {
      prompt: 'The restart is an indirect free kick inside the penalty area.',
      validZone: 'penaltyArea',
      labels: ['Penalty area']
    },
    explanation: 'Handling a deliberate kicked back-pass results in an indirect free kick to the opponents from the spot of the offense.'
  },
  {
    id: 19,
    difficulty: 'hard',
    question: 'In a 4-4-2 formation, what does "4-4-2" refer to?',
    options: ['4 forwards, 4 midfielders, 2 defenders', '4 defenders, 4 midfielders, 2 forwards', '4 substitutes, 4 starters, 2 keepers', 'Random numbering'],
    correctIndex: 1,
    explanation: 'Formations are normally listed from defense to attack: defenders, midfielders, then forwards.'
  },
  {
    id: 20,
    difficulty: 'hard',
    question: 'Final shootout: where should you place a firm penalty to beat a keeper who dives early?',
    options: ['Top left corner', 'Straight down the center', 'Top right corner', 'Low middle'],
    correctIndex: 1,
    type: 'penalty',
    penalty: {
      correctTarget: 'center',
      targets: [
        { id: 'topLeft', label: 'Top left', y: 1.36, z: -1.2 },
        { id: 'center', label: 'Center', y: 0.92, z: 0 },
        { id: 'topRight', label: 'Top right', y: 1.36, z: 1.2 },
        { id: 'lowMiddle', label: 'Low middle', y: 0.42, z: 0 }
      ]
    },
    explanation: 'If the keeper commits early to a dive, a composed shot through the center can beat the save.'
  }
];

export const pointValues = {
  easy: 1,
  medium: 2,
  hard: 3
};
