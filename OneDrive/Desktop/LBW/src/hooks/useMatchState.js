import { useState } from 'react';

export function useMatchState() {
  const [battingTeam, setBattingTeam] = useState('Team A');
  const [bowlingTeam, setBowlingTeam] = useState('Team B');
  const [totalBalls, setTotalBalls] = useState(0);
  const [reviews, setReviews] = useState({ TeamA: 2, TeamB: 2 });

  const recordLegalDelivery = () => {
    setTotalBalls((prev) => prev + 1);
  };

  const burnReview = (team) => {
    setReviews((prevReviews) => {
      const teamKey = team === battingTeam ? 'TeamA' : 'TeamB';
      if (prevReviews[teamKey] > 0) {
        return {
          ...prevReviews,
          [teamKey]: prevReviews[teamKey] - 1,
        };
      }
      return prevReviews;
    });
  };

  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;

  return {
    battingTeam,
    bowlingTeam,
    overs,
    balls,
    reviews,
    recordLegalDelivery,
    burnReview,
    setBattingTeam,
    setBowlingTeam,
  };
}
