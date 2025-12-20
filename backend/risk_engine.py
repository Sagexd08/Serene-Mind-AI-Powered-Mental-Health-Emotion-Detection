class RiskEngine:
    def __init__(self):
        self.emotion_weights = {
            "joy": -10,
            "neutral": 0,
            "sadness": 10,
            "anxiety": 15,
            "stress": 12,
            "anger": 15
        }
        
    def calculate_risk_score(self, emotion_history):
        """
        Calculates a risk score (0-100) based on a list of emotion entries.
        Each entry is a dict: {'emotion': str, 'intensity': float}
        """
        raw_score = 0
        
        if not emotion_history:
            return 0
            
        for entry in emotion_history:
            emo = entry['emotion']
            intensity = entry.get('intensity', 1.0)
            
            weight = self.emotion_weights.get(emo, 0)
            raw_score += weight * intensity
            
        # Normalize roughly to 0-100 scale based on history length
        # Assuming max negative score per entry is 15
        max_possible = len(emotion_history) * 15
        
        if max_possible == 0:
            return 0
            
        normalized_score = (max(0, raw_score) / max_possible) * 100
        return min(100, normalized_score)

    def get_recommendation(self, risk_score):
        if risk_score < 30:
            return {
                "level": "Low",
                "message": "You're doing okay. Keep checking in.",
                "action": "Daily Journaling"
            }
        elif risk_score < 70:
            return {
                "level": "Medium",
                "message": "You seem a bit stressed. Let's take a break.",
                "action": "Breathing Exercise"
            }
        else:
            return {
                "level": "High",
                "message": "It looks like you're going through a tough time.",
                "action": "Talk to a Human"
            }
